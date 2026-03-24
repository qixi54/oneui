<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type Component } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: string | Component;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
}

const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
    items: ContextMenuItem[];
    visible?: boolean;
  }>(),
  { visible: true },
);

const emit = defineEmits<{
  select: [key: string];
  close: [];
}>();

defineOptions({
  name: "ContextMenu",
});

const menuRef = ref<HTMLElement | null>(null);

const menuStyle = computed(() => ({
  position: "fixed" as const,
  left: `${props.x}px`,
  top: `${props.y}px`,
}));

function handleSelect(item: ContextMenuItem) {
  if (item.disabled || item.separator) {
    return;
  }

  emit("select", item.key);
  emit("close");
}

function handleDocumentMouseDown(event: MouseEvent) {
  const target = event.target as Node | null;
  if (menuRef.value && target && !menuRef.value.contains(target)) {
    emit("close");
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  }
}

function addListeners() {
  document.addEventListener("mousedown", handleDocumentMouseDown);
  document.addEventListener("keydown", handleDocumentKeydown);
}

function removeListeners() {
  document.removeEventListener("mousedown", handleDocumentMouseDown);
  document.removeEventListener("keydown", handleDocumentKeydown);
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      addListeners();
      return;
    }

    removeListeners();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  removeListeners();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="of-context-menu"
      :style="menuStyle"
      role="menu"
      @mousedown.stop
    >
      <template v-for="item in items" :key="item.key">
        <hr v-if="item.separator" class="of-context-menu__sep" />

        <button
          v-else
          type="button"
          class="of-context-menu__item"
          :class="{ 'is-disabled': item.disabled, 'is-danger': item.danger }"
          :disabled="item.disabled"
          role="menuitem"
          @click="handleSelect(item)"
        >
          <component :is="resolveIcon(item.icon)" v-if="item.icon" class="of-context-menu__icon" />
          <span class="of-context-menu__label">{{ item.label }}</span>
          <span v-if="item.children?.length" class="of-context-menu__submenu-indicator">›</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.of-context-menu {
  min-width: 160px;
  padding: var(--of-spacing-1) 0;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  border: 1px solid var(--of-border-subtle, var(--of-border-color));
  border-radius: var(--of-radius-lg, 8px);
  box-shadow: var(--of-shadow-context-menu);
  z-index: var(--of-z-context-menu);
  user-select: none;
}

.of-context-menu__sep {
  margin: var(--of-spacing-1) 0;
  border: 0;
  border-top: 1px solid var(--of-border-subtle, var(--of-color-border-light));
}

.of-context-menu__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  padding: var(--of-spacing-2) var(--of-spacing-3_5);
  border: 0;
  background: transparent;
  text-align: left;
  font-size: var(--of-font-size-base);
  line-height: 1.4;
  color: var(--of-text-primary, var(--of-color-text-primary));
  cursor: pointer;
}

.of-context-menu__item:hover:not(.is-disabled) {
  background: var(--of-surface-muted, var(--of-color-bg-hover));
}

.of-context-menu__item.is-disabled {
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
  cursor: default;
}

.of-context-menu__item.is-danger {
  color: var(--of-color-error);
}

.of-context-menu__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.of-context-menu__label {
  flex: 1;
}

.of-context-menu__submenu-indicator {
  margin-left: auto;
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
  font-size: var(--of-font-size-sm);
}
</style>
