<script lang="ts"></script>

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

defineOptions({ inheritAttrs: false });

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
    v-bind="$attrs"
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
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-2);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.of-switch:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
  border-radius: var(--of-radius-full);
}

.of-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.of-switch__track {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  border-radius: var(--of-radius-full);
  background: var(--of-border-subtle);
  transition: background 0.2s;
}

.of-switch--checked .of-switch__track {
  background: var(--of-accent-default);
}

.of-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  border-radius: 50%;
  background: var(--of-surface-elevated);
  transition:
    left 0.2s,
    transform 0.2s;
}

.of-switch--checked .of-switch__thumb {
  left: calc(100% - 2px);
  transform: translateX(-100%);
}

.of-switch--sm .of-switch__track {
  width: 32px;
  height: 18px;
}

.of-switch--sm .of-switch__thumb {
  width: 14px;
  height: 14px;
}

.of-switch--md .of-switch__track {
  width: 44px;
  height: 24px;
}

.of-switch--md .of-switch__thumb {
  width: 20px;
  height: 20px;
}

.of-switch__label {
  font-size: var(--of-font-size-md);
  line-height: var(--of-line-height-normal);
  color: var(--of-text-primary);
}
</style>
