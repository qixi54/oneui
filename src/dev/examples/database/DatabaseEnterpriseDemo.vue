<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DatabaseView,
  ThemeScopeScene,
  composeDatabaseViewMiddlewares,
  createDatabaseViewAnalyticsMiddleware,
  createDatabaseViewOptimisticMiddleware,
  createDatabaseViewToastMiddleware,
} from "../../../index";
import type { CellValue, DataRecord, TableSchema, ViewConfig } from "../../../index";

defineOptions({ name: "DatabaseEnterpriseDemo" });

const props = defineProps<{
  schema: TableSchema;
  records: DataRecord[];
  views: ViewConfig[];
}>();

const themeMode = ref<"neutral" | "ops-console">("ops-console");
const failureMode = ref(false);
const actionLog = ref<string[]>([
  "ThemeScopeScene + DatabaseView middleware demo ready",
  "Edit any cell to trigger optimistic apply / revert",
]);
const enterpriseRecords = ref<DataRecord[]>([]);
const snapshots = new Map<string, CellValue>();

function cloneRecords(records: DataRecord[]): DataRecord[] {
  return records.map((record) => ({
    ...record,
    fields: { ...record.fields },
  }));
}

watch(
  () => props.records,
  (records) => {
    enterpriseRecords.value = cloneRecords(records);
  },
  { immediate: true, deep: true },
);

function pushLog(message: string) {
  actionLog.value = [message, ...actionLog.value].slice(0, 8);
}

function recordKey(rowId: string, fieldId: string) {
  return `${rowId}:${fieldId}`;
}

function toggleThemeMode() {
  themeMode.value = themeMode.value === "ops-console" ? "neutral" : "ops-console";
}

function toggleFailureMode() {
  failureMode.value = !failureMode.value;
}

function resetLog() {
  actionLog.value = [
    "manual log reset",
    "ThemeScopeScene + DatabaseView middleware demo ready",
    "Edit any cell to trigger optimistic apply / revert",
  ];
  failureMode.value = false;
}

const actions = {
  middleware: composeDatabaseViewMiddlewares(
    createDatabaseViewToastMiddleware({
      onSuccess: (message, context) => {
        if (context.action === "cell-edit") pushLog(`toast: ${message}`);
      },
      onError: (message, context) => {
        if (context.action === "cell-edit") pushLog(`toast: ${message}`);
      },
    }),
    createDatabaseViewAnalyticsMiddleware({
      onEvent: (event) => {
        if (event.action === "cell-edit") pushLog(`analytics: ${event.phase} ${event.action}`);
      },
    }),
    createDatabaseViewOptimisticMiddleware({
      apply: (context) => {
        if (context.action !== "cell-edit") return;
        const payload = context.payload as { rowId: string; fieldId: string; value: CellValue };
        const record = enterpriseRecords.value.find((item) => item.id === payload.rowId);
        if (!record) return;

        const key = recordKey(payload.rowId, payload.fieldId);
        snapshots.set(key, record.fields[payload.fieldId]);
        enterpriseRecords.value = enterpriseRecords.value.map((item) =>
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
        const key = recordKey(payload.rowId, payload.fieldId);
        const previousValue = snapshots.get(key);
        if (previousValue === undefined) return;

        enterpriseRecords.value = enterpriseRecords.value.map((item) =>
          item.id === payload.rowId
            ? {
                ...item,
                fields: {
                  ...item.fields,
                  [payload.fieldId]: previousValue,
                } as Record<string, CellValue>,
              }
            : item,
        );
        snapshots.delete(key);
        pushLog(`optimistic revert: ${payload.rowId}.${payload.fieldId}`);
      },
    }),
  ),
  onCellEdit: async (payload: { rowId: string; fieldId: string; value: unknown }) => {
    pushLog(`action onCellEdit: ${payload.rowId}.${payload.fieldId}`);
    if (failureMode.value) {
      failureMode.value = false;
      throw new Error("模拟后端保存失败");
    }
    await Promise.resolve();
  },
};

const snippet = computed(
  () => `<ThemeScopeScene
  theme="${themeMode.value}"
  tag="section"
  eyebrow="Enterprise composition demo"
  title="ThemeScopeScene + DatabaseView"
  description="局部主题作用域 + 页面壳 + 业务数据区"
>
  <template #meta>
    <span class="database-enterprise__chip">Middleware: toast / analytics / optimistic</span>
  </template>

  <DatabaseView
    table-id="enterprise-db"
    mode="local"
    :schema="schema"
    :records="records"
    :views="views"
    current-view-id="database-table"
    detail-presentation="side-panel"
    :actions="{ middleware }"
  />
</ThemeScopeScene>`,
);
</script>

<template>
  <div class="database-enterprise">
    <ThemeScopeScene
      :theme="themeMode"
      tag="section"
      eyebrow="Enterprise composition demo"
      title="ThemeScopeScene + DatabaseView + middleware presets"
      description="更贴近企业项目的消费方式：ThemeScopeScene 固定局部皮肤，DatabaseView 负责页面壳，middleware 负责 toast、analytics 和 optimistic update。"
      class="database-enterprise__card"
    >
      <template #meta>
        <div class="database-enterprise__chips">
          <span class="database-enterprise__chip">ThemeScope: {{ themeMode }}</span>
          <span class="database-enterprise__chip">Middleware: toast / analytics / optimistic</span>
          <span class="database-enterprise__chip">Failure mode: {{ failureMode ? "armed" : "ready" }}</span>
        </div>
      </template>

      <div class="database-enterprise__scope">
        <div class="database-enterprise__layout">
          <DatabaseView
            table-id="enterprise-db"
            mode="local"
            :schema="schema"
            :records="enterpriseRecords"
            :views="views"
            current-view-id="database-table"
            detail-presentation="side-panel"
            :actions="actions"
            :auto-load="false"
          />

          <aside class="database-enterprise__aside">
            <div class="database-enterprise__aside-card">
              <div class="database-enterprise__aside-title">Controls</div>
              <div class="database-enterprise__control-row">
                <button class="dev-btn" :class="{ 'dev-btn--info': themeMode === 'ops-console' }" @click="toggleThemeMode">
                  toggle ThemeScope
                </button>
                <button class="dev-btn" :class="{ 'dev-btn--warning': failureMode }" @click="toggleFailureMode">
                  {{ failureMode ? "next edit will fail" : "arm failure mode" }}
                </button>
                <button class="dev-btn" @click="resetLog">reset log</button>
              </div>
              <ul class="database-enterprise__list">
                <li>toast preset: success / error message feed.</li>
                <li>analytics preset: action phase and payload trace.</li>
                <li>optimistic preset: apply / revert via local record ref.</li>
              </ul>
            </div>

            <div class="database-enterprise__aside-card">
              <div class="database-enterprise__aside-title">Why it works</div>
              <div class="database-enterprise__stack">
                <div class="database-enterprise__stack-item">
                  <strong>ThemeScope</strong>
                  <span>局部皮肤边界，保证企业页可以和全局主题并存。</span>
                </div>
                <div class="database-enterprise__stack-item">
                  <strong>DatabaseView</strong>
                  <span>统一页面壳，承接 view / record / detail / toolbar 这些页面状态。</span>
                </div>
                <div class="database-enterprise__stack-item">
                  <strong>Middleware composer</strong>
                  <span>把 toast / analytics / optimistic 稳定串起来，业务侧只管接入回调。</span>
                </div>
              </div>
            </div>

            <div class="database-enterprise__aside-card">
              <div class="database-enterprise__aside-title">Live log</div>
              <div class="database-enterprise__log">
                <div
                  v-for="(entry, index) in actionLog"
                  :key="`db-enterprise-${index}-${entry}`"
                  class="database-enterprise__log-item"
                >
                  {{ entry }}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <template #footer>
        <pre class="database-shell__code"><code>{{ snippet }}</code></pre>
      </template>
    </ThemeScopeScene>
  </div>
</template>

<style scoped>
.database-enterprise {
  margin: 20px 0 28px;
}

.database-enterprise__card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-panel-radius);
  background:
    radial-gradient(circle at top right, color-mix(in oklab, var(--of-accent-soft) 24%, transparent), transparent 40%),
    var(--of-shell-database-panel-bg);
}

.database-enterprise__hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.database-enterprise__eyebrow {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--of-color-text-tertiary);
}

.database-enterprise__hero h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--of-color-text-primary);
}

.database-enterprise__desc {
  margin: 8px 0 0;
  max-width: 760px;
  color: var(--of-color-text-secondary);
  line-height: 1.6;
}

.database-enterprise__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.database-enterprise__chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-muted, var(--of-color-bg-hover));
  color: var(--of-text-primary, var(--of-color-text-primary));
  font-size: 12px;
  font-weight: 600;
}

.database-enterprise__scope {
  display: block;
}

.database-enterprise__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
  gap: 16px;
  align-items: start;
}

.database-enterprise__aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.database-enterprise__aside-card {
  padding: 16px;
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-panel-radius);
  background: var(--of-shell-database-panel-bg);
}

.database-enterprise__aside-title {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--of-color-text-primary);
}

.database-enterprise__control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.database-enterprise__list {
  margin: 0;
  padding-left: 18px;
  color: var(--of-color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.database-enterprise__stack {
  display: grid;
  gap: 10px;
}

.database-enterprise__stack-item {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
}

.database-enterprise__stack-item strong {
  font-size: 13px;
  color: var(--of-color-text-primary);
}

.database-enterprise__stack-item span {
  font-size: 12px;
  line-height: 1.5;
  color: var(--of-color-text-secondary);
}

.database-enterprise__log {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.database-enterprise__log-item {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-muted, var(--of-color-bg-hover));
  color: var(--of-color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .database-enterprise__layout {
    grid-template-columns: 1fr;
  }
}
</style>
