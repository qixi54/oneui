import { ref, computed, watch, type Ref } from "vue";
import type { AggregationConfig } from "../types";
import { computeAggregations } from "../utils/aggregation";

export interface GroupConfig {
  fieldId: string;
}

export interface UseTableGroupOptions<T> {
  data: Ref<T[]>;
  /** Single groupBy field (backwards-compatible) */
  groupBy?: Ref<string | undefined>;
  /** Multi-level group configs (takes priority over groupBy) */
  groups?: Ref<GroupConfig[] | undefined>;
  /** Aggregation configs applied to each group */
  aggregations?: Ref<AggregationConfig[] | undefined>;
}

export type GroupHeaderItem = {
  __type: "group-header";
  __groupKey: string;
  /** Full path for nested groups, e.g. ['status:done', 'priority:P0'] */
  __groupPath: string[];
  __groupLevel: number;
  __groupCount: number;
  __aggregations?: Record<string, number>;
  id: string;
};

export type GroupedListItem<T> = (T & { __type: "data-row" }) | GroupHeaderItem;

export function useTableGroup<T extends Record<string, unknown>>(options: UseTableGroupOptions<T>) {
  const collapsedGroups = ref(new Set<string>());

  function toggleGroup(groupKey: string) {
    const next = new Set(collapsedGroups.value);
    if (next.has(groupKey)) next.delete(groupKey);
    else next.add(groupKey);
    collapsedGroups.value = next;
  }

  // Resolve effective group configs (backwards-compatible)
  const effectiveGroups = computed<GroupConfig[]>(() => {
    if (options.groups?.value && options.groups.value.length > 0) {
      return options.groups.value;
    }
    const field = options.groupBy?.value;
    if (field) return [{ fieldId: field }];
    return [];
  });

  // Clear collapsed states when grouping config changes
  watch(effectiveGroups, () => {
    collapsedGroups.value = new Set();
  });

  const groupedItems = computed<GroupedListItem<T>[]>(() => {
    const rows = options.data.value;
    const groups = effectiveGroups.value;

    if (groups.length === 0) {
      return rows.map((r) => ({ ...r, __type: "data-row" as const }));
    }

    const aggConfigs = options.aggregations?.value ?? [];
    const collapsed = collapsedGroups.value;
    const result: GroupedListItem<T>[] = [];

    buildGroupLevel(rows, groups, 0, [], collapsed, aggConfigs, result);

    return result;
  });

  function isGroupHeader(item: GroupedListItem<T>): item is GroupHeaderItem {
    return item && item.__type === "group-header";
  }

  return {
    groupedItems,
    collapsedGroups,
    toggleGroup,
    isGroupHeader,
  };
}

// ── Recursive grouping engine ───────────────────────────────────────────────

function buildGroupLevel<T extends Record<string, unknown>>(
  rows: T[],
  groups: GroupConfig[],
  level: number,
  parentPath: string[],
  collapsed: Set<string>,
  aggConfigs: AggregationConfig[],
  result: ((T & { __type: "data-row" }) | GroupHeaderItem)[],
): void {
  const config = groups[level];
  if (!config) {
    // No more grouping levels — output data rows
    for (const row of rows) {
      result.push({ ...row, __type: "data-row" as const });
    }
    return;
  }

  const fieldId = config.fieldId;
  const groupOrder: string[] = [];
  const groupMap = new Map<string, T[]>();

  for (const row of rows) {
    const raw = row[fieldId];
    const key = raw != null ? String(raw) : "";
    if (!groupMap.has(key)) {
      groupOrder.push(key);
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(row);
  }

  const isLastLevel = level === groups.length - 1;

  for (const key of groupOrder) {
    const groupRows = groupMap.get(key)!;
    const path = [...parentPath, `${fieldId}:${key}`];
    const pathKey = path.join("/");

    // Compute aggregations if this is the deepest level, or always for current group
    const aggs =
      aggConfigs.length > 0
        ? computeAggregations(groupRows as Record<string, unknown>[], aggConfigs)
        : undefined;

    const header: GroupHeaderItem = {
      __type: "group-header",
      __groupKey: key,
      __groupPath: path,
      __groupLevel: level,
      __groupCount: groupRows.length,
      __aggregations: aggs,
      id: `__group__${pathKey}`,
    };

    result.push(header);

    if (!collapsed.has(pathKey)) {
      if (isLastLevel) {
        for (const row of groupRows) {
          result.push({ ...row, __type: "data-row" as const });
        }
      } else {
        buildGroupLevel(groupRows, groups, level + 1, path, collapsed, aggConfigs, result);
      }
    }
  }
}
