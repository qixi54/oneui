<script lang="ts">
</script>

<script setup lang="ts">
import { computed } from "vue";

export interface SwitchProps {
  modelValue: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}

const props = withDefaults(defineProps<SwitchProps>(), {
  disabled: false,
  size: "md",
  label: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  change: [value: boolean];
}>();

const sizeClass = computed(() => `of-switch--${props.size}`);

function toggle() {
  if (props.disabled) {
    return;
  }

  const nextValue = !props.modelValue;
  emit("update:modelValue", nextValue);
  emit("change", nextValue);
}
</script>

<template>
  <button
    type="button"
    class="of-switch"
    :class="[sizeClass, { 'of-switch--checked': modelValue, 'of-switch--disabled': disabled }]"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    @click="toggle"
    @keydown.space.prevent="toggle"
  >
    <span class="of-switch__track">
      <span class="of-switch__thumb" />
    </span>
    <span v-if="label" class="of-switch__label">
      {{ label }}
    </span>
  </button>
</template>

<style scoped>
.of-switch {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  cursor: pointer !important;
}

.of-switch--disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.of-switch__track {
  position: relative !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
  border-radius: 999px !important;
  background: var(--of-color-gray-300) !important;
  transition: background 0.2s !important;
}

.of-switch--checked .of-switch__track {
  background: var(--of-color-primary-500) !important;
}

.of-switch__thumb {
  position: absolute !important;
  top: 2px !important;
  left: 2px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  transition:
    left 0.2s,
    transform 0.2s !important;
}

.of-switch--checked .of-switch__thumb {
  left: calc(100% - 2px) !important;
  transform: translateX(-100%) !important;
}

.of-switch--sm .of-switch__track {
  width: 32px !important;
  height: 18px !important;
}

.of-switch--sm .of-switch__thumb {
  width: 14px !important;
  height: 14px !important;
}

.of-switch--md .of-switch__track {
  width: 44px !important;
  height: 24px !important;
}

.of-switch--md .of-switch__thumb {
  width: 20px !important;
  height: 20px !important;
}

.of-switch__label {
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: var(--of-color-text, #262626) !important;
}
</style>
