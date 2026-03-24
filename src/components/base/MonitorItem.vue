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

const props = withDefaults(defineProps<MonitorItemProps>(), {
  subtitle: undefined,
  count: undefined,
  color: undefined,
  clickable: false,
});

const emit = defineEmits<{
  click: [];
}>();

defineOptions({ name: "MonitorItem", inheritAttrs: false });

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));

const computedColor = computed(() =>
  clampedValue.value === 100
    ? "var(--of-text-strong, var(--of-accent-strong))"
    : (props.color ?? "var(--of-accent-default)"),
);

const trackStyle = computed(() => ({
  backgroundColor: "var(--of-surface-muted, var(--of-color-gray-100))",
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
    role="button"
    tabindex="0"
    v-bind="$attrs"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
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
  gap: 0 var(--of-spacing-2);
  padding: var(--of-spacing-2) var(--of-spacing-3_5);
  border-bottom: 1px solid var(--of-border-subtle);
  box-sizing: border-box;
  min-width: 0;
}

.of-monitor-item--clickable {
  cursor: pointer;
}

.of-monitor-item--clickable:hover {
  background: var(--of-surface-selected, var(--of-color-gray-50));
}

.of-monitor-item__subtitle {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, #aaa);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.of-monitor-item__label {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  color: var(--of-text-primary, #262626);
}

.of-monitor-item__progress {
  min-width: 0;
  width: 100%;
}

.of-monitor-item__track {
  width: 100%;
  height: 4px;
  border-radius: var(--of-radius-sm);
  overflow: hidden;
}

.of-monitor-item__fill {
  height: 100%;
  border-radius: var(--of-radius-sm);
  transition: width 0.3s ease;
}

.of-monitor-item__percentage {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-secondary, var(--of-color-text-secondary, #888));
  text-align: right;
  white-space: nowrap;
}

.of-monitor-item__count {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-text-tertiary, #bbb));
  text-align: right;
  white-space: nowrap;
}
</style>
