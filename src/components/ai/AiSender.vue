<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { ArrowUp, Square } from "lucide-vue-next";

const props = defineProps<{
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;
}>();

const emit = defineEmits<{
  send: [content: string];
  cancel: [];
}>();

const content = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const maxRows = computed(() => props.maxRows ?? 6);
const lineHeight = 22; // px, approximate

function adjustHeight() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  const maxHeight = lineHeight * maxRows.value + 16; // padding compensation
  el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
}

async function handleInput() {
  await nextTick();
  adjustHeight();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function handleSend() {
  const text = content.value.trim();
  if (!text || props.disabled) return;
  emit("send", text);
  content.value = "";
  nextTick(() => {
    adjustHeight();
  });
}

function handleCancel() {
  emit("cancel");
}

function handleAction() {
  if (props.disabled) {
    handleCancel();
  } else {
    handleSend();
  }
}
</script>

<template>
  <div class="of-ai-sender" :class="{ 'is-disabled': disabled }">
    <!-- 工具栏（可选） -->
    <div v-if="$slots.tools" class="of-ai-sender__tools">
      <slot name="tools" />
    </div>
    <div class="of-ai-sender__inner">
      <div v-if="$slots.prefix" class="of-ai-sender__prefix">
        <slot name="prefix" />
      </div>
      <textarea
        ref="textareaRef"
        v-model="content"
        class="of-ai-sender__textarea"
        :placeholder="placeholder ?? '输入消息...'"
        :disabled="disabled"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <button
        class="of-ai-sender__action-btn"
        :class="{ 'is-stop': disabled, 'is-empty': !content.trim() && !disabled }"
        :title="disabled ? '停止' : '发送'"
        @click="handleAction"
      >
        <Square v-if="disabled" :size="16" />
        <ArrowUp v-else :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.of-ai-sender {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-xl);
  background: #ffffff;
  transition: border-color 0.15s ease;
  overflow: hidden;
}

.of-ai-sender:focus-within {
  border-color: var(--of-color-primary-400);
}

.of-ai-sender__tools {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--of-color-gray-100);
}

.of-ai-sender__inner {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
}

.of-ai-sender.is-disabled {
  background: var(--of-color-gray-50);
}

.of-ai-sender__prefix {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 2px;
}

.of-ai-sender__textarea {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: var(--of-font-sans);
  font-size: 14px;
  line-height: 22px;
  color: var(--of-color-gray-800);
  padding: 0;
  margin: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.of-ai-sender__textarea::placeholder {
  color: var(--of-color-gray-400);
}

.of-ai-sender__textarea:disabled {
  cursor: not-allowed;
  color: var(--of-color-gray-400);
}

.of-ai-sender__action-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
  background: var(--of-color-primary-600);
  color: #ffffff;
  padding: 0;
  margin-bottom: 2px;
}

.of-ai-sender__action-btn:hover {
  background: var(--of-color-primary-700);
}

.of-ai-sender__action-btn.is-stop {
  background: var(--of-color-gray-700);
}

.of-ai-sender__action-btn.is-stop:hover {
  background: var(--of-color-gray-800);
}

.of-ai-sender__action-btn.is-empty {
  background: var(--of-color-gray-200);
  color: var(--of-color-gray-400);
  cursor: default;
}
</style>
