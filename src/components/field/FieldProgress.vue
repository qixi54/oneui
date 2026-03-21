<script setup lang="ts">
import { ref } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue | null]; cancel: []; tabNext: [] }>();

type ProgressField = FieldDef & { min?: number; max?: number };

const min =
  props.field.type === "progress" && "min" in props.field ? ((props.field as ProgressField).min ?? 0) : 0;
const max =
  props.field.type === "progress" && "max" in props.field ? ((props.field as ProgressField).max ?? 100) : 100;
const local = ref(typeof props.value === "number" ? props.value : 0);

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  local.value = Number(target.value);
}

function onCommit() {
  emit("commit", local.value);
}
</script>

<template>
  <div class="of-field-progress">
    <div class="of-field-progress-bar">
      <div
        class="of-field-progress-fill"
        :style="{ width: `${((local - min) / (max - min)) * 100}%` }"
      />
    </div>
    <input
      class="of-field-progress-slider"
      type="range"
      :min="min"
      :max="max"
      :value="local"
      :aria-label="field.label"
      @input="onInput"
      @change="onCommit"
    />
    <span class="of-field-progress-label">{{ local }}%</span>
  </div>
</template>

<style scoped>
.of-field-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 6px;
}
.of-field-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--of-surface-muted, var(--of-color-gray-200));
  border-radius: 999px;
  overflow: hidden;
}
.of-field-progress-fill {
  height: 100%;
  background: var(--of-accent-default, var(--of-text-strong));
  border-radius: 999px;
  transition: width 0.15s ease;
}
.of-field-progress-slider {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.of-field-progress-label {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-color-gray-500));
  min-width: 36px;
  text-align: right;
}
</style>
