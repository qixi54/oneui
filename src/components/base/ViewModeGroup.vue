<script setup lang="ts">
import { computed } from "vue";
import { resolveIcon } from "../../utils/icon";

defineOptions({ name: "ViewModeGroup" });

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
  <div class="one-view-mode-group">
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
  display: inline-flex !important;
  gap: 2px !important;
  padding: 2px !important;
  border-radius: 6px !important;
  border: 1px solid var(--of-color-gray-200, #E5E7EB) !important;
}

.one-view-mode-group__btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 26px !important;
  border-radius: 4px !important;
  border: none !important;
  background: transparent !important;
  cursor: pointer !important;
  padding: 0 !important;
  color: var(--of-color-gray-400, #9CA3AF) !important;
  transition: all 0.15s ease !important;
}

.one-view-mode-group__btn:hover:not(.one-view-mode-group__btn--active) {
  background: var(--of-color-gray-50, #F9FAFB) !important;
}

.one-view-mode-group__btn--active {
  background: var(--of-color-primary-50, #EEF2FF) !important;
  color: var(--of-color-primary-600, #4F46E5) !important;
}

.one-view-mode-group__icon {
  width: 14px !important;
  height: 14px !important;
}
</style>
