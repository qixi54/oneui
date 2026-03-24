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

defineOptions({ inheritAttrs: false });

const columnClass = computed(() => {
  const count = props.options.length;
  if (count <= 2) return "of-button-group--cols-2";
  if (count <= 3) return "of-button-group--cols-3";
  return "of-button-group--cols-4";
});
</script>

<template>
  <div class="of-button-group" :class="columnClass" v-bind="$attrs">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="[
        'of-button-group__item',
        modelValue === opt.value ? 'of-button-group__item--active' : '',
      ]"
      @click="$emit('update:modelValue', opt.value)"
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
  display: grid;
  gap: var(--of-spacing-2);
}

.of-button-group--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.of-button-group--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.of-button-group--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.of-button-group__item {
  padding: var(--of-spacing-3);
  border-radius: var(--of-radius-lg);
  border: 1px solid var(--of-border-subtle);
  background: var(--of-surface-elevated, var(--of-color-bg-canvas));
  color: var(--of-text-secondary, var(--of-color-text-secondary));
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-medium);
  transition: var(--of-transition-fast);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.of-button-group__item:hover:not(.of-button-group__item--active) {
  background: var(--of-surface-selected, var(--of-color-gray-50));
  border-color: var(--of-border-strong);
}

.of-button-group__item--active {
  background: var(--of-accent-default);
  border-color: var(--of-accent-default);
  color: var(--of-color-text-inverse);
}

.of-button-group__item-content {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  justify-content: center;
}

.of-button-group__item-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
