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
  display: block;
}

.of-breadcrumb__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 4px;
}

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

.of-breadcrumb__separator {
  display: inline-flex;
  align-items: center;
  color: var(--of-color-gray-300, #d1d5db);
  padding: 0 4px;
  font-size: 12px;
  user-select: none;
}

.of-breadcrumb__icon {
  width: 14px;
  height: 14px;
  display: inline;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
