<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    content?: string;
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
  editValue.value = props.content ?? "";
  isEditing.value = true;
}

function finishEdit() {
  isEditing.value = false;
  emit("update:content", editValue.value);
}

// 支持 \n 换行的段落数组
const paragraphs = computed(() => {
  if (!props.content) return [];
  return props.content.split("\n").filter((p) => p.trim().length > 0);
});
</script>

<template>
  <div class="content-block" :class="{ 'content-block--editable': editable }" @click="startEdit">
    <!-- Edit Mode -->
    <textarea
      v-if="isEditing"
      v-model="editValue"
      class="content-block__textarea"
      :rows="Math.max(3, editValue.split('\n').length)"
      autofocus
      @blur="finishEdit"
      @keydown.escape="finishEdit"
    />

    <!-- Display Mode with slot or props -->
    <template v-else>
      <slot>
        <p v-for="(para, i) in paragraphs" :key="i" class="content-block__para">
          {{ para }}
        </p>
        <span v-if="paragraphs.length === 0" class="content-block__placeholder">
          {{ editable ? "点击编辑内容..." : "" }}
        </span>
      </slot>
    </template>
  </div>
</template>

<style scoped>
.content-block {
  background: var(--of-color-gray-50);
  border-radius: var(--of-radius-lg);
  padding: var(--of-spacing-4);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-block--editable {
  cursor: text;
  transition: var(--of-transition-fast);
}

.content-block--editable:hover {
  background: var(--of-color-gray-100);
}

.content-block__para {
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  color: var(--of-color-gray-700) !important;
  line-height: 1.6 !important;
  margin: 0;
}

.content-block__placeholder {
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  color: var(--of-color-gray-300) !important;
  font-style: italic;
}

.content-block__textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--of-color-primary-300);
  border-radius: var(--of-radius-sm);
  padding: 8px 10px;
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  color: var(--of-color-gray-700) !important;
  line-height: 1.6;
  background: var(--of-color-bg-elevated);
  outline: none;
  box-shadow: 0 0 0 2px var(--of-color-primary-100);
}
</style>
