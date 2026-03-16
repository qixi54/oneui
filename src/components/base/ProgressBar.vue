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

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ProgressBarProps>(), {
  height: 4,
  bgColor: "var(--of-color-gray-100)",
  showLabel: false,
  borderRadius: 2,
});

defineSlots<{
  default?: () => VNodeChild;
}>();

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));

const computedColor = computed(() =>
  clampedValue.value === 100
    ? "var(--of-color-success)"
    : (props.color ?? "var(--of-color-primary-500)"),
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
  <div class="of-progress-bar" v-bind="$attrs">
    <div class="of-progress-bar__track pb" :style="trackStyle">
      <div
        class="of-progress-bar__fill pf"
        :class="{ dn: clampedValue === 100 }"
        :style="fillStyle"
      />
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
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.of-progress-bar__track {
  width: 100%;
  overflow: hidden;
}

.of-progress-bar__fill {
  height: 100%;
  transition: width 0.3s ease;
}

.of-progress-bar__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--of-color-text-secondary, #8c8c8c);
}

.of-progress-bar__slot {
  min-width: 0;
  flex: 1;
}

.of-progress-bar__value {
  flex-shrink: 0;
  color: var(--of-color-text-secondary, #8c8c8c);
}
</style>
