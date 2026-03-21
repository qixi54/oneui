<script setup lang="ts">
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();

const display = typeof props.value === "string" ? props.value : "";
const initial = display.charAt(0).toUpperCase();
</script>

<template>
  <div v-if="display" class="of-field-creator">
    <span class="of-field-creator-avatar">{{ initial }}</span>
    <span class="of-field-creator-name">{{ display }}</span>
  </div>
  <span v-else class="of-field-creator-empty">—</span>
</template>

<style scoped>
.of-field-creator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
}
.of-field-creator-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--of-surface-selected, var(--of-surface-muted));
  color: var(--of-accent-strong, var(--of-text-strong));
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.of-field-creator-name {
  font-size: 13px;
  color: var(--of-text-primary, var(--of-color-text, #1a1a1a));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.of-field-creator-empty {
  padding: 2px 6px;
  font-size: 13px;
  color: var(--of-text-tertiary, var(--of-color-gray-300));
}
</style>
