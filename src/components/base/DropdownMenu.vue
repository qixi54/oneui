<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
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

const props = withDefaults(
  defineProps<{
    items: MenuItem[];
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

defineOptions({ inheritAttrs: false });

const isOpen = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLDivElement | null>(null);

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) {
    isOpen.value = false;
    triggerRef.value?.focus();
  }
}

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.removeEventListener("keydown", onKeydown);
});

function handleItemClick(item: MenuItem) {
  item.onClick();
  isOpen.value = false;
  document.removeEventListener("keydown", onKeydown);
  triggerRef.value?.focus();
}

function toggleMenu() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      document.addEventListener("keydown", onKeydown);
      const firstItem = menuRef.value?.querySelector<HTMLButtonElement>('[role="menuitem"]');
      firstItem?.focus();
    });
  } else {
    document.removeEventListener("keydown", onKeydown);
    triggerRef.value?.focus();
  }
}

function closeMenu() {
  isOpen.value = false;
  document.removeEventListener("keydown", onKeydown);
  triggerRef.value?.focus();
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && isOpen.value) {
      closeMenu();
    }
  },
);
</script>

<template>
  <div class="of-dropdown-menu" v-bind="$attrs">
    <button
      ref="triggerRef"
      class="of-dropdown-menu__trigger"
      :disabled="disabled"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      aria-label="更多操作"
      @click="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <transition name="of-dropdown-fade">
      <button
        v-if="isOpen"
        type="button"
        class="of-dropdown-menu__backdrop"
        aria-label="关闭菜单"
        @click="closeMenu"
      />
    </transition>

    <transition name="of-dropdown-slide">
      <div v-if="isOpen" ref="menuRef" class="of-dropdown-menu__content" role="menu">
        <button
          v-for="(item, index) in items"
          :key="index"
          :class="[
            'of-dropdown-menu__item',
            `of-dropdown-menu__item--${item.variant || 'default'}`,
          ]"
          role="menuitem"
          @click="handleItemClick(item)"
        >
          <component
            :is="resolveIcon(item.icon)"
            v-if="item.icon"
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

.of-dropdown-menu__trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.of-dropdown-menu__trigger:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-dropdown-menu__trigger:hover {
  background: var(--of-surface-selected);
  color: var(--of-text-primary);
}

.of-dropdown-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--of-z-dropdown);
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  cursor: default;
}

.of-dropdown-menu__content {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: var(--of-z-dropdown);
  min-width: 160px;
  background: var(--of-surface-elevated);
  border: 1px solid var(--of-border-subtle);
  border-radius: var(--of-radius-md);
  box-shadow: var(--of-shadow-panel);
  margin-top: var(--of-spacing-1);
  overflow: hidden;
}

.of-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  width: 100%;
  padding: var(--of-spacing-2) var(--of-spacing-3);
  background: transparent;
  border: none;
  color: var(--of-color-text);
  font-size: var(--of-font-size-md);
  font-weight: 400;
  cursor: pointer;
  transition: var(--of-transition-fast);
  text-align: left;
}

.of-dropdown-menu__item:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: -2px;
}

.of-dropdown-menu__item:hover {
  background: var(--of-surface-selected);
}

.of-dropdown-menu__item--destructive {
  color: var(--of-text-primary);
}

.of-dropdown-menu__item--destructive:hover {
  background: var(--of-surface-muted);
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
