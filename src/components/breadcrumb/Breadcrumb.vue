<script setup lang="ts">
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface BreadcrumbItemData {
  label: string;
  path?: string;
  icon?: string | Component;
  onClick?: () => void;
}

/**
 * Breadcrumb 组件 - 面包屑导航
 *
 * @example
 * <!-- 数据模式 -->
 * <Breadcrumb :items="[
 *   { label: '首页', path: '/' },
 *   { label: '设置', path: '/settings' },
 *   { label: '个人信息' }
 * ]" />
 *
 * <!-- Slot 模式 -->
 * <Breadcrumb>
 *   <BreadcrumbItem path="/">首页</BreadcrumbItem>
 *   <BreadcrumbItem>当前页</BreadcrumbItem>
 * </Breadcrumb>
 */

defineProps<{
  /** 数据模式：面包屑项数组 */
  items?: BreadcrumbItemData[];
  /** 分隔符，默认 '/' */
  separator?: string;
}>();

function handleClick(item: BreadcrumbItemData) {
  if (item.onClick) item.onClick();
}
</script>

<template>
  <nav class="of-breadcrumb" aria-label="breadcrumb">
    <ol class="of-breadcrumb__list">
      <!-- 数据模式 -->
      <template v-if="items && items.length">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="of-breadcrumb__item"
          :class="{ 'of-breadcrumb__item--active': index === items.length - 1 }"
        >
          <component
            :is="item.path ? 'a' : 'span'"
            :href="item.path"
            class="of-breadcrumb__link"
            :class="{ 'of-breadcrumb__link--active': index === items.length - 1 }"
            @click.prevent="item.onClick ? handleClick(item) : null"
          >
            <component v-if="item.icon" :is="resolveIcon(item.icon)" class="of-breadcrumb__icon" />
            {{ item.label }}
          </component>
          <span v-if="index < items.length - 1" class="of-breadcrumb__separator" aria-hidden="true">
            <slot name="separator">{{ separator || "/" }}</slot>
          </span>
        </li>
      </template>
      <!-- Slot 模式 -->
      <slot v-else />
    </ol>
  </nav>
</template>

<style scoped>
.of-breadcrumb {
  display: block !important;
}

.of-breadcrumb__list {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 4px !important;
}

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

.of-breadcrumb__separator {
  display: inline-flex !important;
  align-items: center !important;
  color: var(--of-color-gray-300, #d1d5db) !important;
  padding: 0 4px !important;
  font-size: 12px !important;
  user-select: none !important;
}

.of-breadcrumb__icon {
  width: 14px !important;
  height: 14px !important;
  display: inline !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
}
</style>
