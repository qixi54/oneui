<script setup lang="ts">
import { computed } from "vue";
import type { Task, ColorMap } from "../../types";
import {
  DEFAULT_PRIORITY_MAP,
  DEFAULT_STATUS_MAP,
  resolveBadge,
  mergeColorMap,
} from "../../composables/useBadge";

const props = withDefaults(
  defineProps<{
    task: Task;
    dragging?: boolean;
    /**
     * 优先级颜色映射，会与内置默认映射合并（传入优先）
     * 例：{ urgent: { text: '#DC2626', bg: '#FEE2E2', label: '紧急' } }
     */
    priorityColorMap?: ColorMap;
    /**
     * 状态颜色映射，会与内置默认映射合并（传入优先）
     * 例：{ in_review: { text: '#7C3AED', bg: '#EDE9FE', label: '审核中' } }
     */
    statusColorMap?: ColorMap;
  }>(),
  {
    dragging: false,
  },
);

const emit = defineEmits<{
  click: [task: Task];
}>();

const resolvedPriority = computed(() =>
  resolveBadge(props.task.priority, mergeColorMap(DEFAULT_PRIORITY_MAP, props.priorityColorMap)),
);

const resolvedStatus = computed(() =>
  resolveBadge(props.task.status, mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap)),
);

const priorityStyle = computed(() => resolvedPriority.value.style);
const statusStyle = computed(() => resolvedStatus.value.style);
const statusLabel = computed(() => resolvedStatus.value.label);
const priorityLabel = computed(() => resolvedPriority.value.label);

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const displayDate = computed(() => formatDate(props.task.updatedAt ?? props.task.endDate));
</script>

<template>
  <div
    class="of-kanban-card"
    :class="{ 'of-kanban-card--dragging': dragging }"
    @click="emit('click', task)"
  >
    <!-- 标题 -->
    <div class="of-card-title">{{ task.title }}</div>

    <!-- Meta 行：任务ID + 日期 + spacer + 角色徽章 -->
    <div class="of-card-meta">
      <span class="of-card-id">{{ task.id }}</span>
      <span v-if="displayDate" class="of-card-date">{{ displayDate }}</span>
      <span class="of-card-spacer" />
      <span v-if="task.role" class="of-card-role-badge">{{ task.role }}</span>
    </div>

    <!-- Tags 行：优先级徽章 + 状态徽章 -->
    <div class="of-card-tags">
      <span class="of-badge" :style="priorityStyle">{{ priorityLabel }}</span>
      <span class="of-badge" :style="statusStyle">{{ statusLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.of-kanban-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--of-color-bg-elevated);
  border-radius: var(--of-radius-lg);
  padding: 12px 14px;
  border: 1px solid var(--of-color-gray-200);
  box-shadow: var(--of-shadow-card);
  cursor: pointer;
  transition: var(--of-transition-normal);
  width: 100%;
  box-sizing: border-box;
}

.of-kanban-card:hover {
  box-shadow: var(--of-shadow-card-hover);
  border-color: var(--of-color-gray-300);
}

.of-kanban-card--dragging {
  opacity: 0.5;
}

.of-card-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--of-color-gray-900);
  line-height: 1.5;
  word-break: break-word;
}

.of-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.of-card-id {
  font-size: 11px;
  font-weight: 500;
  color: var(--of-color-primary-500);
  white-space: nowrap;
}

.of-card-date {
  font-size: 11px;
  color: var(--of-color-gray-400);
  white-space: nowrap;
}

.of-card-spacer {
  flex: 1;
}

.of-card-role-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: var(--of-radius-full);
  font-size: 10px;
  font-weight: 500;
  background: var(--of-color-primary-50);
  color: var(--of-color-primary-600);
  white-space: nowrap;
}

.of-card-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.of-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
}
</style>
