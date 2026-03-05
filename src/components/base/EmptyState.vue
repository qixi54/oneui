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

defineProps<{
  icon?: string | Component; // lucide icon name or component
  title: string;
  description?: string;
  action?: EmptyStateAction;
}>();
</script>

<template>
  <div class="of-empty-state">
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
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 300px !important;
  padding: var(--of-spacing-8) var(--of-spacing-4) !important;
}

.of-empty-state__content {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: var(--of-spacing-4) !important;
  text-align: center !important;
}

.of-empty-state__icon {
  width: 48px !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: var(--of-color-gray-300) !important;
  opacity: 0.6 !important;
}

.of-empty-state__icon svg {
  width: 100% !important;
  height: 100% !important;
}

.of-empty-state__title {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: var(--of-color-text) !important;
  margin: 0 !important;
  padding: 0 !important;
}

.of-empty-state__description {
  font-size: 14px !important;
  color: var(--of-color-text-secondary) !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: 300px !important;
}

.of-empty-state__action {
  margin-top: var(--of-spacing-2) !important;
  padding: 8px 16px !important;
  background: var(--of-color-primary-600) !important;
  color: var(--of-color-primary-foreground) !important;
  border: none !important;
  border-radius: var(--of-radius-md) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: var(--of-transition-fast) !important;
}

.of-empty-state__action:hover {
  background: var(--of-color-primary-700) !important;
}
</style>
