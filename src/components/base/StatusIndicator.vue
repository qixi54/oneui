<script setup lang="ts">
import { computed } from "vue";

export interface StatusIndicatorProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
  /** 可选的圆点颜色覆盖 */
  color?: string;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  in_progress: "var(--of-color-info)",
  executing: "var(--of-color-info)",
  analysing: "var(--of-color-info)",
  completed: "var(--of-color-success)",
  resolved: "var(--of-color-success)",
  closed: "var(--of-color-success)",
  reviewing: "var(--of-color-warning)",
  blocked: "var(--of-color-error)",
  cancelled: "var(--of-color-error)",
  open: "var(--of-color-gray-300)",
  idle: "var(--of-color-gray-400)",
  draft: "var(--of-color-gray-400)",
};

const DOT_SIZE_MAP = {
  sm: "6px",
  md: "8px",
} as const;

const props = withDefaults(defineProps<StatusIndicatorProps>(), {
  label: undefined,
  size: "md",
  color: undefined,
});

const normalizedStatus = computed(() => props.status.trim().toLowerCase());
const displayLabel = computed(() => props.label ?? props.status);
const dotColor = computed(() => props.color ?? STATUS_COLOR_MAP[normalizedStatus.value] ?? "var(--of-color-gray-300)");
const dotSize = computed(() => DOT_SIZE_MAP[props.size]);
</script>

<template>
  <span class="of-status-indicator" :style="{ '--of-status-dot-color': dotColor }">
    <span
      class="of-status-indicator__dot"
      :style="{
        width: dotSize,
        height: dotSize,
      }"
    />
    <slot :status="status" :label="displayLabel" :color="dotColor">
      <span class="of-status-indicator__label">{{ displayLabel }}</span>
    </slot>
  </span>
</template>

<style scoped>
.of-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.of-status-indicator__dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: var(--of-status-dot-color, var(--of-color-gray-300));
}

.of-status-indicator__label {
  color: var(--of-color-text-secondary, #595959);
  line-height: 1.4;
}
</style>
