<script setup lang="ts">
import { ref, computed, watch, useSlots } from "vue";
import { Plus } from "lucide-vue-next";
import { VueDraggable } from "vue-draggable-plus";
import { createVirtualListState, useVirtualList } from "@/composables/useVirtualList";
import KanbanCard from "./KanbanCard.vue";
import type { KanbanColumnData, Task, ColorMap } from "../../types";
import { DEFAULT_STATUS_MAP, mergeColorMap, resolveBadge } from "../../composables/useBadge";

type BadgeState = ReturnType<typeof resolveBadge>;

const props = withDefaults(
  defineProps<{
    column: KanbanColumnData;
    ghostClass?: string;
    cardVariant?: "default" | "compact" | "custom";
    columnVariant?: "default" | "board" | "flat";
    showColumnCount?: boolean;
    /**
     * 卡片优先级颜色映射（透传给 KanbanCard）
     */
    priorityColorMap?: ColorMap;
    /**
     * 卡片状态颜色映射（透传给 KanbanCard，同时用于列头圆点颜色）
     */
    statusColorMap?: ColorMap;
  }>(),
  {
    ghostClass: "of-ghost",
    cardVariant: "default",
    columnVariant: "default",
    showColumnCount: true,
    priorityColorMap: undefined,
    statusColorMap: undefined,
  },
);

const emit = defineEmits<{
  "add-card": [columnId: string];
  "card-click": [task: Task];
  "update:column": [column: KanbanColumnData];
}>();

defineSlots<{
  header?(props: {
    column: KanbanColumnData;
    taskCount: number;
    dotColor: string;
    tasks: Task[];
    addCard: () => void;
  }): unknown;
  card?(props: {
    task: Task;
    displayDate: string;
    priorityBadge: BadgeState;
    statusBadge: BadgeState;
    priorityLabel: string;
    statusLabel: string;
  }): unknown;
  title?(props: {
    task: Task;
    displayDate: string;
    priorityBadge: BadgeState;
    statusBadge: BadgeState;
    priorityLabel: string;
    statusLabel: string;
  }): unknown;
  meta?(props: {
    task: Task;
    displayDate: string;
    priorityBadge: BadgeState;
    statusBadge: BadgeState;
    priorityLabel: string;
    statusLabel: string;
  }): unknown;
  tags?(props: {
    task: Task;
    displayDate: string;
    priorityBadge: BadgeState;
    statusBadge: BadgeState;
    priorityLabel: string;
    statusLabel: string;
  }): unknown;
}>();

const slots = useSlots();
const hasCustomCardContent = computed(
  () => Boolean(slots.card || slots.title || slots.meta || slots.tags),
);

// 本地任务副本，用于双向绑定拖拽
const localTasks = ref<Task[]>([...props.column.tasks]);

watch(
  () => props.column.tasks,
  (val) => {
    // 若 ID 顺序与本地一致，说明是自己 emit 引起的回流，跳过同步避免无限循环
    const isSame =
      val.length === localTasks.value.length &&
      val.every((t, i) => t.id === localTasks.value[i]?.id);
    if (!isSame) {
      localTasks.value = [...val];
    }
  },
);

watch(localTasks, (val) => {
  emit("update:column", { ...props.column, tasks: val });
});

// 自定义卡片内容可能改变高度，因此一旦启用 card slots，就关闭虚拟化以保持布局确定性。
const useVirtual = computed(() => localTasks.value.length > 50 && !hasCustomCardContent.value);
const cardContainerRef = ref<HTMLElement | null>(null);
const virtualizationState = createVirtualListState();
const {
  visibleItems: visibleCards,
  totalHeight: cardsTotalHeight,
  offsetY: cardsOffsetY,
} = useVirtualList({
  items: localTasks,
  itemHeight: 120,
  overscan: 3,
  containerRef: cardContainerRef,
  state: virtualizationState,
});

// 列头圆点颜色：优先用 column.color，否则从 statusColorMap 里按列 id/title 查找 dot 颜色
const dotColor = computed(() => {
  if (props.column.color) return props.column.color;
  const merged = mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap);
  // 尝试用 column.id 或 column.title 作 key 查找
  const byId = merged[props.column.id];
  const byTitle = merged[props.column.title];
  const found = byId ?? byTitle;
  // 优先用 dot 颜色，其次用 text 颜色作圆点，找不到用默认灰
  return found?.dot ?? found?.text ?? "var(--of-text-tertiary, var(--of-color-gray-400))";
});
</script>

<template>
  <div
    class="of-kanban-column"
    :class="`of-kanban-column--${columnVariant}`"
    :data-kanban-column-id="column.id"
    :data-kanban-column-title="column.title"
    :data-kanban-column-color="column.color ?? ''"
    :data-kanban-column-task-count="localTasks.length"
    :data-kanban-column-variant="columnVariant"
  >
    <!-- 列头 -->
    <div class="of-col-header">
      <slot
        name="header"
        :column="column"
        :task-count="localTasks.length"
        :dot-color="dotColor"
        :tasks="localTasks"
        :add-card="() => emit('add-card', column.id)"
      >
        <span
          class="of-col-dot"
          :style="{ background: dotColor }"
          :data-kanban-column-dot-color="dotColor"
        />
        <span class="of-col-title">{{ column.title }}</span>
        <span v-if="showColumnCount" class="of-col-count">{{ localTasks.length }}</span>
        <span class="of-col-spacer" />
        <button class="of-col-add-btn" @click="emit('add-card', column.id)">
          <Plus :size="14" />
        </button>
      </slot>
    </div>

    <!-- 拖拽列表 -->
    <VueDraggable
      v-if="!useVirtual"
      v-model="localTasks"
      :group="{ name: 'kanban', pull: true, put: true }"
      item-key="id"
      :ghost-class="ghostClass"
      chosen-class="of-chosen"
      :animation="200"
      class="of-col-cards"
    >
      <KanbanCard
        v-for="task in localTasks"
        :key="task.id"
        :task="task"
        :variant="cardVariant"
        :priority-color-map="priorityColorMap"
        :status-color-map="statusColorMap"
        @click="emit('card-click', $event)"
      >
        <template v-if="slots.card" #card="slotProps">
          <slot name="card" v-bind="slotProps" />
        </template>
        <template v-if="slots.title" #title="slotProps">
          <slot name="title" v-bind="slotProps" />
        </template>
        <template v-if="slots.meta" #meta="slotProps">
          <slot name="meta" v-bind="slotProps" />
        </template>
        <template v-if="slots.tags" #tags="slotProps">
          <slot name="tags" v-bind="slotProps" />
        </template>
      </KanbanCard>
    </VueDraggable>

    <div v-else ref="cardContainerRef" class="of-col-cards of-col-cards-virtual">
      <div :style="{ height: cardsTotalHeight + 'px', position: 'relative' }">
        <div :style="{ transform: `translateY(${cardsOffsetY}px)` }">
          <KanbanCard
            v-for="{ data: task } in visibleCards"
            :key="task.id"
            :task="task"
            :variant="cardVariant"
            :priority-color-map="priorityColorMap"
            :status-color-map="statusColorMap"
            @click="emit('card-click', $event)"
          >
            <template v-if="slots.card" #card="slotProps">
              <slot name="card" v-bind="slotProps" />
            </template>
            <template v-if="slots.title" #title="slotProps">
              <slot name="title" v-bind="slotProps" />
            </template>
            <template v-if="slots.meta" #meta="slotProps">
              <slot name="meta" v-bind="slotProps" />
            </template>
            <template v-if="slots.tags" #tags="slotProps">
              <slot name="tags" v-bind="slotProps" />
            </template>
          </KanbanCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.of-kanban-column {
  width: var(--of-kanban-column-width);
  min-width: var(--of-kanban-column-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-3);
  background: var(--of-surface-panel, var(--of-color-gray-50));
  border-radius: var(--of-radius-xl);
  padding: var(--of-spacing-4) var(--of-spacing-3);
  font-family: var(--of-font-sans);
}

.of-kanban-column--flat {
  background: transparent;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
}

.of-kanban-column--board {
  box-shadow: var(--of-shadow-card);
}

.of-col-header {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
}

.of-col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.of-col-title {
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-gray-700));
}

.of-col-count {
  font-size: var(--of-font-size-sm);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
}

.of-col-spacer {
  flex: 1;
}

.of-col-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  border-radius: var(--of-radius-sm);
  cursor: pointer;
  transition: var(--of-transition-fast);
  padding: 0;
}

.of-col-add-btn:hover {
  background: var(--of-surface-muted, var(--of-color-gray-200));
  color: var(--of-text-secondary, var(--of-color-gray-600));
}

.of-col-cards {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
  min-height: 40px;
}

.of-col-cards-virtual {
  max-height: 500px;
  overflow-y: auto;
}

/* 拖拽占位符 */
:deep(.of-ghost) {
  opacity: 0.4;
  border: 2px dashed var(--of-border-strong, var(--of-color-gray-300));
  background: var(--of-surface-selected, var(--of-color-gray-100));
  border-radius: var(--of-radius-lg);
}

:deep(.of-chosen) {
  box-shadow: var(--of-shadow-modal);
  transform: rotate(1deg);
}
</style>
