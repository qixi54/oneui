<script setup lang="ts">
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

/**
 * EmptyState 组件 - 空状态提示
 *
 * 统一的空列表、空结果等空态提示组件
 *
 * @example
 * <EmptyState
 *   icon="inbox"
 *   title="暂无数据"
 *   description="开始创建第一条记录"
 *   :action="{ label: '新建', onClick: handleCreate }"
 * />
 */

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

defineOptions({ inheritAttrs: false });

defineProps<{
  icon?: string | Component; // lucide icon name or component
  title: string;
  description?: string;
  action?: EmptyStateAction;
}>();
</script>

<template>
  <div class="of-empty-state" v-bind="$attrs">
    <div class="of-empty-state__content">
      <div v-if="icon" class="of-empty-state__icon">
        <component :is="resolveIcon(icon)" />
      </div>
      <h3 class="of-empty-state__title">{{ title }}</h3>
      <p v-if="description" class="of-empty-state__description">
        {{ description }}
      </p>
      <button v-if="action" @click="action.onClick" class="of-empty-state__action">
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.of-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: var(--of-spacing-8) var(--of-spacing-4);
}

.of-empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--of-spacing-4);
  text-align: center;
}

.of-empty-state__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--of-color-gray-300);
  opacity: 0.6;
}

.of-empty-state__icon svg {
  width: 100%;
  height: 100%;
}

.of-empty-state__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--of-color-text);
  margin: 0;
  padding: 0;
}

.of-empty-state__description {
  font-size: 14px;
  color: var(--of-color-text-secondary);
  margin: 0;
  padding: 0;
  max-width: 300px;
}

.of-empty-state__action {
  margin-top: var(--of-spacing-2);
  padding: 8px 16px;
  background: var(--of-color-primary-600);
  color: var(--of-color-primary-foreground);
  border: none;
  border-radius: var(--of-radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-empty-state__action:hover {
  background: var(--of-color-primary-700);
}
</style>
