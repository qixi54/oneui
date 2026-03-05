<script setup lang="ts">
/**
 * RangeSlider 组件 - 范围滑块输入
 *
 * 用于快速创建 label + range input + description 三件套
 *
 * @example
 * <RangeSlider
 *   label="最大长度"
 *   v-model="maxLength"
 *   :min="100"
 *   :max="2000"
 *   :step="100"
 *   description="调整文本长度限制"
 * />
 */

defineProps<{
  label: string;
  modelValue: number;
  min: number;
  max: number;
  step?: number;
  description?: string;
}>();

defineEmits<{
  "update:modelValue": [value: number];
}>();
</script>

<template>
  <div class="of-range-slider">
    <label class="of-range-slider__label">
      {{ label }}
    </label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      type="range"
      :min="min"
      :max="max"
      :step="step ?? 1"
      class="of-range-slider__input"
    />
    <p v-if="description" class="of-range-slider__description">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.of-range-slider {
  display: flex !important;
  flex-direction: column !important;
  gap: var(--of-spacing-2) !important;
}

.of-range-slider__label {
  display: block !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: var(--of-color-text) !important;
}

.of-range-slider__input {
  width: 100% !important;
  height: 6px !important;
  border-radius: var(--of-radius-full) !important;
  background: var(--of-color-gray-200) !important;
  outline: none !important;
  -webkit-appearance: none !important;
  appearance: none !important;
}

.of-range-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 18px !important;
  height: 18px !important;
  border-radius: var(--of-radius-full) !important;
  background: var(--of-color-primary-600) !important;
  cursor: pointer !important;
  border: 2px solid var(--of-color-bg-canvas) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.of-range-slider__input::-moz-range-thumb {
  width: 18px !important;
  height: 18px !important;
  border-radius: var(--of-radius-full) !important;
  background: var(--of-color-primary-600) !important;
  cursor: pointer !important;
  border: 2px solid var(--of-color-bg-canvas) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.of-range-slider__input::-webkit-slider-thumb:hover {
  background: var(--of-color-primary-700) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.of-range-slider__input::-moz-range-thumb:hover {
  background: var(--of-color-primary-700) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.of-range-slider__description {
  font-size: 12px !important;
  color: var(--of-color-gray-500) !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
