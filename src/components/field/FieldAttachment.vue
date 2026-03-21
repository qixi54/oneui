<script setup lang="ts">
import { ref } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue | null]; cancel: []; tabNext: [] }>();

// Value is expected to be a string[] of file URLs/names
const files = ref<string[]>(
  Array.isArray(props.value)
    ? props.value.filter((v): v is string => typeof v === "string")
    : typeof props.value === "string" && props.value
      ? [props.value]
      : [],
);

const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerUpload() {
  fileInputRef.value?.click();
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.length) return;
  const newFiles = Array.from(input.files).map((f) => f.name);
  files.value = [...files.value, ...newFiles];
  emit("commit", files.value.length > 0 ? files.value : null);
}

function removeFile(index: number) {
  files.value.splice(index, 1);
  emit("commit", files.value.length > 0 ? [...files.value] : null);
}

</script>

<template>
  <div class="of-field-attachment" role="group" aria-label="附件编辑器">
    <div v-if="files.length > 0" class="of-field-attachment-list">
      <div v-for="(file, idx) in files" :key="idx" class="of-field-attachment-item">
        <span class="of-field-attachment-name">{{ file }}</span>
        <button type="button" class="of-field-attachment-remove" @click="removeFile(idx)">
          ×
        </button>
      </div>
    </div>
    <button type="button" class="of-field-attachment-add" @click="triggerUpload">+ 添加附件</button>
    <input
      ref="fileInputRef"
      type="file"
      multiple
      aria-label="选择附件"
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<style scoped>
.of-field-attachment {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 4px;
  outline: none;
}
.of-field-attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.of-field-attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 12px;
  background: var(--of-surface-muted, var(--of-color-gray-100));
  border-radius: 6px;
  color: var(--of-text-primary, var(--of-color-text, #1a1a1a));
}
.of-field-attachment-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.of-field-attachment-remove {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  padding: 0;
  line-height: 1;
}
.of-field-attachment-add {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px dashed var(--of-border-subtle, var(--of-color-gray-300));
  border-radius: 6px;
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-gray-500));
  cursor: pointer;
}
.of-field-attachment-add:hover {
  border-color: var(--of-border-strong, var(--of-text-secondary));
  color: var(--of-accent-strong, var(--of-text-strong));
}
</style>
