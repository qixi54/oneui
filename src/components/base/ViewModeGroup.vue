<script setup lang="ts">
import { computed } from "vue";
import { resolveIcon } from "../../utils/icon";

defineOptions({ name: "ViewModeGroup", inheritAttrs: false });

export interface ViewModeOption {
  value: string;
  icon: string;
  label?: string;
}

export interface ViewModeGroupProps {
  options?: ViewModeOption[];
  modelValue: string;
}

const DEFAULT_OPTIONS: ViewModeOption[] = [
  { value: "side", icon: "panel-right", label: "侧边面板" },
  { value: "modal", icon: "maximize-2", label: "弹窗" },
  { value: "fullscreen", icon: "maximize", label: "全屏" },
];

const props = withDefaults(defineProps<ViewModeGroupProps>(), {
  options: undefined,
});

defineEmits<{
  "update:modelValue": [value: string];
}>();

const resolvedOptions = computed(() => props.options ?? DEFAULT_OPTIONS);
</script>

<template>
  <div class="one-view-mode-group" v-bind="$attrs">
    <button
      v-for="opt in resolvedOptions"
      :key="opt.value"
      class="one-view-mode-group__btn"
      :class="{ 'one-view-mode-group__btn--active': modelValue === opt.value }"
      :title="opt.label"
      @click="$emit('update:modelValue', opt.value)"
    >
      <component :is="resolveIcon(opt.icon)" class="one-view-mode-group__icon" />
    </button>
  </div>
</template>

<style scoped>
.one-view-mode-group {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid var(--of-color-gray-200, #e5e7eb);
}

.one-view-mode-group__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: var(--of-color-gray-400, #9ca3af);
  transition: all 0.15s ease;
}

.one-view-mode-group__btn:hover:not(.one-view-mode-group__btn--active) {
  background: var(--of-color-gray-50, #f9fafb);
}

.one-view-mode-group__btn--active {
  background: var(--of-color-primary-50, #eef2ff);
  color: var(--of-color-primary-600, #4f46e5);
}

.one-view-mode-group__icon {
  width: 14px;
  height: 14px;
}
</style>
