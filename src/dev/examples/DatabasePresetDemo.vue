<script setup lang="ts">
import { computed, ref } from "vue";
import {
  DatabaseView,
  ThemeScope,
  createDatabaseViewPresetBundle,
} from "../../index";
import type { CellValue, DataRecord, TableSchema, ViewConfig } from "../../index";

defineOptions({ name: "DatabasePresetDemo" });

const themeMode = ref<"neutral" | "ops-console">("ops-console");
const failureMode = ref(false);
const actionLog = ref<string[]>([
  "DatabaseView preset demo ready",
  "Preset bundle drives toast / analytics / optimistic",
]);
const presetRecords = ref<DataRecord[]>([
  {
    id: "preset-1",
    fields: {
      title: "Preset demo shell",
      status: "doing",
      owner: "FE",
      priority: "P1",
    },
  },
  {
    id: "preset-2",
    fields: {
      title: "One-line factory",
      status: "todo",
      owner: "DX",
      priority: "P2",
    },
  },
]);
const snapshots = new Map<string, CellValue>();

const schema: TableSchema = {
  tableId: "preset-db",
  name: "DatabaseView preset demo",
  fields: [
    { id: "title", name: "标题", type: "text" },
    {
      id: "status",
      name: "状态",
      type: "select",
      options: [
        { value: "todo", label: "待处理" },
        { value: "doing", label: "进行中" },
        { value: "done", label: "已完成" },
      ],
    },
    { id: "owner", name: "负责人", type: "user" },
    {
      id: "priority",
      name: "优先级",
      type: "select",
      options: [
        { value: "P0", label: "P0" },
        { value: "P1", label: "P1" },
        { value: "P2", label: "P2" },
      ],
    },
  ],
  views: [],
};

const views: ViewConfig[] = [
  { viewId: "preset-table", viewType: "table", name: "预设表格", visibleFields: ["title", "status", "owner", "priority"] },
];

function pushLog(message: string) {
  actionLog.value = [message, ...actionLog.value].slice(0, 8);
}

function recordKey(rowId: string, fieldId: string) {
  return `${rowId}:${fieldId}`;
}

const presetBundle = createDatabaseViewPresetBundle({
  toast: {
    onSuccess: (message, context) => {
      if (context.action === "cell-edit") pushLog(`toast success: ${message}`);
    },
    onError: (message, context) => {
      if (context.action === "cell-edit") pushLog(`toast error: ${message}`);
    },
  },
  analytics: {
    onEvent: (event) => {
      if (event.action === "cell-edit") pushLog(`analytics ${event.phase}: ${event.action}`);
    },
  },
  optimistic: {
    apply: (context) => {
      if (context.action !== "cell-edit") return;
      const payload = context.payload as { rowId: string; fieldId: string; value: CellValue };
      const record = presetRecords.value.find((item) => item.id === payload.rowId);
      if (!record) return;

      snapshots.set(recordKey(payload.rowId, payload.fieldId), record.fields[payload.fieldId]);
      presetRecords.value = presetRecords.value.map((item) =>
        item.id === payload.rowId
          ? {
              ...item,
              fields: {
                ...item.fields,
                [payload.fieldId]: payload.value,
              } as Record<string, CellValue>,
            }
          : item,
      );
      pushLog(`optimistic apply: ${payload.rowId}.${payload.fieldId}`);
    },
    revert: (context) => {
      if (context.action !== "cell-edit") return;
      const payload = context.payload as { rowId: string; fieldId: string };
      const previous = snapshots.get(recordKey(payload.rowId, payload.fieldId));
      if (previous === undefined) return;

      presetRecords.value = presetRecords.value.map((item) =>
        item.id === payload.rowId
          ? {
              ...item,
              fields: {
                ...item.fields,
                [payload.fieldId]: previous,
              } as Record<string, CellValue>,
            }
          : item,
      );
      pushLog(`optimistic revert: ${payload.rowId}.${payload.fieldId}`);
    },
  },
});

const actions = {
  middleware: presetBundle.middleware,
  onCellEdit: async (payload: { rowId: string; fieldId: string; value: unknown }) => {
    pushLog(`action onCellEdit: ${payload.rowId}.${payload.fieldId}`);
    if (failureMode.value) {
      failureMode.value = false;
      throw new Error("preset demo simulated failure");
    }
    await Promise.resolve();
  },
};

const snippet = computed(() => `<script setup lang="ts">
import {
  createDatabaseViewPresetBundle,
  useDatabaseView,
} from "@oneflowui/ui";

const bundle = createDatabaseViewPresetBundle({
  toast: { onSuccess, onError },
  analytics: { onEvent },
  optimistic: { apply, revert },
});

const view = useDatabaseView({
  tableId: "preset-db",
  actions: {
    middleware: bundle.middleware,
    onCellEdit: saveCellEdit,
  },
});
<\/script>`);

function toggleThemeMode() {
  themeMode.value = themeMode.value === "ops-console" ? "neutral" : "ops-console";
}

function toggleFailureMode() {
  failureMode.value = !failureMode.value;
}

function resetDemo() {
  themeMode.value = "ops-console";
  failureMode.value = false;
  presetRecords.value = [
    {
      id: "preset-1",
      fields: {
        title: "Preset demo shell",
        status: "doing",
        owner: "FE",
        priority: "P1",
      },
    },
    {
      id: "preset-2",
      fields: {
        title: "One-line factory",
        status: "todo",
        owner: "DX",
        priority: "P2",
      },
    },
  ];
  snapshots.clear();
  actionLog.value = [
    "DatabaseView preset demo ready",
    "Preset bundle drives toast / analytics / optimistic",
  ];
}
</script>

<template>
  <section class="database-preset-demo">
    <div class="database-preset-demo__card">
      <div class="database-preset-demo__hero">
        <div>
          <div class="database-preset-demo__eyebrow">Official preset demo</div>
          <h3>DatabaseView preset bundle</h3>
          <p class="database-preset-demo__desc">
            这是一条更短的官方消费路径：用 preset bundle 一次性拿到 toast、analytics 和 optimistic
            middleware，再把 `middleware` 直接传给 DatabaseView。它保留真实的本地更新、回滚和日志链路，
            但不依赖外部后端。
          </p>
        </div>
        <div class="database-preset-demo__chips">
          <span class="database-preset-demo__chip">ThemeScope: {{ themeMode }}</span>
          <span class="database-preset-demo__chip">Preset bundle: middleware + presets</span>
          <span class="database-preset-demo__chip">Failure mode: {{ failureMode ? "armed" : "ready" }}</span>
        </div>
      </div>

      <ThemeScope :theme="themeMode" tag="section" class="database-preset-demo__scope">
        <div class="database-preset-demo__layout">
          <DatabaseView
            table-id="preset-db"
            mode="local"
            :schema="schema"
            :records="presetRecords"
            :views="views"
            current-view-id="preset-table"
            detail-presentation="side-panel"
            :actions="actions"
            :auto-load="false"
          />

          <aside class="database-preset-demo__aside">
            <div class="database-preset-demo__aside-card">
              <div class="database-preset-demo__aside-title">Controls</div>
              <div class="database-preset-demo__control-row">
                <button class="dev-btn" :class="{ 'dev-btn--info': themeMode === 'ops-console' }" @click="toggleThemeMode">
                  toggle ThemeScope
                </button>
                <button class="dev-btn" :class="{ 'dev-btn--warning': failureMode }" @click="toggleFailureMode">
                  {{ failureMode ? "next edit will fail" : "arm failure mode" }}
                </button>
                <button class="dev-btn" @click="resetDemo">reset demo</button>
              </div>
              <ul class="database-preset-demo__list">
                <li>bundle middleware: 直接传给 DatabaseView 的官方入口。</li>
                <li>toast preset: success / error message feed.</li>
                <li>optimistic preset: apply / revert 真实更新 records。</li>
              </ul>
            </div>

            <div class="database-preset-demo__aside-card">
              <div class="database-preset-demo__aside-title">Live log</div>
              <div class="database-preset-demo__log">
                <div
                  v-for="(entry, index) in actionLog"
                  :key="`db-preset-${index}-${entry}`"
                  class="database-preset-demo__log-item"
                >
                  {{ entry }}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </ThemeScope>

      <pre class="database-preset-demo__code"><code>{{ snippet }}</code></pre>
    </div>
  </section>
</template>

<style scoped>
.database-preset-demo {
  margin: 20px 0 28px;
}

.database-preset-demo__card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--of-border-subtle);
  border-radius: 16px;
  background: var(--of-surface-panel);
}

.database-preset-demo__hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.database-preset-demo__eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--of-text-tertiary);
  margin-bottom: 6px;
}

.database-preset-demo__desc {
  margin: 8px 0 0;
  max-width: 720px;
  color: var(--of-text-secondary);
  line-height: 1.6;
}

.database-preset-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.database-preset-demo__chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--of-surface-muted);
  color: var(--of-text-primary);
  font-size: 12px;
  white-space: nowrap;
}

.database-preset-demo__scope {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--of-border-subtle);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
}

.database-preset-demo__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
}

.database-preset-demo__aside {
  display: grid;
  gap: 12px;
}

.database-preset-demo__aside-card {
  padding: 14px;
  border-radius: 14px;
  background: var(--of-surface-elevated);
  border: 1px solid var(--of-border-subtle);
}

.database-preset-demo__aside-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.database-preset-demo__control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.database-preset-demo__list {
  margin: 0;
  padding-left: 18px;
  color: var(--of-text-secondary);
  line-height: 1.7;
}

.database-preset-demo__log {
  display: grid;
  gap: 8px;
  max-height: 240px;
  overflow: auto;
}

.database-preset-demo__log-item {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--of-surface-muted);
  color: var(--of-text-primary);
  font-size: 12px;
}

.database-preset-demo__code {
  margin: 0;
  padding: 16px;
  border-radius: 14px;
  background: var(--of-surface-muted);
  overflow: auto;
}

@media (max-width: 1080px) {
  .database-preset-demo__hero,
  .database-preset-demo__layout {
    display: grid;
    grid-template-columns: 1fr;
  }

  .database-preset-demo__chips {
    justify-content: flex-start;
  }
}
</style>
