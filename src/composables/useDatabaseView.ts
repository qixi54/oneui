import { computed, ref, shallowRef, watch, type Ref } from "vue";
import type { DataRecord, SortConfig, TableSchema, ViewConfig } from "../types";
import type {
  DatabaseSchemaEvent,
  DatabaseViewDetailOptions,
  DatabaseViewFetchParams,
  DatabaseViewMode,
  DatabaseViewNavigationOptions,
  DatabaseViewSortState,
  UseDatabaseViewOptions,
  UseDatabaseViewResult,
} from "../contracts/database";

export type {
  DatabaseViewMode,
  DatabaseViewFetchParams,
  DatabaseViewFetchResult,
  DatabaseViewProvider,
  DatabaseSchemaEvent,
  DatabaseViewActions,
  DatabaseViewDetailOptions,
  DatabaseViewNavigationOptions,
  UseDatabaseViewOptions,
  UseDatabaseViewResult,
} from "../contracts/database";

function isRefLike<T>(value: unknown): value is Ref<T> {
  return Boolean(value && typeof value === "object" && "value" in value);
}

function readValue<T>(source: T | Ref<T> | undefined): T | undefined {
  if (source === undefined) return undefined;
  return isRefLike<T>(source) ? source.value : source;
}

function cloneSort(sort?: SortConfig): SortConfig | undefined {
  if (!sort) return undefined;
  return { ...sort };
}

function cloneView(view: ViewConfig): ViewConfig {
  return {
    ...view,
    visibleFields: [...view.visibleFields],
    sorts: view.sorts?.map(cloneSort).filter((item): item is SortConfig => item !== undefined),
    groups: view.groups?.map((group) => ({ ...group })),
    filters: view.filters?.map((filter) => ({ ...filter })),
    aggregations: view.aggregations?.map((aggregation) => ({ ...aggregation })),
    fixedColumns: view.fixedColumns ? [...view.fixedColumns] : undefined,
    galleryCardFields: view.galleryCardFields ? [...view.galleryCardFields] : undefined,
  };
}

function cloneSchema(schema: TableSchema | null | undefined): TableSchema | null {
  if (!schema) return null;
  return {
    ...schema,
    fields: schema.fields.map((field) => ({ ...field })),
    views: (schema.views ?? []).map(cloneView),
  };
}

function normalizeRecords<T extends DataRecord>(records: readonly T[] | T[] | undefined): T[] {
  if (!records) return [];
  return records.map((record) => ({
    ...record,
    fields: { ...record.fields },
  }));
}

function normalizeViews(views: readonly ViewConfig[] | ViewConfig[] | undefined): ViewConfig[] {
  if (!views) return [];
  const seen = new Set<string>();
  const result: ViewConfig[] = [];
  for (const view of views) {
    if (!view?.viewId || seen.has(view.viewId)) continue;
    seen.add(view.viewId);
    result.push(cloneView(view));
  }
  return result;
}

function buildFallbackView(
  schema: TableSchema | null,
  defaultView?: ViewConfig,
  viewId = defaultView?.viewId ?? "__default__",
): ViewConfig {
  const base = defaultView ? cloneView(defaultView) : undefined;
  const visibleFields = base?.visibleFields?.length
    ? [...base.visibleFields]
    : schema?.fields.map((field) => field.id) ?? [];

  return {
    viewId,
    viewType: base?.viewType ?? "table",
    name: base?.name ?? schema?.name ?? "全部记录",
    visibleFields,
    sorts: base?.sorts,
    groups: base?.groups,
    filters: base?.filters,
    aggregations: base?.aggregations,
    fixedColumns: base?.fixedColumns,
    galleryCardFields: base?.galleryCardFields,
  };
}

function mergeViewLayers(
  baseViews: ViewConfig[],
  remoteViews: ViewConfig[],
  localViews: ViewConfig[],
  hiddenViewIds: Set<string>,
): ViewConfig[] {
  const base = baseViews.filter((view) => !hiddenViewIds.has(view.viewId));
  const baseMap = new Map<string, ViewConfig>();
  for (const view of base) {
    baseMap.set(view.viewId, view);
  }

  const remoteMap = new Map<string, ViewConfig>();
  for (const view of remoteViews) {
    if (!hiddenViewIds.has(view.viewId)) {
      remoteMap.set(view.viewId, view);
    }
  }

  const localMap = new Map<string, ViewConfig>();
  for (const view of localViews) {
    if (!hiddenViewIds.has(view.viewId)) {
      localMap.set(view.viewId, view);
    }
  }

  const merged: ViewConfig[] = [];
  const seen = new Set<string>();

  for (const view of base) {
    const next = localMap.get(view.viewId) ?? remoteMap.get(view.viewId) ?? view;
    merged.push(next);
    seen.add(next.viewId);
  }

  for (const view of remoteViews) {
    if (hiddenViewIds.has(view.viewId) || seen.has(view.viewId)) continue;
    merged.push(view);
    seen.add(view.viewId);
  }

  for (const view of localViews) {
    if (hiddenViewIds.has(view.viewId) || seen.has(view.viewId)) continue;
    merged.push(view);
    seen.add(view.viewId);
  }

  return merged;
}

function toSortState(view: ViewConfig | null): DatabaseViewSortState {
  const firstSort = view?.sorts?.[0];
  if (!firstSort) {
    return { field: null, order: null };
  }
  return {
    field: firstSort.fieldId,
    order: firstSort.direction,
  };
}

function hasView(views: ViewConfig[], viewId: string): boolean {
  return views.some((view) => view.viewId === viewId);
}

export function useDatabaseView<T extends DataRecord = DataRecord>(
  options: UseDatabaseViewOptions<T>,
): UseDatabaseViewResult<T> {
  const mode = computed<DatabaseViewMode>(() => {
    if (options.mode) return options.mode;
    if (options.provider?.mode) return options.provider.mode;
    return options.provider?.onFetch ? "provider" : "local";
  });

  const inputSchema = computed(() => cloneSchema(readValue(options.schema) ?? null));
  const inputRecords = computed(() => normalizeRecords(readValue(options.records)));
  const inputViews = computed(() => normalizeViews(readValue(options.views)));

  const providerSchema = ref<TableSchema | null>(null);
  const remoteViews = ref<ViewConfig[]>([]);
  const localViews = ref<ViewConfig[]>([]);
  const hiddenViewIds = ref<Set<string>>(new Set());

  const records = shallowRef<readonly T[]>(inputRecords.value);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const totalCount = ref(records.value.length);
  const page = ref(1);
  const pageSize = ref(options.pageSize ?? 20);
  const selectedRecordId = ref<string | null>(
    options.initialSelectedRecordId !== undefined
      ? options.initialSelectedRecordId
      : (records.value[0]?.id ?? null),
  );
  const activeViewId = ref<string>(options.initialViewId ?? "");
  const providerLoaded = ref(false);
  const requestSeq = ref(0);
  const autoFillSelection = ref(options.initialSelectedRecordId === undefined);

  const effectiveSchema = computed<TableSchema | null>(() => providerSchema.value ?? inputSchema.value);

  const baseViews = computed<ViewConfig[]>(() => {
    const combined = [...(inputSchema.value?.views ?? []), ...inputViews.value];
    const normalized = normalizeViews(combined);
    if (normalized.length > 0) return normalized;
    return [buildFallbackView(inputSchema.value, options.defaultView)];
  });

  const views = computed<ViewConfig[]>(() =>
    mergeViewLayers(baseViews.value, remoteViews.value, localViews.value, hiddenViewIds.value),
  );

  const activeView = computed<ViewConfig>(() => {
    const found = views.value.find((view) => view.viewId === activeViewId.value);
    return found ?? views.value[0] ?? buildFallbackView(effectiveSchema.value, options.defaultView, activeViewId.value || "__default__");
  });

  const selectedRecord = computed<T | null>(() => {
    if (!selectedRecordId.value) return null;
    return (records.value.find((record) => record.id === selectedRecordId.value) ?? null) as T | null;
  });

  const selectedRecordIndex = computed<number>(() => {
    if (!selectedRecordId.value) return -1;
    return records.value.findIndex((record) => record.id === selectedRecordId.value);
  });

  const hasSelectedRecord = computed<boolean>(() => selectedRecordIndex.value >= 0);
  const selectedRecordOrdinal = computed<number | null>(() =>
    hasSelectedRecord.value ? selectedRecordIndex.value + 1 : null,
  );

  const detailOpen = ref(Boolean(options.initialDetailOpen ?? options.initialSelectedRecordId));
  const detailRecord = computed<T | null>(() => (detailOpen.value ? selectedRecord.value : null));

  const viewList = computed(() =>
    views.value.map((view) => ({
      id: view.viewId,
      name: view.name,
      type: view.viewType,
    })),
  );

  const isProviderMode = computed(() => mode.value === "provider" && Boolean(options.provider?.onFetch));
  const isLocalMode = computed(() => !isProviderMode.value);

  function setError(e: unknown) {
    error.value = e instanceof Error ? e : new Error(String(e));
  }

  function getRecordIndex(recordId: string): number {
    return records.value.findIndex((record) => record.id === recordId);
  }

  function getRecordById(recordId: string): T | null {
    return (records.value.find((record) => record.id === recordId) ?? null) as T | null;
  }

  function hasRecord(recordId: string): boolean {
    return getRecordIndex(recordId) >= 0;
  }

  function resolveRecordId(record: T | string | null | undefined): string | null {
    if (record === undefined || record === null) return null;
    return typeof record === "string" ? record : record.id;
  }

  function normalizeActiveViewId() {
    if (!hasView(views.value, activeViewId.value)) {
      activeViewId.value = views.value[0]?.viewId ?? buildFallbackView(effectiveSchema.value, options.defaultView).viewId;
    }
  }

  function normalizeSelectedRecordId() {
    if (!autoFillSelection.value) return;
    if (!selectedRecordId.value || !hasRecord(selectedRecordId.value)) {
      selectedRecordId.value = records.value[0]?.id ?? null;
    }
  }

  function selectRecord(record: T | string | null): void {
    autoFillSelection.value = false;
    selectedRecordId.value = resolveRecordId(record);
  }

  function openRecordDetail(record?: T | string | null): void {
    autoFillSelection.value = false;
    if (record !== undefined) {
      selectedRecordId.value = resolveRecordId(record);
    }
    detailOpen.value = true;
  }

  function closeRecordDetail(options?: DatabaseViewDetailOptions): void {
    detailOpen.value = false;
    if (options?.clearSelection) {
      autoFillSelection.value = false;
      selectedRecordId.value = null;
    }
  }

  function toggleRecordDetail(record?: T | string | null): void {
    if (detailOpen.value) {
      closeRecordDetail();
      return;
    }
    openRecordDetail(record);
  }

  function moveSelectedRecord(delta: 1 | -1, options?: DatabaseViewNavigationOptions): void {
    const total = records.value.length;
    if (total <= 0) return;

    const currentIndex = selectedRecordIndex.value;
    let nextIndex = currentIndex >= 0 ? currentIndex + delta : delta > 0 ? 0 : total - 1;

    if (options?.wrap) {
      nextIndex = (nextIndex + total) % total;
    } else if (nextIndex < 0 || nextIndex >= total) {
      return;
    }

    const nextRecord = records.value[nextIndex];
    if (!nextRecord) return;

    autoFillSelection.value = false;
    selectedRecordId.value = nextRecord.id;
    if (options?.openDetail ?? detailOpen.value) {
      detailOpen.value = true;
    }
  }

  function selectNextRecord(options?: DatabaseViewNavigationOptions): void {
    moveSelectedRecord(1, options);
  }

  function selectPreviousRecord(options?: DatabaseViewNavigationOptions): void {
    moveSelectedRecord(-1, options);
  }

  function upsertLocalView(view: ViewConfig) {
    const next = cloneView(view);
    localViews.value = [...localViews.value.filter((item) => item.viewId !== next.viewId), next];
    hiddenViewIds.value.delete(next.viewId);
    normalizeActiveViewId();
  }

  function removeLocalView(viewId: string) {
    localViews.value = localViews.value.filter((item) => item.viewId !== viewId);
  }

  function hideView(viewId: string) {
    hiddenViewIds.value = new Set([...hiddenViewIds.value, viewId]);
    removeLocalView(viewId);
  }

  async function refresh(): Promise<void> {
    const fetchParams: DatabaseViewFetchParams = {
      tableId: options.tableId,
      schema: effectiveSchema.value,
      view: activeView.value,
      page: page.value,
      pageSize: pageSize.value,
      sort: toSortState(activeView.value),
      selectedRecordId: selectedRecordId.value,
    };

    error.value = null;

    if (options.actions?.onRefresh) {
      try {
        await options.actions.onRefresh();
      } catch (e) {
        setError(e);
        return;
      }
    }

    if (options.provider?.onRefresh) {
      try {
        await options.provider.onRefresh(fetchParams);
      } catch (e) {
        setError(e);
        return;
      }
    }

    if (!isProviderMode.value || !options.provider?.onFetch) {
      records.value = inputRecords.value;
      totalCount.value = records.value.length;
      normalizeSelectedRecordId();
      normalizeActiveViewId();
      providerLoaded.value = false;
      return;
    }

    const currentSeq = requestSeq.value + 1;
    requestSeq.value = currentSeq;
    loading.value = true;
    try {
      const result = await options.provider.onFetch(fetchParams);
      if (requestSeq.value !== currentSeq) return;

      const nextRecords = normalizeRecords((result.records ?? result.data) as readonly T[] | T[] | undefined);
      records.value = nextRecords;
      totalCount.value = result.total ?? nextRecords.length;

      if (result.schema !== undefined) {
        providerSchema.value = cloneSchema(result.schema);
      }
      if (result.views !== undefined && result.views !== null) {
        remoteViews.value = normalizeViews(result.views);
      }
      if (result.activeViewId) {
        activeViewId.value = result.activeViewId;
      }
      if (result.selectedRecordId !== undefined) {
        autoFillSelection.value = false;
        selectedRecordId.value = result.selectedRecordId;
        if (result.selectedRecordId === null) {
          detailOpen.value = false;
        }
      }

      providerLoaded.value = true;
      normalizeActiveViewId();
      normalizeSelectedRecordId();
    } catch (e) {
      if (requestSeq.value === currentSeq) {
        setError(e);
      }
    } finally {
      if (requestSeq.value === currentSeq) {
        loading.value = false;
      }
    }
  }

  function switchView(viewId: string): void {
    if (!hasView(views.value, viewId)) return;
    activeViewId.value = viewId;
    page.value = 1;
    if (isProviderMode.value) {
      void refresh();
    }
  }

  function setActiveViewId(viewId: string): void {
    switchView(viewId);
  }

  async function saveView(config?: Partial<ViewConfig>): Promise<void> {
    const current = activeView.value;
    const updated: ViewConfig = cloneView({
      ...current,
      ...config,
      viewId: current.viewId,
    });

    upsertLocalView(updated);
    try {
      await options.actions?.onSaveView?.(updated);
    } catch (e) {
      setError(e);
    }
  }

  async function createView(name: string, baseConfig?: Partial<ViewConfig>): Promise<string> {
    const viewId = `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const view = cloneView({
      ...activeView.value,
      ...baseConfig,
      viewId,
      name,
    });
    upsertLocalView(view);
    activeViewId.value = viewId;
    page.value = 1;
    try {
      await options.actions?.onSaveView?.(view);
    } catch (e) {
      setError(e);
    }
    return viewId;
  }

  async function deleteView(viewId: string): Promise<void> {
    if (!hasView(views.value, viewId)) return;

    const wasActive = activeViewId.value === viewId;
    const isBaseView = baseViews.value.some((view) => view.viewId === viewId);
    if (isBaseView) {
      hideView(viewId);
    } else {
      removeLocalView(viewId);
    }

    if (wasActive) {
      activeViewId.value = views.value.find((view) => view.viewId !== viewId)?.viewId ?? "";
      normalizeActiveViewId();
    }

    try {
      await options.actions?.onDeleteView?.(viewId);
    } catch (e) {
      setError(e);
    }
  }

  async function duplicateView(sourceViewId: string, newName: string): Promise<string> {
    const source = views.value.find((view) => view.viewId === sourceViewId);
    if (!source) return "";
    return createView(newName, { ...source });
  }

  function updateActiveView(patch: Partial<ViewConfig>): void {
    const updated = cloneView({
      ...activeView.value,
      ...patch,
      viewId: activeView.value.viewId,
    });
    upsertLocalView(updated);
  }

  function setSelectedRecord(record: T | string | null): void {
    selectRecord(record);
    if (selectedRecordId.value === null) {
      detailOpen.value = false;
    }
  }

  function clearSelectedRecord(): void {
    autoFillSelection.value = false;
    selectedRecordId.value = null;
    detailOpen.value = false;
  }

  function setPage(nextPage: number): void {
    page.value = Math.max(1, Math.floor(nextPage) || 1);
    if (isProviderMode.value) {
      void refresh();
    }
  }

  function setPageSize(nextPageSize: number): void {
    pageSize.value = Math.max(1, Math.floor(nextPageSize) || 1);
    page.value = 1;
    if (isProviderMode.value) {
      void refresh();
    }
  }

  async function emitCellEdit(payload: { rowId: string; fieldId: string; value: unknown }): Promise<void> {
    try {
      await options.actions?.onCellEdit?.(payload);
    } catch (e) {
      setError(e);
    }
  }

  async function emitSchemaEvent(event: DatabaseSchemaEvent): Promise<void> {
    try {
      await options.actions?.onSchemaEvent?.(event);
    } catch (e) {
      setError(e);
    }
  }

  function setRecords(next: readonly T[] | T[]): void {
    const normalized = normalizeRecords(next);
    records.value = normalized;
    totalCount.value = normalized.length;
    normalizeSelectedRecordId();
  }

  watch(
    inputRecords,
    (next) => {
      if (isProviderMode.value && providerLoaded.value) return;
      records.value = next;
      totalCount.value = next.length;
      normalizeSelectedRecordId();
    },
    { immediate: true },
  );

  watch(
    baseViews,
    () => {
      normalizeActiveViewId();
    },
    { immediate: true, deep: true },
  );

  watch(
    selectedRecord,
    () => {
      void options.actions?.onSelectRecord?.(selectedRecord.value);
    },
    { immediate: true, deep: false, flush: "sync" },
  );

  if (options.autoLoad !== false) {
    void refresh();
  } else {
    normalizeActiveViewId();
    normalizeSelectedRecordId();
  }

  return {
    tableId: options.tableId,
    mode,
    schema: effectiveSchema,
    records,
    views,
    activeViewId,
    activeView,
    selectedRecordId,
    selectedRecord,
    selectedRecordIndex,
    selectedRecordOrdinal,
    hasSelectedRecord,
    detailOpen,
    detailRecord,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    viewList,
    isProviderMode,
    isLocalMode,
    refresh,
    getRecordById,
    getRecordIndex,
    selectRecord,
    openRecordDetail,
    closeRecordDetail,
    toggleRecordDetail,
    selectNextRecord,
    selectPreviousRecord,
    switchView,
    setActiveViewId,
    createView,
    saveView,
    deleteView,
    duplicateView,
    updateActiveView,
    setSelectedRecord,
    clearSelectedRecord,
    setPage,
    setPageSize,
    emitCellEdit,
    emitSchemaEvent,
    setRecords,
  };
}
