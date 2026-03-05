<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

/**
 * ButtonGroup 组件 - 选项按钮组
 *
 * 用于快速创建按钮网格选择器，支持图标
 *
 * @example
 * <ButtonGroup
 *   :options="[
 *     { label: '向量搜索', value: 'vector' },
 *     { label: '关键词搜索', value: 'keyword' }
 *   ]"
 *   v-model="selectedMode"
 * />
 */

export interface ButtonOption {
  label: string;
  value: string | number;
  icon?: string | Component; // lucide icon name (kebab-case) or component
}

const props = defineProps<{
  options: ButtonOption[];
  modelValue: string | number;
}>();

defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const columnClass = computed(() => {
  const count = props.options.length;
  if (count <= 2) return "of-button-group--cols-2";
  if (count <= 3) return "of-button-group--cols-3";
  return "of-button-group--cols-4";
});
</script>

<template>
  <div class="of-button-group" :class="columnClass">
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="$emit('update:modelValue', opt.value)"
      :class="[
        'of-button-group__item',
        modelValue === opt.value ? 'of-button-group__item--active' : '',
      ]"
    >
      <div v-if="opt.icon" class="of-button-group__item-content">
        <component :is="resolveIcon(opt.icon)" class="of-button-group__item-icon" />
        <span>{{ opt.label }}</span>
      </div>
      <div v-else>
        {{ opt.label }}
      </div>
    </button>
  </div>
</template>

<style scoped>
.of-button-group {
  display: grid !important;
  gap: var(--of-spacing-2) !important;
}

.of-button-group--cols-2 {
  grid-template-columns: repeat(2, 1fr) !important;
}

.of-button-group--cols-3 {
  grid-template-columns: repeat(3, 1fr) !important;
}

.of-button-group--cols-4 {
  grid-template-columns: repeat(4, 1fr) !important;
}

.of-button-group__item {
  padding: var(--of-spacing-3) !important;
  border-radius: var(--of-radius-lg) !important;
  border: 1px solid var(--of-color-gray-200) !important;
  background: var(--of-color-bg-canvas) !important;
  color: var(--of-color-text-secondary) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: var(--of-transition-fast) !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.of-button-group__item:hover:not(.of-button-group__item--active) {
  background: var(--of-color-gray-50) !important;
  border-color: var(--of-color-gray-300) !important;
}

.of-button-group__item--active {
  background: var(--of-color-primary-600) !important;
  border-color: var(--of-color-primary-600) !important;
  color: var(--of-color-primary-foreground) !important;
}

.of-button-group__item-content {
  display: flex !important;
  align-items: center !important;
  gap: var(--of-spacing-2) !important;
  justify-content: center !important;
}

.of-button-group__item-icon {
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0 !important;
}
</style>
