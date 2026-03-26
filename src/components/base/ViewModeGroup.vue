<script setup lang="ts">
import { computed, type Component } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface ViewModeOption {
  value: string;
  icon: string | Component;
  label?: string;
}

export interface ViewModeGroupProps {
  options?: ViewModeOption[];
  modelValue: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<ViewModeGroupProps>(), {
  options: undefined,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

defineOptions({ name: "ViewModeGroup", inheritAttrs: false });

const resolvedOptions = computed(() => props.options ?? DEFAULT_OPTIONS);

const DEFAULT_OPTIONS: ViewModeOption[] = [
  { value: "side", icon: "panel-right", label: "侧边面板" },
  { value: "modal", icon: "maximize-2", label: "弹窗" },
  { value: "fullscreen", icon: "maximize", label: "全屏" },
];
</script>

<template>
  <div
    class="one-view-mode-group"
    :class="{ 'one-view-mode-group--disabled': disabled }"
    v-bind="$attrs"
  >
    <button
      v-for="opt in resolvedOptions"
      :key="opt.value"
      class="one-view-mode-group__btn"
      :class="{ 'one-view-mode-group__btn--active': modelValue === opt.value }"
      :disabled="disabled"
      :title="opt.label"
      @click="emit('update:modelValue', opt.value)"
    >
      <component :is="resolveIcon(opt.icon)" class="one-view-mode-group__icon" />
    </button>
  </div>
</template>

<style scoped>
.one-view-mode-group {
  display: inline-flex;
  gap: var(--of-spacing-0_5);
  padding: var(--of-spacing-0_5);
  border-radius: var(--of-radius-md);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
}

.one-view-mode-group--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.one-view-mode-group__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border-radius: var(--of-radius-sm);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  transition: var(--of-transition-fast);
}

.one-view-mode-group__btn:disabled {
  cursor: not-allowed;
}

.one-view-mode-group__btn:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.one-view-mode-group__btn:hover:not(.one-view-mode-group__btn--active) {
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

.one-view-mode-group__btn--active {
  background: var(--of-accent-soft, var(--of-surface-selected));
  color: var(--of-accent-strong, var(--of-accent-default));
}

.one-view-mode-group__icon {
  width: 14px;
  height: 14px;
}
</style>
