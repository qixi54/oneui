<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus } from "lucide-vue-next";
import KanbanColumn from "./KanbanColumn.vue";
import QuickAddRow from "./QuickAddRow.vue";
import { buildKanbanColumns } from "../../types";
import type { DataRecord, KanbanColumnData, Task } from "../../types";

const props = withDefaults(
  defineProps<{
    columns?: KanbanColumnData[];
    records?: DataRecord[];
    kanbanFieldId?: string;
    laneOrder?: string[];
    laneTitles?: Record<string, string>;
    addColumnVisible?: boolean;
  }>(),
  {
    columns: () => [],
    records: () => [],
    kanbanFieldId: "status",
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

const resolveColumns = () => {
  if (props.columns.length > 0) {
    return JSON.parse(JSON.stringify(props.columns)) as KanbanColumnData[];
  }
  if (props.records.length > 0) {
    return buildKanbanColumns(props.records, {
      kanbanFieldId: props.kanbanFieldId,
      laneOrder: props.laneOrder,
      laneTitles: props.laneTitles,
    });
  }
  return [];
};

// 本地列副本
const localColumns = ref<KanbanColumnData[]>(resolveColumns());

watch(
  () => [props.columns, props.records, props.kanbanFieldId, props.laneOrder, props.laneTitles],
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
    emit("update:columns", JSON.parse(JSON.stringify(localColumns.value)));
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
  border: 2px dashed var(--of-color-gray-200);
  border-radius: var(--of-radius-xl);
  background: transparent;
  color: var(--of-color-gray-400);
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0;
  transition: var(--of-transition-fast);
}

.of-add-column-btn:hover {
  border-color: var(--of-color-gray-300);
  background: var(--of-color-gray-50);
  color: var(--of-color-gray-600);
}
</style>
