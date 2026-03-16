<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    content: string;
    cite?: string;
    editable?: boolean;
  }>(),
  {
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
</script>

<template>
  <blockquote class="block-quote" :class="{ 'block-quote--editable': editable }" @click="startEdit">
    <!-- Edit Mode -->
    <textarea
      v-if="isEditing"
      v-model="editValue"
      class="block-quote__textarea"
      :rows="Math.max(2, editValue.split('\n').length)"
      autofocus
      @blur="finishEdit"
      @keydown.escape="finishEdit"
    />

    <!-- Display Mode -->
    <template v-else>
      <p class="block-quote__text">{{ content }}</p>
      <footer v-if="cite" class="block-quote__cite">— {{ cite }}</footer>
    </template>
  </blockquote>
</template>

<style scoped>
.block-quote {
  background: var(--of-color-gray-50);
  border-left: 3px solid var(--of-color-text-primary);
  border-radius: 0 var(--of-radius-sm) var(--of-radius-sm) 0;
  padding: 12px 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.block-quote--editable {
  cursor: text;
  transition: var(--of-transition-fast);
}

.block-quote--editable:hover {
  background: var(--of-color-gray-100);
}

.block-quote__text {
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-color-gray-500);
  line-height: 1.6;
  margin: 0;
}

.block-quote__cite {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-color-gray-400);
  font-style: italic;
}

.block-quote__textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--of-color-primary-300);
  border-radius: var(--of-radius-sm);
  padding: 6px 8px;
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-color-gray-700);
  line-height: 1.6;
  background: var(--of-color-bg-elevated);
  outline: none;
  box-shadow: 0 0 0 2px var(--of-color-primary-100);
}
</style>
