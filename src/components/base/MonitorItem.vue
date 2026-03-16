<script lang="ts"></script>

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

defineOptions({ name: "MonitorItem", inheritAttrs: false });

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
  clampedValue.value === 100
    ? "var(--of-color-success)"
    : (props.color ?? "var(--of-color-primary-500)"),
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
    v-bind="$attrs"
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

    <div class="of-monitor-item__percentage">{{ clampedValue }}%</div>

    <div v-if="count !== undefined" class="of-monitor-item__count">
      {{ count }}
    </div>
  </div>
</template>

<style scoped>
.of-monitor-item {
  display: grid;
  grid-template-columns: 120px 1fr 90px 48px 60px;
  align-items: center;
  gap: 0 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--of-color-gray-200);
  box-sizing: border-box;
  min-width: 0;
}

.of-monitor-item--clickable {
  cursor: pointer;
}

.of-monitor-item--clickable:hover {
  background: var(--of-color-gray-50);
}

.of-monitor-item__subtitle {
  font-size: 10px;
  color: var(--of-color-text-tertiary, #aaa);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.of-monitor-item__label {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  color: var(--of-color-text-primary, #262626);
}

.of-monitor-item__progress {
  min-width: 0;
  width: 100%;
}

.of-monitor-item__track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.of-monitor-item__fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.of-monitor-item__percentage {
  font-size: 11px;
  color: var(--of-color-text-secondary, #888);
  text-align: right;
  white-space: nowrap;
}

.of-monitor-item__count {
  font-size: 10px;
  color: var(--of-color-text-tertiary, #bbb);
  text-align: right;
  white-space: nowrap;
}
</style>
