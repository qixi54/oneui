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
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
}

.of-range-slider__label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--of-color-text);
}

.of-range-slider__input {
  width: 100%;
  height: 6px;
  border-radius: var(--of-radius-full);
  background: var(--of-color-gray-200);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.of-range-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: var(--of-radius-full);
  background: var(--of-color-primary-600);
  cursor: pointer;
  border: 2px solid var(--of-color-bg-canvas);
  box-shadow: var(--of-shadow-card);
}

.of-range-slider__input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: var(--of-radius-full);
  background: var(--of-color-primary-600);
  cursor: pointer;
  border: 2px solid var(--of-color-bg-canvas);
  box-shadow: var(--of-shadow-card);
}

.of-range-slider__input::-webkit-slider-thumb:hover {
  background: var(--of-color-primary-700);
  box-shadow: var(--of-shadow-card-hover);
}

.of-range-slider__input::-moz-range-thumb:hover {
  background: var(--of-color-primary-700);
  box-shadow: var(--of-shadow-card-hover);
}

.of-range-slider__description {
  font-size: 12px;
  color: var(--of-color-gray-500);
  margin: 0;
  padding: 0;
}
</style>
