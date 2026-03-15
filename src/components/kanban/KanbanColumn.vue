<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus } from "lucide-vue-next";
import { VueDraggable } from "vue-draggable-plus";
import { useVirtualList } from "@/composables/useVirtualList";
import KanbanCard from "./KanbanCard.vue";
import type { KanbanColumnData, Task, ColorMap } from "../../types";
import { DEFAULT_STATUS_MAP, mergeColorMap } from "../../composables/useBadge";

const props = withDefaults(
  defineProps<{
    column: KanbanColumnData;
    ghostClass?: string;
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
  },
);

const emit = defineEmits<{
  "add-card": [columnId: string];
  "card-click": [task: Task];
  "update:column": [column: KanbanColumnData];
}>();

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

const useVirtual = computed(() => localTasks.value.length > 50);
const cardContainerRef = ref<HTMLElement | null>(null);
const {
  visibleItems: visibleCards,
  totalHeight: cardsTotalHeight,
  offsetY: cardsOffsetY,
} = useVirtualList({
  items: localTasks,
  itemHeight: 120,
  overscan: 3,
  containerRef: cardContainerRef,
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
  return found?.dot ?? found?.text ?? "var(--of-color-gray-400)";
});
</script>

<template>
  <div class="of-kanban-column">
    <!-- 列头 -->
    <div class="of-col-header">
      <span class="of-col-dot" :style="{ background: dotColor }" />
      <span class="of-col-title">{{ column.title }}</span>
      <span class="of-col-count">{{ localTasks.length }}</span>
      <span class="of-col-spacer" />
      <button class="of-col-add-btn" @click="emit('add-card', column.id)">
        <Plus :size="14" />
      </button>
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
        @click="emit('card-click', $event)"
      />
    </VueDraggable>

    <div v-else ref="cardContainerRef" class="of-col-cards of-col-cards-virtual">
      <div :style="{ height: cardsTotalHeight + 'px', position: 'relative' }">
        <div :style="{ transform: `translateY(${cardsOffsetY}px)` }">
          <KanbanCard
            v-for="{ data: task } in visibleCards"
            :key="task.id"
            :task="task"
            @click="emit('card-click', $event)"
          />
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
  gap: 12px;
  background: var(--of-color-gray-50);
  border-radius: var(--of-radius-xl);
  padding: 16px 12px;
  font-family: var(--of-font-sans);
}

.of-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.of-col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.of-col-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--of-color-gray-700);
}

.of-col-count {
  font-size: 12px;
  color: var(--of-color-gray-400);
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
  color: var(--of-color-gray-400);
  border-radius: var(--of-radius-sm);
  cursor: pointer;
  transition: var(--of-transition-fast);
  padding: 0;
}

.of-col-add-btn:hover {
  background: var(--of-color-gray-200);
  color: var(--of-color-gray-600);
}

.of-col-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 40px;
}

.of-col-cards-virtual {
  max-height: 500px;
  overflow-y: auto;
}

/* 拖拽占位符 */
:deep(.of-ghost) {
  opacity: 0.4;
  border: 2px dashed var(--of-color-primary-300);
  background: var(--of-color-primary-50);
  border-radius: var(--of-radius-lg);
}

:deep(.of-chosen) {
  box-shadow: var(--of-shadow-modal);
  transform: rotate(1deg);
}
</style>
