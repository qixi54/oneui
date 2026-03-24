<script setup lang="ts">
import { computed } from "vue";

export interface StatusIndicatorProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
  /** 可选的圆点颜色覆盖 */
  color?: string;
}

const props = withDefaults(defineProps<StatusIndicatorProps>(), {
  label: undefined,
  size: "md",
  color: undefined,
});

const STATUS_COLOR_MAP: Record<string, string> = {
  in_progress: "var(--of-accent-default)",
  executing: "var(--of-accent-default)",
  analysing: "var(--of-accent-default)",
  completed: "var(--of-text-strong)",
  resolved: "var(--of-text-strong)",
  closed: "var(--of-text-strong)",
  reviewing: "var(--of-border-strong)",
  blocked: "var(--of-text-tertiary)",
  cancelled: "var(--of-text-tertiary)",
  open: "var(--of-border-subtle)",
  idle: "var(--of-border-subtle)",
  draft: "var(--of-border-subtle)",
};

const DOT_SIZE_MAP = {
  sm: "6px",
  md: "8px",
} as const;

defineOptions({ inheritAttrs: false });

const normalizedStatus = computed(() => props.status.trim().toLowerCase());
const displayLabel = computed(() => props.label ?? props.status);
const dotColor = computed(
  () => props.color ?? STATUS_COLOR_MAP[normalizedStatus.value] ?? "var(--of-border-subtle)",
);
const dotSize = computed(() => DOT_SIZE_MAP[props.size]);
</script>

<template>
  <span class="of-status-indicator" :style="{ '--of-status-dot-color': dotColor }" v-bind="$attrs">
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
  gap: var(--of-spacing-1);
}

.of-status-indicator__dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: var(--of-status-dot-color, var(--of-color-gray-300));
}

.of-status-indicator__label {
  color: var(--of-text-secondary, var(--of-color-text-secondary, #595959));
  line-height: 1.4;
}
</style>
