<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    presets?: string[];
    showInput?: boolean;
    disabled?: boolean;
    label?: string;
  }>(),
  {
    presets: () => ["#0f172a", "#334155", "#526071", "#7a8797", "#dbe2ea", "#eceff3"],
    showInput: true,
    label: "颜色",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();

const colorValue = computed({
  get: () => props.modelValue || "#526071",
  set: (value: string) => {
    emit("update:modelValue", value);
    emit("change", value);
  },
});

function handlePresetPick(color: string) {
  if (props.disabled) return;
  colorValue.value = color;
}
</script>

<template>
  <div class="of-color-panel" :class="{ disabled }">
    <div class="of-color-panel__header">
      <span class="of-color-panel__label">{{ label }}</span>
      <span class="of-color-panel__value">{{ colorValue }}</span>
    </div>
    <div class="of-color-panel__picker-row">
      <input
        v-model="colorValue"
        class="of-color-panel__picker"
        type="color"
        :aria-label="`${label}选择器`"
        :disabled="disabled"
      />
      <input
        v-if="showInput"
        v-model="colorValue"
        class="of-color-panel__input"
        type="text"
        :aria-label="`${label}值输入`"
        :disabled="disabled"
        placeholder="#526071"
      />
    </div>
    <div class="of-color-panel__presets">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="of-color-panel__preset"
        :title="preset"
        :style="{ backgroundColor: preset }"
        :disabled="disabled"
        @click="handlePresetPick(preset)"
      />
    </div>
  </div>
</template>

<style scoped>
.of-color-panel {
  display: grid;
  gap: var(--of-spacing-2_5);
}

.of-color-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--of-font-size-sm);
}

.of-color-panel__label {
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-gray-700);
}

.of-color-panel__value {
  color: var(--of-color-gray-500);
}

.of-color-panel__picker-row {
  display: flex;
  gap: var(--of-spacing-2);
}

.of-color-panel__picker {
  width: 42px;
  height: 32px;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-lg);
  padding: 0;
  background: var(--of-color-bg-elevated);
}

.of-color-panel__input {
  flex: 1;
  height: 32px;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-lg);
  padding: 0 var(--of-spacing-2_5);
  background: var(--of-color-bg-elevated);
  color: var(--of-color-text);
  font-size: var(--of-font-size-sm);
}

.of-color-panel__presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-2);
}

.of-color-panel__preset {
  width: 22px;
  height: 22px;
  border-radius: var(--of-radius-full);
  border: 1px solid var(--of-color-black-alpha-08);
  cursor: pointer;
}

.of-color-panel.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
