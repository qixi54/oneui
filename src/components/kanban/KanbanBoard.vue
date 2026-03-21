<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus } from "lucide-vue-next";
import KanbanColumn from "./KanbanColumn.vue";
import QuickAddRow from "./QuickAddRow.vue";
import { buildKanbanColumns, isSelectField } from "../../types";
import type { DataRecord, KanbanColumnData, Task, TableSchema, ViewConfig } from "../../types";

const props = withDefaults(
  defineProps<{
    columns?: KanbanColumnData[];
    records?: DataRecord[];
    schema?: TableSchema;
    view?: ViewConfig;
    kanbanFieldId?: string;
    laneOrder?: string[];
    laneTitles?: Record<string, string>;
    addColumnVisible?: boolean;
  }>(),
  {
    columns: () => [],
    records: () => [],
    schema: undefined,
    view: undefined,
    kanbanFieldId: undefined,
    laneOrder: () => [],
    laneTitles: () => ({}),
    addColumnVisible: false,
  },
);

const emit = defineEmits<{
  "update:columns": [columns: KanbanColumnData[]];
  "add-column": [];
  "card-click": [task: Task];
}>();

// 从 view 中解析配置，props 直传的优先级更高（允许覆盖）
const effectiveKanbanFieldId = computed(
  () => props.kanbanFieldId ?? props.view?.kanbanFieldId ?? "status",
);

// 如果 schema 有 select 字段的 options，自动提取 laneOrder 和 laneTitles
const effectiveLaneOrder = computed(() => {
  if (props.laneOrder && props.laneOrder.length > 0) return props.laneOrder;
  if (props.schema) {
    const field = props.schema.fields.find((f) => f.id === effectiveKanbanFieldId.value);
    if (field && isSelectField(field)) {
      return field.options.map((o) => o.value);
    }
  }
  return undefined;
});

const effectiveLaneTitles = computed(() => {
  if (props.laneTitles && Object.keys(props.laneTitles).length > 0) return props.laneTitles;
  if (props.schema) {
    const field = props.schema.fields.find((f) => f.id === effectiveKanbanFieldId.value);
    if (field && isSelectField(field)) {
      const titles: Record<string, string> = {};
      for (const opt of field.options) {
        titles[opt.value] = opt.label;
      }
      return titles;
    }
  }
  return undefined;
});

const resolveColumns = () => {
  if (props.columns.length > 0) {
    return structuredClone(props.columns) as KanbanColumnData[];
  }
  if (props.records.length > 0) {
    return buildKanbanColumns(props.records, {
      kanbanFieldId: effectiveKanbanFieldId.value,
      laneOrder: effectiveLaneOrder.value,
      laneTitles: effectiveLaneTitles.value,
    });
  }
  return [];
};

// 本地列副本
const localColumns = ref<KanbanColumnData[]>(resolveColumns());

watch(
  () => [
    props.columns,
    props.records,
    props.kanbanFieldId,
    props.laneOrder,
    props.laneTitles,
    props.view,
    props.schema,
  ],
  () => {
    localColumns.value = resolveColumns();
  },
);

function handleColumnUpdate(updated: KanbanColumnData) {
  const idx = localColumns.value.findIndex((c) => c.id === updated.id);
  if (idx !== -1) {
    const normalizedTasks = updated.tasks.map((task) => ({
      ...task,
      status: updated.id,
    }));
    localColumns.value[idx] = { ...updated, tasks: normalizedTasks };
    emit("update:columns", structuredClone(localColumns.value));
  }
}

function handleAddCard(_columnId: string) {
  // 由父组件处理，此处通过 QuickAddRow submit 处理
}

function handleQuickAdd(columnId: string, title: string) {
  const col = localColumns.value.find((c) => c.id === columnId);
  if (!col) return;
  const newTask: Task = {
    id: `TASK-${Date.now()}`,
    title,
    status: columnId,
    priority: "P3",
  };
  const updatedCol: KanbanColumnData = {
    ...col,
    tasks: [...col.tasks, newTask],
  };
  handleColumnUpdate(updatedCol);
}
</script>

<template>
  <div class="of-kanban-board">
    <div class="of-kanban-inner">
      <!-- 列渲染 -->
      <div v-for="col in localColumns" :key="col.id" class="of-kanban-col-wrapper">
        <KanbanColumn
          :column="col"
          @add-card="handleAddCard"
          @card-click="emit('card-click', $event)"
          @update:column="handleColumnUpdate"
        />
        <QuickAddRow
          class="of-quick-add-below"
          @submit="(title) => handleQuickAdd(col.id, title)"
        />
      </div>

      <!-- 添加列按钮 -->
      <button v-if="addColumnVisible" class="of-add-column-btn" @click="emit('add-column')">
        <Plus :size="16" />
        <span>添加列</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.of-kanban-board {
  width: 100%;
  overflow-x: auto;
  padding: 16px 0;
  font-family: var(--of-font-sans);
}

.of-kanban-inner {
  display: flex;
  flex-direction: row;
  gap: 16px;
  min-height: 200px;
  padding-bottom: 8px;
}

.of-kanban-col-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  width: var(--of-kanban-column-width);
}

.of-quick-add-below {
  /* QuickAddRow 放在列组件下方 */
}

.of-add-column-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 200px;
  min-height: 120px;
  border: 2px dashed var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-xl);
  background: transparent;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0;
  transition: var(--of-transition-fast);
}

.of-add-column-btn:hover {
  border-color: var(--of-border-strong, var(--of-color-gray-300));
  background: var(--of-surface-muted, var(--of-color-gray-50));
  color: var(--of-text-secondary, var(--of-color-gray-600));
}
</style>
