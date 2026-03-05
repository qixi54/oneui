import { ref, computed, readonly } from "vue";

export type SortOrder = "asc" | "desc" | null;

export interface SortState {
  field: string | null;
  order: SortOrder;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface UseTableOptions<T> {
  data?: T[];
  pageSize?: number;
  /** 服务端分页模式：开启后 filterData/sortData 不在客户端处理 */
  serverSide?: boolean;
  /** 服务端模式下，分页/排序变化时回调 */
  onFetch?: (params: {
    page: number;
    pageSize: number;
    sort: SortState;
  }) => Promise<{ data: T[]; total: number }>;
}

export function useTable<T extends Record<string, unknown>>(options: UseTableOptions<T> = {}) {
  const rawData = ref<T[]>((options.data ?? []) as T[]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const selectedRows = ref<Set<string | number>>(new Set());

  const sort = ref<SortState>({ field: null, order: null });
  const pagination = ref<PaginationState>({
    page: 1,
    pageSize: options.pageSize ?? 20,
    total: (options.data ?? []).length,
  });

  // ── Sort ──
  function toggleSort(field: string) {
    if (sort.value.field === field) {
      sort.value.order =
        sort.value.order === "asc" ? "desc" : sort.value.order === "desc" ? null : "asc";
      if (sort.value.order === null) sort.value.field = null;
    } else {
      sort.value.field = field;
      sort.value.order = "asc";
    }
    pagination.value.page = 1;
    if (options.serverSide) fetchData();
  }

  function setSort(field: string, order: SortOrder) {
    sort.value = { field, order };
    pagination.value.page = 1;
    if (options.serverSide) fetchData();
  }

  // ── Client-side sort ──
  function sortedData(data: T[]): T[] {
    if (!sort.value.field || !sort.value.order) return data;
    const field = sort.value.field;
    const order = sort.value.order;
    return [...data].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return order === "asc" ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return order === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }

  // ── Pagination ──
  function setPage(page: number) {
    pagination.value.page = Math.max(1, Math.min(page, totalPages.value));
    if (options.serverSide) fetchData();
  }

  function setPageSize(size: number) {
    pagination.value.pageSize = size;
    pagination.value.page = 1;
    if (options.serverSide) fetchData();
  }

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(pagination.value.total / pagination.value.pageSize)),
  );

  // ── Processed data (client-side) ──
  const processedData = computed<T[]>(() => {
    if (options.serverSide) return rawData.value as T[];
    const sorted = sortedData(rawData.value as T[]);
    pagination.value.total = sorted.length;
    const { page, pageSize } = pagination.value;
    return sorted.slice((page - 1) * pageSize, page * pageSize);
  });

  // ── Selection ──
  function getRowKey(row: T, index: number): string | number {
    return (row["id"] as string | number | undefined) ?? index;
  }

  function toggleRowSelection(row: T, index: number) {
    const key = getRowKey(row, index);
    if (selectedRows.value.has(key)) {
      selectedRows.value.delete(key);
    } else {
      selectedRows.value.add(key);
    }
  }

  function toggleSelectAll(allRows: T[]) {
    if (selectedRows.value.size === allRows.length) {
      selectedRows.value.clear();
    } else {
      allRows.forEach((row, i) => selectedRows.value.add(getRowKey(row, i)));
    }
  }

  function isRowSelected(row: T, index: number): boolean {
    return selectedRows.value.has(getRowKey(row, index));
  }

  function clearSelection() {
    selectedRows.value.clear();
  }

  const selectedCount = computed(() => selectedRows.value.size);
  const isAllSelected = computed(
    () => processedData.value.length > 0 && selectedRows.value.size === processedData.value.length,
  );

  // ── Server-side fetch ──
  async function fetchData() {
    if (!options.onFetch) return;
    loading.value = true;
    error.value = null;
    try {
      const result = await options.onFetch({
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        sort: sort.value,
      });
      rawData.value = result.data as T[];
      pagination.value.total = result.total;
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  // ── Refresh ──
  function refresh() {
    if (options.serverSide) {
      fetchData();
    } else {
      pagination.value.page = 1;
    }
  }

  // ── Set data (for external filter results) ──
  function setData(data: T[]) {
    rawData.value = data as T[];
    pagination.value.page = 1;
    if (!options.serverSide) pagination.value.total = data.length;
  }

  return {
    data: processedData,
    rawData: readonly(rawData),
    loading: readonly(loading),
    error: readonly(error),
    sort: readonly(sort),
    pagination: readonly(pagination),
    totalPages,
    selectedRows: readonly(selectedRows),
    selectedCount,
    isAllSelected,
    toggleSort,
    setSort,
    setPage,
    setPageSize,
    toggleRowSelection,
    toggleSelectAll,
    isRowSelected,
    clearSelection,
    refresh,
    fetchData,
    setData,
  };
}
