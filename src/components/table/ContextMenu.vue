<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export interface ContextMenuItem {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  children?: ContextMenuItem[]
}

defineOptions({
  name: 'ContextMenu',
})

const props = withDefaults(
  defineProps<{
    x: number
    y: number
    items: ContextMenuItem[]
    visible?: boolean
  }>(),
  { visible: true }
)

const emit = defineEmits<{
  select: [key: string]
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)

const menuStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

function handleSelect(item: ContextMenuItem) {
  if (item.disabled || item.separator) {
    return
  }

  emit('select', item.key)
  emit('close')
}

function handleDocumentMouseDown(event: MouseEvent) {
  const target = event.target as Node | null
  if (menuRef.value && target && !menuRef.value.contains(target)) {
    emit('close')
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

function addListeners() {
  document.addEventListener('mousedown', handleDocumentMouseDown)
  document.addEventListener('keydown', handleDocumentKeydown)
}

function removeListeners() {
  document.removeEventListener('mousedown', handleDocumentMouseDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      addListeners()
      return
    }

    removeListeners()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  removeListeners()
})
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
          <span v-if="item.icon" class="of-context-menu__icon">{{ item.icon }}</span>
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
  padding: 4px 0;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-border-color);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
  z-index: 9999;
  user-select: none;
}

.of-context-menu__sep {
  margin: 4px 0;
  border: 0;
  border-top: 1px solid var(--of-color-border-light);
}

.of-context-menu__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 13px;
  line-height: 1.4;
  color: var(--of-color-text-primary);
  cursor: pointer;
}

.of-context-menu__item:hover:not(.is-disabled) {
  background: var(--of-color-bg-hover);
}

.of-context-menu__item.is-disabled {
  color: var(--of-color-text-tertiary);
  cursor: default;
}

.of-context-menu__item.is-danger {
  color: var(--of-color-error);
}

.of-context-menu__icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
  flex: 0 0 16px;
}

.of-context-menu__label {
  flex: 1;
}

.of-context-menu__submenu-indicator {
  margin-left: auto;
  color: var(--of-color-text-tertiary);
  font-size: 12px;
}
</style>
