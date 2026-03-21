<script setup lang="ts">
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();

type AutoNumberField = FieldDef & { prefix?: string };

const prefix =
  props.field.type === "auto_number" && "prefix" in props.field
    ? ((props.field as AutoNumberField).prefix ?? "")
    : "";

const display = props.value != null ? `${prefix}${props.value}` : "";
</script>

<template>
  <span class="of-field-auto-number">{{ display }}</span>
</template>

<style scoped>
.of-field-auto-number {
  display: inline-block;
  padding: 2px 6px;
  font-size: 13px;
  color: var(--of-color-gray-500);
  font-variant-numeric: tabular-nums;
}
</style>
