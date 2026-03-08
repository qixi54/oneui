<script setup lang="ts">
import { computed } from "vue";
import type { VNodeChild } from "vue";

interface ProgressBarProps {
  value: number;
  height?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  borderRadius?: number;
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  height: 4,
  bgColor: "#f0f0f0",
  showLabel: false,
  borderRadius: 2,
});

defineSlots<{
  default?: () => VNodeChild;
}>();

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));

const computedColor = computed(() =>
  clampedValue.value === 100 ? "#52c41a" : (props.color ?? "#1677ff"),
);

const trackStyle = computed(() => ({
  height: `${props.height}px`,
  backgroundColor: props.bgColor,
  borderRadius: `${props.borderRadius}px`,
}));

const fillStyle = computed(() => ({
  width: `${clampedValue.value}%`,
  background: computedColor.value,
  borderRadius: `${props.borderRadius}px`,
}));
</script>

<template>
  <div class="of-progress-bar">
    <div class="of-progress-bar__track pb" :style="trackStyle">
      <div class="of-progress-bar__fill pf" :class="{ dn: clampedValue === 100 }" :style="fillStyle" />
    </div>

    <div v-if="showLabel" class="of-progress-bar__label">
      <div class="of-progress-bar__slot">
        <slot />
      </div>
      <span class="of-progress-bar__value">{{ clampedValue }}%</span>
    </div>
  </div>
</template>

<style scoped>
.of-progress-bar {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  width: 100% !important;
}

.of-progress-bar__track {
  width: 100% !important;
  overflow: hidden !important;
}

.of-progress-bar__fill {
  height: 100% !important;
  transition: width 0.3s ease !important;
}

.of-progress-bar__label {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  font-size: 12px !important;
  line-height: 1.4 !important;
  color: var(--of-color-text-secondary, #8c8c8c) !important;
}

.of-progress-bar__slot {
  min-width: 0 !important;
  flex: 1 !important;
}

.of-progress-bar__value {
  flex-shrink: 0 !important;
  color: var(--of-color-text-secondary, #8c8c8c) !important;
}
</style>
