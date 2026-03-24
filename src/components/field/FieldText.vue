<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import type { CellValue } from "@/components/table/FieldCell.vue";
import { useStandaloneField, type StandaloneFieldProps } from "./standalone";

const props = defineProps<StandaloneFieldProps>();
const emit = defineEmits<{
  commit: [value: CellValue];
  cancel: [];
  tabNext: [];
  "update:modelValue": [value: CellValue];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const { isStandalone, currentValue, resolvedLabel, resolvedPlaceholder, resolvedDisabled } =
  useStandaloneField(props);
const local = ref(String(currentValue.value ?? ""));

watch(currentValue, (value) => {
  local.value = String(value ?? "");
});

onMounted(() => {
  if (!isStandalone.value && !resolvedDisabled.value) {
    nextTick(() => inputRef.value?.focus());
  }
});

function commitValue() {
  emit("commit", local.value);
  if (isStandalone.value) {
    emit("update:modelValue", local.value);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (resolvedDisabled.value) return;
  if (e.key === "Enter") {
    e.preventDefault();
    commitValue();
  }
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
  }
  if (e.key === "Tab") {
    e.preventDefault();
    commitValue();
    emit("tabNext");
  }
}
</script>

<template>
  <div v-if="isStandalone" class="of-field-standalone">
    <label v-if="label" class="of-field-standalone__label">
      {{ label }}
      <span v-if="required" class="of-field-standalone__required">*</span>
    </label>
    <div
      class="of-field-standalone__control"
      :class="{
        'of-field-standalone__control--error': error,
        'of-field-standalone__control--disabled': resolvedDisabled,
      }"
    >
      <input
        ref="inputRef"
        v-model="local"
        class="of-field-input"
        type="text"
        :aria-label="resolvedLabel"
        :placeholder="resolvedPlaceholder"
        :disabled="resolvedDisabled"
        @keydown="onKeydown"
        @blur="commitValue"
      />
    </div>
    <span v-if="error" class="of-field-standalone__error">{{ error }}</span>
  </div>

  <input
    v-else
    ref="inputRef"
    v-model="local"
    class="of-field-input"
    type="text"
    :aria-label="resolvedLabel"
    :placeholder="resolvedPlaceholder"
    :disabled="resolvedDisabled"
    @keydown="onKeydown"
    @blur="commitValue"
  />
</template>

<style scoped>
.of-field-standalone {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

.of-field-standalone__label {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary);
}

.of-field-standalone__required {
  color: var(--of-color-error);
  margin-left: var(--of-spacing-0_5);
}

.of-field-standalone__control {
  border: 1px solid var(--of-border-subtle);
  border-radius: var(--of-radius-md);
  background: var(--of-surface-elevated);
  transition: var(--of-transition-fast);
}

.of-field-standalone__control:focus-within {
  border-color: var(--of-accent-default);
  box-shadow: 0 0 0 2px var(--of-accent-soft);
}

.of-field-standalone__control--error {
  border-color: var(--of-color-error);
}

.of-field-standalone__control--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.of-field-standalone__error {
  font-size: var(--of-font-size-xs);
  color: var(--of-color-error);
}

.of-field-input {
  width: 100%;
  height: 100%;
  min-height: 28px;
  padding: var(--of-spacing-0_5) var(--of-spacing-1_5);
  font-size: var(--of-font-size-base);
  border: none;
  outline: none;
  background: transparent;
  color: var(--of-color-text, #1a1a1a);
}
</style>
