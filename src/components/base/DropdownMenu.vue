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
  position: relative;
  display: inline-block;
}

.of-dropdown-menu__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--of-radius-md);
  color: var(--of-color-text-secondary);
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-dropdown-menu__trigger:hover {
  background: var(--of-color-gray-100);
  color: var(--of-color-text);
}

.of-dropdown-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.of-dropdown-menu__content {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  min-width: 160px;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-md);
  box-shadow: var(--of-shadow-panel);
  margin-top: 4px;
  overflow: hidden;
}

.of-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--of-color-text);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: var(--of-transition-fast);
  text-align: left;
}

.of-dropdown-menu__item:hover {
  background: var(--of-color-gray-50);
}

.of-dropdown-menu__item--destructive {
  color: var(--of-color-red-600);
}

.of-dropdown-menu__item--destructive:hover {
  background: var(--of-color-red-50);
}

.of-dropdown-menu__item-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.of-dropdown-fade-enter-active,
.of-dropdown-fade-leave-active {
  transition: opacity var(--of-transition-fast);
}

.of-dropdown-fade-enter-from,
.of-dropdown-fade-leave-to {
  opacity: 0;
}

.of-dropdown-slide-enter-active,
.of-dropdown-slide-leave-active {
  transition: all var(--of-transition-fast);
}

.of-dropdown-slide-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.of-dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
