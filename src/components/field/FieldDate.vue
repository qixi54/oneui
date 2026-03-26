<script setup lang="ts">
import { ref, watch } from "vue";
import type { CellValue } from "@/components/table/FieldCell.vue";
import FieldWrapper from "./FieldWrapper.vue";
import { useFieldBase, type StandaloneFieldProps } from "@/composables/useFieldBase";

const props = defineProps<StandaloneFieldProps>();
const emit = defineEmits<{
  commit: [value: CellValue];
  cancel: [];
  tabNext: [];
  "update:modelValue": [value: CellValue];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const { isStandalone, currentValue, resolvedLabel, resolvedPlaceholder, resolvedDisabled } =
  useFieldBase({ props, focusRef: inputRef });
const local = ref(String(currentValue.value ?? ""));

watch(currentValue, (value) => {
  local.value = String(value ?? "");
});

function commitValue() {
  const value = local.value || null;
  emit("commit", value);
  if (isStandalone.value) {
    emit("update:modelValue", value);
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
  <FieldWrapper
    v-if="isStandalone"
    :label="label"
    :required="required"
    :disabled="resolvedDisabled"
    :error="error"
  >
      <input
        ref="inputRef"
        v-model="local"
        class="of-field-input"
        type="date"
        :aria-label="resolvedLabel"
        :placeholder="resolvedPlaceholder"
        :disabled="resolvedDisabled"
        @keydown="onKeydown"
        @blur="commitValue"
      />
  </FieldWrapper>

  <input
    v-else
    ref="inputRef"
    v-model="local"
    class="of-field-input"
    type="date"
    :aria-label="resolvedLabel"
    :placeholder="resolvedPlaceholder"
    :disabled="resolvedDisabled"
    @keydown="onKeydown"
    @blur="commitValue"
  />
</template>

<style scoped>
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
  cursor: pointer;
}

.of-field-input:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

/* Touch-optimized: larger target, prevent iOS zoom */
@media (max-width: 768px), (pointer: coarse) {
  .of-field-input {
    min-height: 44px;
    font-size: var(--of-font-size-lg);
    padding: var(--of-spacing-2) var(--of-spacing-3);
  }
}
</style>
