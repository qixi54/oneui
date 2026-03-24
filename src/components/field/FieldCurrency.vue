<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue | null]; cancel: []; tabNext: [] }>();

type CurrencyField = FieldDef & { currencyCode?: string };

const inputRef = ref<HTMLInputElement | null>(null);
const local = ref(props.value === null || props.value === undefined ? "" : String(props.value));

const currencySymbol =
  props.field.type === "currency" && "currencyCode" in props.field
    ? (props.field as CurrencyField).currencyCode === "CNY"
      ? "¥"
      : "$"
    : "$";

onMounted(() => nextTick(() => inputRef.value?.focus()));

function toCommittedValue(): number | null {
  if (local.value === "") return null;
  const cleaned = local.value.replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    emit("commit", toCommittedValue());
  }
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
  }
  if (e.key === "Tab") {
    e.preventDefault();
    emit("commit", toCommittedValue());
    emit("tabNext");
  }
}
</script>

<template>
  <div class="of-field-currency">
    <span class="of-field-currency-symbol">{{ currencySymbol }}</span>
    <input
      ref="inputRef"
      v-model="local"
      inputmode="decimal"
      class="of-field-input"
      type="text"
      :aria-label="field.label"
      @keydown="onKeydown"
      @blur="emit('commit', toCommittedValue())"
    />
  </div>
</template>

<style scoped>
.of-field-currency {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}
.of-field-currency-symbol {
  flex-shrink: 0;
  padding: 0 var(--of-spacing-1) 0 var(--of-spacing-1_5);
  font-size: var(--of-font-size-base);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
}
.of-field-input {
  flex: 1;
  min-height: 28px;
  padding: var(--of-spacing-0_5) var(--of-spacing-1_5) var(--of-spacing-0_5) 0;
  font-size: var(--of-font-size-base);
  border: none;
  outline: none;
  background: transparent;
  color: var(--of-text-primary, var(--of-color-text, #1a1a1a));
}
</style>
