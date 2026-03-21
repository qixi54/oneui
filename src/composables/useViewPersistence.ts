import { ref, readonly, computed } from "vue";
import type { ViewConfig } from "../types";

// ─── Storage Backend Interface ──────────────────────────────────────────────

export interface ViewStorageBackend {
  /** 加载指定表的所有视图 */
  load(tableId: string): Promise<ViewConfig[]>;
  /** 保存/更新视图 */
  save(tableId: string, view: ViewConfig): Promise<void>;
  /** 删除视图 */
  remove(tableId: string, viewId: string): Promise<void>;
}

// ─── localStorage Backend ───────────────────────────────────────────────────

const STORAGE_PREFIX = "oneui-views:";

export function createLocalStorageBackend(): ViewStorageBackend {
  return {
    async load(tableId: string): Promise<ViewConfig[]> {
      try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${tableId}`);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    async save(tableId: string, view: ViewConfig): Promise<void> {
      const views = await this.load(tableId);
      const idx = views.findIndex((v) => v.viewId === view.viewId);
      if (idx >= 0) {
        views[idx] = view;
      } else {
        views.push(view);
      }
      localStorage.setItem(`${STORAGE_PREFIX}${tableId}`, JSON.stringify(views));
    },
    async remove(tableId: string, viewId: string): Promise<void> {
      const views = await this.load(tableId);
      const filtered = views.filter((v) => v.viewId !== viewId);
      localStorage.setItem(`${STORAGE_PREFIX}${tableId}`, JSON.stringify(filtered));
    },
  };
}

// ─── Supabase Backend ───────────────────────────────────────────────────────

export interface SupabaseViewBackendOptions {
  /** Supabase client (最小接口：from().select/insert/update/delete) */
  client: SupabaseViewClientLike;
  /** 存储视图配置的表名，默认 'view_configs' */
  tableName?: string;
}

interface SupabaseMutationResult {
  error: { message: string } | null;
}

interface SupabaseViewRow {
  config: ViewConfig;
}

interface SupabaseViewDeleteBuilder extends PromiseLike<SupabaseMutationResult> {
  eq(column: string, value: string): SupabaseViewDeleteBuilder;
}

interface SupabaseViewQueryBuilder {
  select(columns: string): SupabaseViewQueryBuilder;
  eq(column: string, value: string): SupabaseViewQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): Promise<{
    data: SupabaseViewRow[] | null;
    error: { message: string } | null;
  }>;
  upsert(
    value: Record<string, unknown>,
    options?: { onConflict?: string },
  ): Promise<SupabaseMutationResult>;
  delete(): SupabaseViewDeleteBuilder;
}

interface SupabaseViewClientLike {
  from(table: string): SupabaseViewQueryBuilder;
}

export function createSupabaseBackend(options: SupabaseViewBackendOptions): ViewStorageBackend {
  const tableName = options.tableName ?? "view_configs";
  return {
    async load(tableId: string): Promise<ViewConfig[]> {
      const { data, error } = await options.client
        .from(tableName)
        .select("config")
        .eq("table_id", tableId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row: { config: ViewConfig }) => row.config);
    },
    async save(tableId: string, view: ViewConfig): Promise<void> {
      const { error } = await options.client.from(tableName).upsert(
        {
          table_id: tableId,
          view_id: view.viewId,
          config: view,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "table_id,view_id" },
      );
      if (error) throw new Error(error.message);
    },
    async remove(tableId: string, viewId: string): Promise<void> {
      const { error } = await options.client
        .from(tableName)
        .delete()
        .eq("table_id", tableId)
        .eq("view_id", viewId);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── Composable ─────────────────────────────────────────────────────────────

export interface UseViewPersistenceOptions {
  /** 表 ID */
  tableId: string;
  /** 存储后端，默认 localStorage */
  backend?: ViewStorageBackend;
  /** 默认视图（当没有保存的视图时使用） */
  defaultView?: ViewConfig;
  /** 是否自动加载（默认 true） */
  autoLoad?: boolean;
}

function generateViewId(): string {
  return `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

const DEFAULT_VIEW: ViewConfig = {
  viewId: "__default__",
  viewType: "table",
  name: "全部记录",
  visibleFields: [],
};

export function useViewPersistence(options: UseViewPersistenceOptions) {
  const backend = options.backend ?? createLocalStorageBackend();
  const views = ref<ViewConfig[]>([]);
  const activeViewId = ref<string>(options.defaultView?.viewId ?? "__default__");
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // 当前活跃视图
  const activeView = computed<ViewConfig>(() => {
    return (
      views.value.find((v) => v.viewId === activeViewId.value) ??
      options.defaultView ??
      DEFAULT_VIEW
    );
  });

  // 视图列表（供 UI 渲染）
  const viewList = computed(() =>
    views.value.map((v) => ({ id: v.viewId, name: v.name, type: v.viewType })),
  );

  // ── Load ──
  async function loadViews(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const loaded = await backend.load(options.tableId);
      views.value =
        loaded.length > 0
          ? loaded
          : options.defaultView
            ? [options.defaultView]
            : [{ ...DEFAULT_VIEW }];
      // 如果当前 activeViewId 不在列表中，切换到第一个
      if (!views.value.find((v) => v.viewId === activeViewId.value)) {
        activeViewId.value = views.value[0]?.viewId ?? "__default__";
      }
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  // ── Save current view ──
  async function saveView(config?: Partial<ViewConfig>): Promise<void> {
    const current = activeView.value;
    const updated: ViewConfig = { ...current, ...config };

    // 更新本地状态
    const idx = views.value.findIndex((v) => v.viewId === updated.viewId);
    if (idx >= 0) {
      views.value[idx] = updated;
    } else {
      views.value.push(updated);
    }

    // 持久化
    try {
      await backend.save(options.tableId, updated);
    } catch (e) {
      error.value = e as Error;
    }
  }

  // ── Create new view ──
  async function createView(name: string, baseConfig?: Partial<ViewConfig>): Promise<string> {
    const viewId = generateViewId();
    const newView: ViewConfig = {
      ...activeView.value,
      ...baseConfig,
      viewId,
      name,
    };
    views.value.push(newView);
    activeViewId.value = viewId;

    try {
      await backend.save(options.tableId, newView);
    } catch (e) {
      error.value = e as Error;
    }

    return viewId;
  }

  // ── Delete view ──
  async function deleteView(viewId: string): Promise<void> {
    if (viewId === "__default__") return; // 不允许删除默认视图

    views.value = views.value.filter((v) => v.viewId !== viewId);
    if (activeViewId.value === viewId) {
      activeViewId.value = views.value[0]?.viewId ?? "__default__";
    }

    try {
      await backend.remove(options.tableId, viewId);
    } catch (e) {
      error.value = e as Error;
    }
  }

  // ── Switch view ──
  function switchView(viewId: string): void {
    if (views.value.find((v) => v.viewId === viewId)) {
      activeViewId.value = viewId;
    }
  }

  // ── Duplicate view ──
  async function duplicateView(sourceViewId: string, newName: string): Promise<string> {
    const source = views.value.find((v) => v.viewId === sourceViewId);
    if (!source) return "";
    return createView(newName, { ...source });
  }

  // ── 快捷方法：更新当前视图的某个属性 ──
  function updateActiveView(patch: Partial<ViewConfig>): void {
    const idx = views.value.findIndex((v) => v.viewId === activeViewId.value);
    if (idx >= 0) {
      views.value[idx] = { ...views.value[idx], ...patch };
    }
  }

  // 自动加载
  if (options.autoLoad !== false) {
    loadViews();
  }

  return {
    views: readonly(views),
    activeView,
    activeViewId,
    viewList,
    loading: readonly(loading),
    error: readonly(error),
    loadViews,
    saveView,
    createView,
    deleteView,
    switchView,
    duplicateView,
    updateActiveView,
  };
}
