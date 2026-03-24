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
    variant?: "default" | "compact" | "custom";
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
    variant: "default",
    priorityColorMap: undefined,
    statusColorMap: undefined,
  },
);

const emit = defineEmits<{
  click: [task: Task];
}>();

type BadgeState = ReturnType<typeof resolveBadge>;

defineSlots<{
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
  <button
    class="of-kanban-card"
    type="button"
    :class="[
      `of-kanban-card--${variant}`,
      { 'of-kanban-card--dragging': dragging },
    ]"
    :data-kanban-card-id="task.id"
    :data-kanban-card-title="task.title"
    :data-kanban-card-status="task.status ?? ''"
    :data-kanban-card-priority="task.priority ?? ''"
    :data-kanban-card-role="task.role ?? ''"
    :data-kanban-card-variant="variant"
    :data-kanban-card-dragging="dragging ? 'true' : 'false'"
    @click="emit('click', task)"
  >
    <slot
      v-if="$slots.card"
      name="card"
      :task="task"
      :display-date="displayDate"
      :priority-badge="resolvedPriority"
      :status-badge="resolvedStatus"
      :priority-label="priorityLabel"
      :status-label="statusLabel"
    />

    <template v-else>
      <slot
        name="title"
        :task="task"
        :display-date="displayDate"
        :priority-badge="resolvedPriority"
        :status-badge="resolvedStatus"
        :priority-label="priorityLabel"
        :status-label="statusLabel"
      >
        <div class="of-card-title">{{ task.title }}</div>
      </slot>

      <slot
        name="meta"
        :task="task"
        :display-date="displayDate"
        :priority-badge="resolvedPriority"
        :status-badge="resolvedStatus"
        :priority-label="priorityLabel"
        :status-label="statusLabel"
      >
        <div class="of-card-meta">
          <span class="of-card-id">{{ task.id }}</span>
          <span v-if="displayDate" class="of-card-date">{{ displayDate }}</span>
          <span class="of-card-spacer" />
          <span v-if="task.role" class="of-card-role-badge">{{ task.role }}</span>
        </div>
      </slot>

      <slot
        name="tags"
        :task="task"
        :display-date="displayDate"
        :priority-badge="resolvedPriority"
        :status-badge="resolvedStatus"
        :priority-label="priorityLabel"
        :status-label="statusLabel"
      >
        <div class="of-card-tags">
          <span class="of-badge" :style="priorityStyle">{{ priorityLabel }}</span>
          <span class="of-badge" :style="statusStyle">{{ statusLabel }}</span>
        </div>
      </slot>
    </template>
  </button>
</template>

<style scoped>
.of-kanban-card {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2_5);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  text-align: left;
  border-radius: var(--of-radius-lg);
  padding: var(--of-spacing-3) var(--of-spacing-3_5);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  box-shadow: var(--of-shadow-card);
  cursor: pointer;
  transition: var(--of-transition-normal);
  width: 100%;
  box-sizing: border-box;
}

.of-kanban-card:hover {
  box-shadow: var(--of-shadow-card-hover);
  border-color: var(--of-border-strong, var(--of-color-gray-300));
}

.of-kanban-card--dragging {
  opacity: 0.5;
}

.of-kanban-card--compact {
  gap: var(--of-spacing-2);
  padding: var(--of-spacing-2_5) var(--of-spacing-3);
}

.of-kanban-card--custom {
  align-items: stretch;
}

.of-card-title {
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-primary, var(--of-color-gray-900));
  line-height: var(--of-line-height-normal);
  word-break: break-word;
}

.of-card-meta {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
}

.of-card-id {
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary, var(--of-color-gray-500));
  white-space: nowrap;
}

.of-card-date {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  white-space: nowrap;
}

.of-card-spacer {
  flex: 1;
}

.of-card-role-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--of-spacing-0_5) 7px;
  border-radius: var(--of-radius-full);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  background: var(--of-surface-selected, var(--of-color-gray-100));
  color: var(--of-text-secondary, var(--of-color-gray-600));
  white-space: nowrap;
}

.of-card-tags {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  flex-wrap: wrap;
}

.of-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--of-spacing-0_75) var(--of-spacing-2_5);
  border-radius: var(--of-radius-xl);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  white-space: nowrap;
  line-height: 1.4;
}
</style>
