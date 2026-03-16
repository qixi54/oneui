<script setup lang="ts">
import { ref } from "vue";
import { Upload, X } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    modelValue?: File[];
    multiple?: boolean;
    accept?: string;
    maxCount?: number;
    disabled?: boolean;
    hint?: string;
  }>(),
  {
    modelValue: () => [],
    multiple: false,
    accept: "",
    maxCount: 1,
    hint: "点击或拖拽文件到此处上传",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: File[]];
  change: [value: File[]];
}>();

const dragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function normalizeFiles(list: FileList | null): File[] {
  if (!list) return props.modelValue ?? [];
  const incoming = Array.from(list);
  const merged = props.multiple ? [...(props.modelValue ?? []), ...incoming] : incoming.slice(0, 1);
  return merged.slice(0, Math.max(props.maxCount, 1));
}

function updateFiles(list: FileList | null) {
  if (props.disabled) return;
  const files = normalizeFiles(list);
  emit("update:modelValue", files);
  emit("change", files);
}

function onSelect(event: Event) {
  updateFiles((event.target as HTMLInputElement).files);
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  dragging.value = false;
  updateFiles(event.dataTransfer?.files ?? null);
}

function removeAt(index: number) {
  if (props.disabled) return;
  const next = [...(props.modelValue ?? [])];
  next.splice(index, 1);
  emit("update:modelValue", next);
  emit("change", next);
}

function triggerPick() {
  if (props.disabled) return;
  fileInput.value?.click();
}
</script>

<template>
  <div class="of-file-upload">
    <input
      ref="fileInput"
      class="of-file-upload__native"
      type="file"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      @change="onSelect"
    />

    <button
      type="button"
      class="of-file-upload__dropzone"
      :class="{ dragging, disabled }"
      :disabled="disabled"
      @click="triggerPick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop="onDrop"
    >
      <Upload :size="16" />
      <span>{{ hint }}</span>
    </button>

    <ul v-if="modelValue && modelValue.length" class="of-file-upload__list">
      <li
        v-for="(file, index) in modelValue"
        :key="`${file.name}-${index}`"
        class="of-file-upload__item"
      >
        <span class="of-file-upload__name">{{ file.name }}</span>
        <span class="of-file-upload__size">{{ (file.size / 1024).toFixed(1) }} KB</span>
        <button
          type="button"
          class="of-file-upload__remove"
          :disabled="disabled"
          @click="removeAt(index)"
        >
          <X :size="14" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.of-file-upload {
  display: grid;
  gap: 10px;
}

.of-file-upload__native {
  display: none;
}

.of-file-upload__dropzone {
  width: 100%;
  min-height: 84px;
  border: 1px dashed var(--of-color-gray-300);
  border-radius: 10px;
  background: var(--of-color-bg-elevated);
  color: var(--of-color-gray-600);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-file-upload__dropzone.dragging {
  border-color: var(--of-color-primary-500);
  background: var(--of-color-primary-50);
  color: var(--of-color-primary-600);
}

.of-file-upload__dropzone.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.of-file-upload__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.of-file-upload__item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--of-color-gray-200);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--of-color-bg-elevated);
}

.of-file-upload__name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--of-color-text);
  font-size: 12px;
}

.of-file-upload__size {
  color: var(--of-color-gray-500);
  font-size: 11px;
}

.of-file-upload__remove {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--of-color-gray-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.of-file-upload__remove:hover {
  background: var(--of-color-gray-100);
  color: var(--of-color-gray-700);
}
</style>
