import { ref, computed, watch, type Ref } from "vue";

export interface UseTableGroupOptions<T> {
  data: Ref<T[]>;
  groupBy: Ref<string | undefined>;
}

export type GroupHeaderItem = {
  __type: 'group-header';
  __groupKey: string;
  __groupCount: number;
  id: string;
};

export type GroupedListItem<T> =
  | (T & { __type: 'data-row' })
  | GroupHeaderItem;

export function useTableGroup<T extends Record<string, any>>(options: UseTableGroupOptions<T>) {
  const collapsedGroups = ref(new Set<string>());

  function toggleGroup(groupKey: string) {
    const next = new Set(collapsedGroups.value);
    if (next.has(groupKey)) next.delete(groupKey);
    else next.add(groupKey);
    collapsedGroups.value = next;
  }

  // Clear collapsed states when grouping field changes
  watch(options.groupBy, () => {
    collapsedGroups.value = new Set();
  });

  const groupedItems = computed<GroupedListItem<T>[]>(() => {
    const rows = options.data.value;
    const field = options.groupBy.value;

    if (!field) {
      return rows.map((r) => ({ ...r, __type: 'data-row' as const }));
    }

    const groupOrder: string[] = [];
    const groups = new Map<string, T[]>();

    for (const row of rows) {
      const raw = row[field];
      const key = raw != null ? String(raw) : '';
      if (!groups.has(key)) {
        groupOrder.push(key);
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    }

    const result: GroupedListItem<T>[] = [];
    const collapsed = collapsedGroups.value;

    for (const key of groupOrder) {
      const groupRows = groups.get(key)!;
      result.push({
        __type: 'group-header',
        __groupKey: key,
        __groupCount: groupRows.length,
        id: `__group__${key}`,
      });
      if (!collapsed.has(key)) {
        for (const row of groupRows) {
          result.push({ ...row, __type: 'data-row' });
        }
      }
    }

    return result;
  });

  function isGroupHeader(item: any): item is GroupHeaderItem {
    return item && item.__type === 'group-header';
  }

  return {
    groupedItems,
    collapsedGroups,
    toggleGroup,
    isGroupHeader,
  };
}
