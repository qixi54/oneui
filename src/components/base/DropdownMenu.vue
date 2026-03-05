<script setup lang="ts">
import { ref } from "vue";
import { MoreHorizontal } from "lucide-vue-next";
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

/**
 * DropdownMenu 组件 - 行操作下拉菜单
 *
 * 用于展示行级操作菜单，自动管理打开/关闭状态
 *
 * @example
 * <DropdownMenu
 *   :items="[
 *     { label: '编辑', icon: 'edit', onClick: handleEdit },
 *     { label: '删除', icon: 'trash-2', variant: 'destructive', onClick: handleDelete }
 *   ]"
 * />
 */

export interface MenuItem {
  label: string;
  icon?: string | Component;
  onClick: () => void;
  variant?: "default" | "destructive";
}

defineProps<{
  items: MenuItem[];
}>();

const isOpen = ref(false);

function handleItemClick(item: MenuItem) {
  item.onClick();
  isOpen.value = false;
}

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}
</script>

<template>
  <div class="of-dropdown-menu">
    <button
      class="of-dropdown-menu__trigger"
      @click="toggleMenu"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      aria-label="更多操作"
    >
      <MoreHorizontal :size="18" />
    </button>

    <transition name="of-dropdown-fade">
      <div v-if="isOpen" class="of-dropdown-menu__backdrop" @click="closeMenu" />
    </transition>

    <transition name="of-dropdown-slide">
      <div v-if="isOpen" class="of-dropdown-menu__content" role="menu">
        <button
          v-for="(item, index) in items"
          :key="index"
          @click="handleItemClick(item)"
          :class="[
            'of-dropdown-menu__item',
            `of-dropdown-menu__item--${item.variant || 'default'}`,
          ]"
          role="menuitem"
        >
          <component
            v-if="item.icon"
            :is="resolveIcon(item.icon)"
            class="of-dropdown-menu__item-icon"
          />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.of-dropdown-menu {
  position: relative !important;
  display: inline-block !important;
}

.of-dropdown-menu__trigger {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 44px !important;
  height: 44px !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: var(--of-radius-md) !important;
  color: var(--of-color-text-secondary) !important;
  cursor: pointer !important;
  transition: var(--of-transition-fast) !important;
}

.of-dropdown-menu__trigger:hover {
  background: var(--of-color-gray-100) !important;
  color: var(--of-color-text) !important;
}

.of-dropdown-menu__backdrop {
  position: fixed !important;
  inset: 0 !important;
  z-index: 99 !important;
}

.of-dropdown-menu__content {
  position: absolute !important;
  top: 100% !important;
  right: 0 !important;
  z-index: 100 !important;
  min-width: 160px !important;
  background: var(--of-color-bg-elevated) !important;
  border: 1px solid var(--of-color-gray-200) !important;
  border-radius: var(--of-radius-md) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  margin-top: 4px !important;
  overflow: hidden !important;
}

.of-dropdown-menu__item {
  display: flex !important;
  align-items: center !important;
  gap: var(--of-spacing-2) !important;
  width: 100% !important;
  padding: 8px 12px !important;
  background: transparent !important;
  border: none !important;
  color: var(--of-color-text) !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  cursor: pointer !important;
  transition: var(--of-transition-fast) !important;
  text-align: left !important;
}

.of-dropdown-menu__item:hover {
  background: var(--of-color-gray-50) !important;
}

.of-dropdown-menu__item--destructive {
  color: var(--of-color-red-600) !important;
}

.of-dropdown-menu__item--destructive:hover {
  background: var(--of-color-red-50) !important;
}

.of-dropdown-menu__item-icon {
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0 !important;
}

.of-dropdown-fade-enter-active,
.of-dropdown-fade-leave-active {
  transition: opacity var(--of-transition-fast) !important;
}

.of-dropdown-fade-enter-from,
.of-dropdown-fade-leave-to {
  opacity: 0 !important;
}

.of-dropdown-slide-enter-active,
.of-dropdown-slide-leave-active {
  transition: all var(--of-transition-fast) !important;
}

.of-dropdown-slide-enter-from {
  opacity: 0 !important;
  transform: translateY(-4px) !important;
}

.of-dropdown-slide-leave-to {
  opacity: 0 !important;
  transform: translateY(-4px) !important;
}
</style>
