<script lang="ts">
</script>

<script setup lang="ts">
import { computed } from "vue";

export interface MonitorItemProps {
  label: string;
  subtitle?: string;
  value: number;
  count?: string;
  color?: string;
  clickable?: boolean;
}

defineOptions({ name: "MonitorItem" });

const props = withDefaults(defineProps<MonitorItemProps>(), {
  subtitle: undefined,
  count: undefined,
  color: undefined,
  clickable: false,
});

const emit = defineEmits<{
  click: [];
}>();

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));

const computedColor = computed(() =>
  clampedValue.value === 100 ? "var(--of-color-success)" : (props.color ?? "var(--of-color-primary-500)"),
);

const trackStyle = computed(() => ({
  backgroundColor: "var(--of-color-gray-100)",
}));

const fillStyle = computed(() => ({
  width: `${clampedValue.value}%`,
  background: computedColor.value,
}));

function handleClick() {
  if (props.clickable) {
    emit("click");
  }
}
</script>

<template>
  <div
    class="of-monitor-item"
    :class="{ 'of-monitor-item--clickable': clickable }"
    @click="handleClick"
  >
    <div v-if="subtitle !== undefined" class="of-monitor-item__subtitle">
      {{ subtitle }}
    </div>

    <div class="of-monitor-item__label">
      {{ label }}
    </div>

    <div class="of-monitor-item__progress">
      <div class="of-monitor-item__track" :style="trackStyle">
        <div class="of-monitor-item__fill" :style="fillStyle" />
      </div>
    </div>

    <div class="of-monitor-item__percentage">
      {{ clampedValue }}%
    </div>

    <div v-if="count !== undefined" class="of-monitor-item__count">
      {{ count }}
    </div>
  </div>
</template>

<style scoped>
.of-monitor-item {
  display: grid !important;
  grid-template-columns: 120px 1fr 90px 48px 60px !important;
  align-items: center !important;
  gap: 0 8px !important;
  padding: 8px 14px !important;
  border-bottom: 1px solid var(--of-color-gray-200) !important;
  box-sizing: border-box !important;
  min-width: 0 !important;
}

.of-monitor-item--clickable {
  cursor: pointer !important;
}

.of-monitor-item--clickable:hover {
  background: var(--of-color-gray-50) !important;
}

.of-monitor-item__subtitle {
  font-size: 10px !important;
  color: var(--of-color-text-tertiary, #aaa) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  min-width: 0 !important;
}

.of-monitor-item__label {
  font-size: 12px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  min-width: 0 !important;
  color: var(--of-color-text-primary, #262626) !important;
}

.of-monitor-item__progress {
  min-width: 0 !important;
  width: 100% !important;
}

.of-monitor-item__track {
  width: 100% !important;
  height: 4px !important;
  border-radius: 2px !important;
  overflow: hidden !important;
}

.of-monitor-item__fill {
  height: 100% !important;
  border-radius: 2px !important;
  transition: width 0.3s ease !important;
}

.of-monitor-item__percentage {
  font-size: 11px !important;
  color: var(--of-color-text-secondary, #888) !important;
  text-align: right !important;
  white-space: nowrap !important;
}

.of-monitor-item__count {
  font-size: 10px !important;
  color: var(--of-color-text-tertiary, #bbb) !important;
  text-align: right !important;
  white-space: nowrap !important;
}
</style>
