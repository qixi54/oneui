<script setup lang="ts">
import { ref, computed, watch, useSlots, onMounted, onUnmounted } from "vue";
import { Plus } from "lucide-vue-next";
import KanbanColumn from "./KanbanColumn.vue";
import QuickAddRow from "./QuickAddRow.vue";
import { buildKanbanColumns, isSelectField } from "../../types";
import type {
  ColorMap,
  DataRecord,
  KanbanColumnData,
  Task,
  TableSchema,
  ViewConfig,
} from "../../types";
import type {
  DatabaseViewKanbanAppearance,
  DatabaseViewKanbanCardMoveEvent,
  DatabaseViewKanbanQuickAddEvent,
} from "../../contracts/database";

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
    priorityColorMap?: ColorMap;
    statusColorMap?: ColorMap;
    kanbanAppearance?: DatabaseViewKanbanAppearance;
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
    priorityColorMap: undefined,
    statusColorMap: undefined,
    kanbanAppearance: undefined,
  },
);

const emit = defineEmits<{
  "update:columns": [columns: KanbanColumnData[]];
  "add-column": [];
  "card-click": [task: Task];
  "quick-add": [payload: Omit<DatabaseViewKanbanQuickAddEvent, "record" | "fields">];
  "card-move": [payload: Omit<DatabaseViewKanbanCardMoveEvent, "record" | "fields" | "recordId">];
}>();

const slots = useSlots();
const hasColumnHeaderSlot = computed(() => Boolean(slots["column-header"]));
const hasCardSlot = computed(() => Boolean(slots.card));
const hasCardTitleSlot = computed(() => Boolean(slots["card-title"]));
const hasCardMetaSlot = computed(() => Boolean(slots["card-meta"]));
const hasCardTagsSlot = computed(() => Boolean(slots["card-tags"]));

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
  const previousColumnByTaskId = new Map<string, string>();
  for (const column of localColumns.value) {
    for (const task of column.tasks) {
      previousColumnByTaskId.set(task.id, column.id);
    }
  }
  const idx = localColumns.value.findIndex((c) => c.id === updated.id);
  if (idx !== -1) {
    const normalizedTasks = updated.tasks.map((task) => ({
      ...task,
      status: updated.id,
    }));
    localColumns.value[idx] = { ...updated, tasks: normalizedTasks };
    for (const task of normalizedTasks) {
      const fromColumnId = previousColumnByTaskId.get(task.id);
      if (fromColumnId && fromColumnId !== updated.id) {
        emit("card-move", {
          task,
          fromColumnId,
          toColumnId: updated.id,
        });
      }
    }
    emit("update:columns", structuredClone(localColumns.value));
  }
}

function handleAddCard(_columnId: string) {
  // 由父组件处理，此处通过 QuickAddRow submit 处理
}

// Scroll indicator state
const boardRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

function checkScroll() {
  const el = boardRef.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  const el = boardRef.value;
  if (!el) return;
  el.addEventListener("scroll", checkScroll, { passive: true });
  resizeObserver = new ResizeObserver(checkScroll);
  resizeObserver.observe(el);
  checkScroll();
});

onUnmounted(() => {
  const el = boardRef.value;
  if (el) el.removeEventListener("scroll", checkScroll);
  resizeObserver?.disconnect();
});

function handleQuickAdd(columnId: string, title: string) {
  const col = localColumns.value.find((c) => c.id === columnId);
  if (!col) return;
  const newTask: Task = {
    id: `TASK-${Date.now()}`,
    title,
    status: columnId,
    priority: "P3",
  };
  emit("quick-add", {
    columnId,
    title,
    task: newTask,
  });
  const updatedCol: KanbanColumnData = {
    ...col,
    tasks: [...col.tasks, newTask],
  };
  handleColumnUpdate(updatedCol);
}
</script>

<template>
  <div
    ref="boardRef"
    class="of-kanban-board"
    :class="{
      'of-kanban-board--can-scroll-left': canScrollLeft,
      'of-kanban-board--can-scroll-right': canScrollRight,
    }"
    data-kanban-board="true"
  >
    <div class="of-kanban-board__scroll-hint--left" />
    <div class="of-kanban-board__scroll-hint--right" />
    <div class="of-kanban-inner">
      <!-- 列渲染 -->
      <div
        v-for="col in localColumns"
        :key="col.id"
        class="of-kanban-col-wrapper"
        :data-kanban-column-wrapper="col.id"
      >
        <KanbanColumn
          :column="col"
          :card-variant="props.kanbanAppearance?.cardVariant"
          :column-variant="props.kanbanAppearance?.columnVariant"
          :show-column-count="props.kanbanAppearance?.showColumnCount ?? true"
          :priority-color-map="props.priorityColorMap"
          :status-color-map="props.statusColorMap"
          @add-card="handleAddCard"
          @card-click="emit('card-click', $event)"
          @update:column="handleColumnUpdate"
        >
          <template v-if="hasColumnHeaderSlot" #header="slotProps">
            <slot name="column-header" v-bind="slotProps" />
          </template>
          <template v-if="hasCardSlot" #card="slotProps">
            <slot name="card" v-bind="slotProps" />
          </template>
          <template v-if="hasCardTitleSlot" #title="slotProps">
            <slot name="card-title" v-bind="slotProps" />
          </template>
          <template v-if="hasCardMetaSlot" #meta="slotProps">
            <slot name="card-meta" v-bind="slotProps" />
          </template>
          <template v-if="hasCardTagsSlot" #tags="slotProps">
            <slot name="card-tags" v-bind="slotProps" />
          </template>
        </KanbanColumn>
        <QuickAddRow
          v-if="props.kanbanAppearance?.quickAddVisible ?? true"
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
  position: relative;
  width: 100%;
  overflow-x: auto;
  padding: var(--of-spacing-4) 0;
  font-family: var(--of-font-sans);
}

.of-kanban-board__scroll-hint--left,
.of-kanban-board__scroll-hint--right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: var(--of-z-base);
  opacity: 0;
  transition: var(--of-transition-normal);
}

.of-kanban-board__scroll-hint--left {
  left: 0;
  background: linear-gradient(to right, var(--of-surface-canvas, #f8fafc), transparent);
}

.of-kanban-board__scroll-hint--right {
  right: 0;
  background: linear-gradient(to left, var(--of-surface-canvas, #f8fafc), transparent);
}

.of-kanban-board--can-scroll-left .of-kanban-board__scroll-hint--left,
.of-kanban-board--can-scroll-right .of-kanban-board__scroll-hint--right {
  opacity: 1;
}

.of-kanban-inner {
  display: flex;
  flex-direction: row;
  gap: var(--of-spacing-4);
  min-height: 200px;
  padding-bottom: var(--of-spacing-2);
}

.of-kanban-col-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
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
  gap: var(--of-spacing-2);
  width: 200px;
  min-height: 120px;
  border: 2px dashed var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-xl);
  background: transparent;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  font-size: var(--of-font-size-base);
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
