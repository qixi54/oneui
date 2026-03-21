import { computed, watch, type ComputedRef, type Ref } from "vue";
import type {
  BulkActionContext,
  BulkActionItem,
  ResolvedBulkActionItem,
} from "../types/data-table";

type ValueRef<T> = Ref<T> | ComputedRef<T>;

export interface UseDataTableSelectionOptions<TRecord extends Record<string, unknown>> {
  rows: ValueRef<TRecord[]>;
  selectedRows: ValueRef<ReadonlySet<string | number>>;
  rowKey: ValueRef<string>;
  selectable: ValueRef<boolean>;
  bulkActionItems: ValueRef<BulkActionItem[] | undefined>;
  showSelectionBar: ValueRef<boolean>;
  emitSelectionChange?: (ids: (string | number)[]) => void;
}

export interface UseDataTableSelectionReturn<TRecord extends Record<string, unknown>> {
  selectedIdsArray: ComputedRef<(string | number)[]>;
  indeterminate: ComputedRef<boolean>;
  selectedDataRows: ComputedRef<TRecord[]>;
  bulkActionContext: ComputedRef<BulkActionContext<TRecord>>;
  resolvedBulkActionItems: ComputedRef<ResolvedBulkActionItem[]>;
  hasSelectionBar: ComputedRef<boolean>;
  handleSelectAll: () => void;
  handleSelect: (id: string | number) => void;
  handleBulkAction: (action: BulkActionItem | ResolvedBulkActionItem) => void;
}

export function useDataTableSelection<TRecord extends Record<string, unknown>>(options: {
  rows: ValueRef<TRecord[]>;
  selectedRows: ValueRef<ReadonlySet<string | number>>;
  rowKey: ValueRef<string>;
  selectable: ValueRef<boolean>;
  bulkActionItems: ValueRef<BulkActionItem[] | undefined>;
  showSelectionBar: ValueRef<boolean>;
  emitSelectionChange?: (ids: (string | number)[]) => void;
  toggleSelectAll: (rows: TRecord[]) => void;
  toggleRowSelection: (row: TRecord, index?: number) => void;
  clearSelection: () => void;
  emitBulkAction?: (payload: { actionKey: string; rowIds: string[]; rows: TRecord[] }) => void;
}): UseDataTableSelectionReturn<TRecord> {
  const selectedIdsArray = computed(() => Array.from(options.selectedRows.value));
  const selectedDataRows = computed(() =>
    options.rows.value.filter((row) =>
      options.selectedRows.value.has(resolveSelectionRowId(row, options.rowKey.value)),
    ),
  );
  const indeterminate = computed(
    () => options.selectedRows.value.size > 0 && options.selectedRows.value.size < options.rows.value.length,
  );
  const bulkActionContext = computed<BulkActionContext<TRecord>>(() => ({
    selectionCount: selectedDataRows.value.length,
    rowIds: selectedDataRows.value.map((row) => resolveSelectionRowId(row, options.rowKey.value)),
    rows: [...selectedDataRows.value],
  }));
  const resolvedBulkActionItems = computed<ResolvedBulkActionItem[]>(() =>
    buildResolvedSelectionActionItems(options.bulkActionItems.value, bulkActionContext.value),
  );
  const hasSelectionBar = computed(
    () => options.showSelectionBar.value && options.selectable.value && options.selectedRows.value.size > 0,
  );

  function handleSelectAll() {
    options.toggleSelectAll(options.rows.value);
  }

  function handleSelect(id: string | number) {
    const row = options.rows.value.find(
      (item) => resolveSelectionRowId(item, options.rowKey.value) === String(id),
    );
    if (row) {
      options.toggleRowSelection(row, 0);
    }
  }

  function handleBulkAction(action: BulkActionItem | ResolvedBulkActionItem) {
    options.emitBulkAction?.({
      actionKey: action.key,
      rowIds: bulkActionContext.value.rowIds,
      rows: bulkActionContext.value.rows,
    });
    if (action.clearSelectionAfter || action.key === "clear-selection") {
      options.clearSelection();
    }
  }

  watch(
    selectedIdsArray,
    (ids) => {
      options.emitSelectionChange?.(ids);
    },
    { immediate: false },
  );

  return {
    selectedIdsArray,
    indeterminate,
    selectedDataRows,
    bulkActionContext,
    resolvedBulkActionItems,
    hasSelectionBar,
    handleSelectAll,
    handleSelect,
    handleBulkAction,
  };
}

function resolveSelectionRowId(row: Record<string, unknown>, rowKey: string): string {
  const value = row[rowKey];
  return value != null ? String(value) : "";
}

function buildResolvedSelectionActionItems<TRecord>(
  customItems: BulkActionItem[] | undefined,
  context: BulkActionContext<TRecord>,
): ResolvedBulkActionItem[] {
  const defaults: BulkActionItem[] = [
    {
      key: "clear-selection",
      label: "清空选择",
      clearSelectionAfter: true,
    },
  ];

  return [...defaults, ...(customItems ?? [])]
    .filter((action) => {
      if (typeof action.visible === "function") {
        return action.visible(context as BulkActionContext<unknown>);
      }
      return action.visible ?? true;
    })
    .map((action) => ({
      ...action,
      resolvedLabel:
        typeof action.label === "function"
          ? action.label(context as BulkActionContext<unknown>)
          : action.label,
      resolvedDisabled:
        typeof action.disabled === "function"
          ? action.disabled(context as BulkActionContext<unknown>)
          : (action.disabled ?? false),
    }));
}
