<script setup lang="ts">
import { computed } from "vue";

export interface StatusIndicatorProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

const STATUS_COLOR_MAP: Record<string, string> = {
  in_progress: "#1677ff",
  executing: "#1677ff",
  analysing: "#1677ff",
  completed: "#52c41a",
  resolved: "#52c41a",
  closed: "#52c41a",
  reviewing: "#fa8c16",
  blocked: "#ff4d4f",
  cancelled: "#ff4d4f",
  open: "#d9d9d9",
  idle: "#aaa",
  draft: "#aaa",
};

const DOT_SIZE_MAP = {
  sm: "6px",
  md: "8px",
} as const;

const props = withDefaults(defineProps<StatusIndicatorProps>(), {
  label: undefined,
  size: "md",
});

const normalizedStatus = computed(() => props.status.trim().toLowerCase());
const displayLabel = computed(() => props.label ?? props.status);
const dotColor = computed(() => STATUS_COLOR_MAP[normalizedStatus.value] ?? "#d9d9d9");
const dotSize = computed(() => DOT_SIZE_MAP[props.size]);
</script>

<template>
  <span class="of-status-indicator">
    <span
      class="of-status-indicator__dot"
      :style="{
        width: dotSize,
        height: dotSize,
        backgroundColor: dotColor,
      }"
    />
    <slot :status="status" :label="displayLabel" :color="dotColor">
      <span class="of-status-indicator__label">{{ displayLabel }}</span>
    </slot>
  </span>
</template>

<style scoped>
.of-status-indicator {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
}

.of-status-indicator__dot {
  display: inline-block !important;
  border-radius: 50% !important;
  flex-shrink: 0 !important;
}

.of-status-indicator__label {
  color: var(--of-color-text-secondary, #595959) !important;
  line-height: 1.4 !important;
}
</style>
