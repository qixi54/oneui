<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue | null]; cancel: []; tabNext: [] }>();

const inputRef = ref<HTMLInputElement | null>(null);
const local = ref(typeof props.value === "string" ? props.value : "");

onMounted(() => nextTick(() => inputRef.value?.focus()));

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    emit("commit", local.value || null);
  }
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
  }
  if (e.key === "Tab") {
    e.preventDefault();
    emit("commit", local.value || null);
    emit("tabNext");
  }
}
</script>

<template>
  <input
    ref="inputRef"
    v-model="local"
    class="of-field-input"
    type="tel"
    :aria-label="field.label"
    placeholder="输入电话号码"
    @keydown="onKeydown"
    @blur="emit('commit', local || null)"
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
