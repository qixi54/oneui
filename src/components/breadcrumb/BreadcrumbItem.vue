<script setup lang="ts">
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

/**
 * BreadcrumbItem 组件 - 面包屑项
 *
 * 用于 Breadcrumb 的 Slot 模式，表示面包屑导航中的单个项。
 *
 * @example
 * <Breadcrumb>
 *   <BreadcrumbItem path="/">首页</BreadcrumbItem>
 *   <BreadcrumbItem path="/settings" icon="settings">设置</BreadcrumbItem>
 *   <BreadcrumbItem active>当前页</BreadcrumbItem>
 * </Breadcrumb>
 */

defineProps<{
  /** 链接路径，有路径则可点击 */
  path?: string;
  /** 图标，字符串（lucide 图标名）或 Component */
  icon?: string | Component;
  /** 是否为当前活跃页（最后一项） */
  active?: boolean;
}>();

const emit = defineEmits<{
  /** 点击事件 */
  click: [e: MouseEvent];
}>();
</script>

<template>
  <li class="of-breadcrumb__item" :class="{ 'of-breadcrumb__item--active': active }">
    <component
      :is="path ? 'a' : 'span'"
      :href="path"
      class="of-breadcrumb__link"
      :class="{ 'of-breadcrumb__link--active': active }"
      @click.prevent="emit('click', $event)"
    >
      <component v-if="icon" :is="resolveIcon(icon)" class="of-breadcrumb__icon" />
      <slot />
    </component>
  </li>
</template>

<style scoped>
.of-breadcrumb__item {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}

.of-breadcrumb__link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  color: var(--of-color-text-secondary, #6b7280) !important;
  font-size: 14px !important;
  text-decoration: none !important;
  transition: color 0.15s ease !important;
  cursor: default !important;
  line-height: 1.5 !important;
  padding: var(--of-spacing-xs, 2px) 0 !important;
  border-radius: var(--of-radius-sm, 4px) !important;
}

.of-breadcrumb__link[href]:hover {
  color: var(--of-color-primary, #7c3aed) !important;
  cursor: pointer !important;
}

.of-breadcrumb__link--active {
  color: var(--of-color-text, #111827) !important;
  font-weight: 500 !important;
  pointer-events: none !important;
  cursor: default !important;
}

.of-breadcrumb__icon {
  width: 14px !important;
  height: 14px !important;
  display: inline !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
}
</style>
