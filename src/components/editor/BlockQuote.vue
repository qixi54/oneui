<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    content: string;
    cite?: string;
    editable?: boolean;
  }>(),
  {
    cite: undefined,
    editable: false,
  },
);

const emit = defineEmits<{
  "update:content": [value: string];
}>();

const isEditing = ref(false);
const editValue = ref("");

function startEdit() {
  if (!props.editable) return;
  editValue.value = props.content;
  isEditing.value = true;
}

function finishEdit() {
  isEditing.value = false;
  emit("update:content", editValue.value);
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.editable) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  startEdit();
}
</script>

<template>
  <textarea
    v-if="isEditing"
    v-model="editValue"
    class="block-quote__textarea"
    aria-label="引用内容编辑器"
    :rows="Math.max(2, editValue.split('\n').length)"
    autofocus
    @blur="finishEdit"
    @keydown.escape="finishEdit"
  />
  <button
    v-else-if="editable"
    type="button"
    class="block-quote block-quote--editable"
    @click="startEdit"
    @keydown="handleKeydown"
  >
    <p class="block-quote__text">{{ content }}</p>
    <footer v-if="cite" class="block-quote__cite">— {{ cite }}</footer>
  </button>
  <blockquote v-else class="block-quote">
    <p class="block-quote__text">{{ content }}</p>
    <footer v-if="cite" class="block-quote__cite">— {{ cite }}</footer>
  </blockquote>
</template>

<style scoped>
.block-quote {
  background: var(--of-surface-muted, var(--of-color-gray-50));
  border-left: 3px solid var(--of-border-strong, var(--of-color-text-primary));
  border-top: none;
  border-right: none;
  border-bottom: none;
  border-radius: 0 var(--of-radius-sm) var(--of-radius-sm) 0;
  padding: 12px 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  text-align: left;
}

.block-quote--editable {
  cursor: text;
  transition: var(--of-transition-fast);
}

.block-quote--editable:hover {
  background: var(--of-surface-selected, var(--of-color-gray-100));
}

.block-quote__text {
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-text-secondary, var(--of-color-gray-500));
  line-height: 1.6;
  margin: 0;
}

.block-quote__cite {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  font-style: italic;
}

.block-quote__textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--of-border-strong, rgba(15, 23, 42, 0.14));
  border-radius: var(--of-radius-sm);
  padding: 6px 8px;
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-text-primary, var(--of-color-gray-700));
  line-height: 1.6;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  outline: none;
  box-shadow: 0 0 0 2px var(--of-surface-selected, #eceff3);
}
</style>
