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
  display: flex;
  align-items: center;
  gap: 4px;
}

.of-breadcrumb__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--of-color-text-secondary, #6b7280);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.15s ease;
  cursor: default;
  line-height: 1.5;
  padding: var(--of-spacing-xs, 2px) 0;
  border-radius: var(--of-radius-sm, 4px);
}

.of-breadcrumb__link[href]:hover {
  color: var(--of-color-primary, #7c3aed);
  cursor: pointer;
}

.of-breadcrumb__link--active {
  color: var(--of-color-text, #111827);
  font-weight: 500;
  pointer-events: none;
  cursor: default;
}

.of-breadcrumb__icon {
  width: 14px;
  height: 14px;
  display: inline;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
