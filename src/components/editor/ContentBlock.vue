<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    content?: string;
    editable?: boolean;
  }>(),
  {
    content: "",
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
    class="content-block__textarea"
    aria-label="内容编辑器"
    :rows="Math.max(3, editValue.split('\n').length)"
    autofocus
    @blur="finishEdit"
    @keydown.escape="finishEdit"
  />
  <button
    v-else-if="editable"
    type="button"
    class="content-block content-block--editable"
    @click="startEdit"
    @keydown="handleKeydown"
  >
    <slot>
      <p v-for="(para, i) in paragraphs" :key="i" class="content-block__para">
        {{ para }}
      </p>
      <span v-if="paragraphs.length === 0" class="content-block__placeholder">
        {{ "点击编辑内容..." }}
      </span>
    </slot>
  </button>
  <div v-else class="content-block">
    <slot>
      <p v-for="(para, i) in paragraphs" :key="i" class="content-block__para">
        {{ para }}
      </p>
      <span v-if="paragraphs.length === 0" class="content-block__placeholder">
        {{ "" }}
      </span>
    </slot>
  </div>
</template>

<style scoped>
.content-block {
  background: var(--of-surface-muted, var(--of-color-gray-50));
  border: 1px solid transparent;
  border-radius: var(--of-radius-lg);
  padding: var(--of-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2_5);
  width: 100%;
  text-align: left;
}

.content-block--editable {
  cursor: text;
  transition: var(--of-transition-fast);
}

.content-block--editable:hover {
  background: var(--of-surface-selected, var(--of-color-gray-100));
}

.content-block__para {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary, var(--of-color-gray-700));
  line-height: var(--of-line-height-relaxed);
  margin: 0;
}

.content-block__placeholder {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-base);
  color: var(--of-text-tertiary, var(--of-color-gray-300));
  font-style: italic;
}

.content-block__textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--of-border-strong, rgba(15, 23, 42, 0.14));
  border-radius: var(--of-radius-sm);
  padding: var(--of-spacing-2) var(--of-spacing-2_5);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary, var(--of-color-gray-700));
  line-height: var(--of-line-height-relaxed);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  outline: none;
  box-shadow: 0 0 0 2px var(--of-surface-selected, #eceff3);
}
</style>
