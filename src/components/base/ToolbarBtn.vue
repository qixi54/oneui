<script setup lang="ts">
import { computed, type Component } from "vue";
import { resolveIcon } from "../../utils/icon";

const props = defineProps<{
  icon: string | Component;
  label: string;
  active?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const resolvedDisabled = computed(() => props.disabled ?? false);

defineOptions({ inheritAttrs: false });

// icon prop 为运行时字符串，通过 resolveIcon 动态查找 Lucide 组件。
// 全量引入由 icon.ts 统一处理，此处无需重复引入 lucide-vue-next。
const iconComponent = computed(() => resolveIcon(props.icon));

function handleClick(event: MouseEvent) {
  if (resolvedDisabled.value) return;
  emit("click", event);
}
</script>

<template>
  <button
    class="of-toolbar-btn"
    :class="{ 'of-toolbar-btn--active': active }"
    :disabled="resolvedDisabled"
    v-bind="$attrs"
    @click="handleClick"
  >
    <component :is="iconComponent" class="of-toolbar-btn__icon" :size="13" />
    <span class="of-toolbar-btn__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.of-toolbar-btn {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: var(--of-spacing-1_5);
  padding: var(--of-spacing-1_25) var(--of-spacing-2_5);
  background: transparent;
  border: 1px solid var(--of-border-subtle);
  border-radius: var(--of-radius-md);
  cursor: pointer;
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  font-weight: 400;
  color: var(--of-text-secondary, var(--of-color-gray-600));
  line-height: 1;
  white-space: nowrap;
  transition: var(--of-transition-fast);
}

.of-toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.of-toolbar-btn:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-toolbar-btn .of-toolbar-btn__icon {
  color: var(--of-text-tertiary, var(--of-color-gray-500));
  flex-shrink: 0;
}

.of-toolbar-btn:hover:not(.of-toolbar-btn--active) {
  background: var(--of-surface-selected, var(--of-color-gray-50));
}

.of-toolbar-btn--active {
  background: var(--of-surface-selected);
  color: var(--of-accent-strong, var(--of-text-strong));
  border-color: var(--of-border-strong);
}

.of-toolbar-btn--active .of-toolbar-btn__icon {
  color: var(--of-accent-strong, var(--of-text-strong));
}

.of-toolbar-btn__label {
  line-height: 1;
}

@media (max-width: 768px) {
  .of-toolbar-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
