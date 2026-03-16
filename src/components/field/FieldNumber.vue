<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue | null]; cancel: []; tabNext: [] }>();

const inputRef = ref<HTMLInputElement | null>(null);
const local = ref(props.value === null || props.value === undefined ? "" : String(props.value));

onMounted(() => nextTick(() => inputRef.value?.focus()));

function toCommittedValue(): number | null {
  if (local.value === "") return null;
  const parsed = Number(local.value);
  return Number.isNaN(parsed) ? null : parsed;
}

function adjustValue(delta: number) {
  const current = local.value === "" ? 0 : Number(local.value);
  const base = Number.isNaN(current) ? 0 : current;
  local.value = String(base + delta);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    adjustValue(1);
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    adjustValue(-1);
  }
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
  <input
    ref="inputRef"
    class="of-field-input"
    type="number"
    v-model="local"
    @keydown="onKeydown"
    @blur="emit('commit', toCommittedValue())"
  />
</template>

<style scoped>
.of-field-input {
  width: 100%;
  height: 100%;
  min-height: 28px;
  padding: 2px 6px;
  font-size: 13px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--of-color-text, #1a1a1a);
}
</style>
