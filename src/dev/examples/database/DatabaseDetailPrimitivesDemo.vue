<script setup lang="ts">
import { computed, ref } from "vue";
import {
  DatabaseView,
  ThemeScopeScene,
  WorkspaceActivityFeed,
  WorkspaceDetailActionBar,
  WorkspaceDetailPreviewBlock,
} from "../../../index";
import type {
  DataRecord,
  TableSchema,
  ViewConfig,
  WorkspaceActivityItem,
  WorkspaceDetailActionItem,
  WorkspacePreviewItem,
} from "../../../index";

defineOptions({ name: "DatabaseDetailPrimitivesDemo" });

const selectedRecordId = ref<string | null>(null);
const detailSource = ref("notifications");
const actionLog = ref<string[]>([
  "Detail primitives demo ready",
  "Click rows to switch the active record",
]);

const views: ViewConfig[] = [
  {
    viewId: "detail-primitives-table",
    viewType: "table",
    name: "详情原语示例",
    visibleFields: ["title", "status", "priority", "owner", "module", "summary"],
  },
];

const schema: TableSchema = {
  tableId: "database-detail-primitives-demo",
  name: "Database detail primitives demo",
  fields: [
    { id: "title", name: "标题", type: "text", width: 220 },
    {
      id: "status",
      name: "状态",
      type: "select",
      width: 120,
      options: [
        { value: "todo", label: "待处理" },
        { value: "doing", label: "进行中" },
        { value: "done", label: "已完成" },
      ],
    },
    {
      id: "priority",
      name: "优先级",
      type: "select",
      width: 100,
      options: [
        { value: "P0", label: "P0" },
        { value: "P1", label: "P1" },
        { value: "P2", label: "P2" },
      ],
    },
    { id: "owner", name: "负责人", type: "text", width: 120 },
    { id: "module", name: "模块", type: "text", width: 140 },
    { id: "summary", name: "摘要", type: "richtext", width: 320 },
  ],
  views,
};

const records = ref<DataRecord[]>([
  {
    id: "detail-1",
    fields: {
      title: "Task detail contract",
      status: "doing",
      priority: "P1",
      owner: "FE-VUE",
      module: "database",
      summary: "将 detail slots 与 workspace primitives 串成稳定的业务仓消费方式。",
    },
    updatedAt: "2026-03-22",
  },
  {
    id: "detail-2",
    fields: {
      title: "Issue timeline preview",
      status: "todo",
      priority: "P2",
      owner: "ARCH",
      module: "governance",
      summary: "让 notifications / dashboard / list 三种入口共享同一套 detail 内容组织。",
    },
    updatedAt: "2026-03-22",
  },
  {
    id: "detail-3",
    fields: {
      title: "Workspace persistence",
      status: "done",
      priority: "P1",
      owner: "DX",
      module: "workspace",
      summary: "保留 presentation、active record 和 panel width，但不缓存实体真源。",
    },
    updatedAt: "2026-03-22",
  },
]);

const activeRecord = computed(
  () => records.value.find((record) => record.id === selectedRecordId.value) ?? null,
);

function pushLog(message: string) {
  actionLog.value = [message, ...actionLog.value].slice(0, 6);
}

const detailActions = computed<WorkspaceDetailActionItem[]>(() => {
  if (!activeRecord.value) return [];
  return [
    {
      id: `assign-${activeRecord.value.id}`,
      label: "分配",
      tone: "primary",
      onClick: () => pushLog(`assign ${activeRecord.value?.id}`),
    },
    {
      id: `share-${activeRecord.value.id}`,
      label: "分享 deep link",
      tone: "ghost",
      onClick: () => pushLog(`share ${activeRecord.value?.id}`),
    },
    {
      id: `archive-${activeRecord.value.id}`,
      label: "归档",
      tone: "danger",
      onClick: () => pushLog(`archive ${activeRecord.value?.id}`),
    },
  ];
});

const previewItems = computed<WorkspacePreviewItem[]>(() => {
  if (!activeRecord.value) return [];
  return [
    {
      id: `${activeRecord.value.id}-status`,
      label: "状态",
      value: String(activeRecord.value.fields.status ?? "-"),
      tone: "info",
    },
    {
      id: `${activeRecord.value.id}-priority`,
      label: "优先级",
      value: String(activeRecord.value.fields.priority ?? "-"),
      tone: "warning",
    },
    {
      id: `${activeRecord.value.id}-owner`,
      label: "负责人",
      value: String(activeRecord.value.fields.owner ?? "-"),
      tone: "accent",
    },
  ];
});

const activityItems = computed<WorkspaceActivityItem[]>(() => {
  if (!activeRecord.value) return [];
  const recordId = activeRecord.value.id;
  return [
    {
      id: `${recordId}-activity-1`,
      author: "Ada",
      action: "更新了状态",
      content: `${activeRecord.value.fields.status ?? "unknown"} -> visible in shared detail shell`,
      time: "2m ago",
    },
    {
      id: `${recordId}-activity-2`,
      author: "Lin",
      action: "补充了说明",
      content: String(activeRecord.value.fields.summary ?? ""),
      time: "15m ago",
    },
  ];
});

const snippet = computed(
  () => `<DatabaseView table-id="issues" detail-presentation="side-panel">
  <template #actions>
    <WorkspaceDetailActionBar :actions="detailActions" />
  </template>

  <template #preview="{ title, description }">
    <WorkspaceDetailPreviewBlock
      :title="title"
      :content="description"
      :items="previewItems"
    />
  </template>

  <template #activity>
    <WorkspaceActivityFeed :items="activityItems" />
  </template>
</DatabaseView>`,
);
</script>

<template>
  <ThemeScopeScene
    theme="neutral"
    tag="section"
    eyebrow="Database detail"
    title="DatabaseView detail primitives demo"
    description="演示 DatabaseView detail slots 如何接入 WorkspaceDetailActionBar、WorkspaceDetailPreviewBlock 与 WorkspaceActivityFeed。"
  >
    <template #meta>
      <div class="database-detail-primitives__chips">
        <span class="database-detail-primitives__chip">presentation: side-panel</span>
        <span class="database-detail-primitives__chip">source: {{ detailSource }}</span>
        <span class="database-detail-primitives__chip">selected: {{ selectedRecordId ?? "none" }}</span>
        <span class="database-detail-primitives__chip">mode: local</span>
      </div>
    </template>

    <div class="database-detail-primitives__layout">
      <DatabaseView
        table-id="database-detail-primitives-demo"
        mode="local"
        detail-presentation="side-panel"
        current-view-id="detail-primitives-table"
        :schema="schema"
        :views="views"
        :records="records"
        :selected-record-id="selectedRecordId"
        :auto-load="false"
        @update:selected-record-id="selectedRecordId = $event"
      >
        <template #actions>
          <WorkspaceDetailActionBar :actions="detailActions" />
        </template>

        <template #preview="{ title, description }">
          <WorkspaceDetailPreviewBlock
            :title="title"
            subtitle="Structured preview data from the business layer"
            :content="description"
            :items="previewItems"
          />
        </template>

        <template #activity>
          <WorkspaceActivityFeed :items="activityItems" />
        </template>
      </DatabaseView>

      <aside class="database-detail-primitives__aside">
        <div class="database-detail-primitives__panel">
          <h3>Why this demo exists</h3>
          <ul>
            <li>业务仓不必再重复手写 detail action / preview / activity 模板。</li>
            <li>DatabaseView 继续主控 record、presentation 和 workspace 行为。</li>
            <li>slots 只接结构化数据，页面契约更稳定。</li>
          </ul>
        </div>

        <div class="database-detail-primitives__panel">
          <h3>Live log</h3>
          <div class="database-detail-primitives__log">
            <div
              v-for="(entry, index) in actionLog"
              :key="`detail-primitive-log-${index}-${entry}`"
              class="database-detail-primitives__log-item"
            >
              {{ entry }}
            </div>
          </div>
        </div>
      </aside>
    </div>

    <template #footer>
      <pre class="database-detail-primitives__code"><code>{{ snippet }}</code></pre>
    </template>
  </ThemeScopeScene>
</template>

<style scoped>
.database-detail-primitives__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.database-detail-primitives__chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--of-surface-muted, #f8fafc);
  color: var(--of-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
}

.database-detail-primitives__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  align-items: start;
}

.database-detail-primitives__aside {
  display: grid;
  gap: 12px;
}

.database-detail-primitives__panel {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--of-border-subtle, #e2e8f0);
  border-radius: 16px;
  background: var(--of-surface-panel, #fff);
}

.database-detail-primitives__panel h3 {
  margin: 0;
  font-size: 14px;
  color: var(--of-text-primary, #0f172a);
}

.database-detail-primitives__panel ul {
  margin: 0;
  padding-left: 18px;
  color: var(--of-text-secondary, #475569);
  font-size: 13px;
  line-height: 1.6;
}

.database-detail-primitives__log {
  display: grid;
  gap: 8px;
}

.database-detail-primitives__log-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--of-surface-muted, #f8fafc);
  color: var(--of-text-secondary, #475569);
  font-size: 12px;
}

.database-detail-primitives__code {
  margin: 0;
  padding: 16px;
  overflow: auto;
  border-radius: 16px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .database-detail-primitives__layout {
    grid-template-columns: 1fr;
  }
}
</style>
