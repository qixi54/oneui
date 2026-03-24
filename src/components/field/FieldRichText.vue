<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import type { CellValue } from "@/components/table/FieldCell.vue";
import { useStandaloneField, type StandaloneFieldProps } from "./standalone";

const props = defineProps<StandaloneFieldProps>();
const emit = defineEmits<{
  commit: [value: CellValue | null];
  cancel: [];
  tabNext: [];
  "update:modelValue": [value: CellValue | null];
}>();

const editorRef = ref<HTMLDivElement | null>(null);
const { isStandalone, currentValue, resolvedDisabled } = useStandaloneField(props);
const local = ref(typeof currentValue.value === "string" ? currentValue.value : "");

watch(currentValue, (value) => {
  local.value = typeof value === "string" ? value : "";
  if (editorRef.value && editorRef.value.innerHTML !== local.value) {
    editorRef.value.innerHTML = local.value;
  }
});

onMounted(() => {
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = local.value;
      if (!isStandalone.value && !resolvedDisabled.value) {
        editorRef.value.focus();
      }
    }
  });
});

function commitValue() {
  const value = editorRef.value?.innerHTML ?? local.value;
  emit("commit", value);
  if (isStandalone.value) {
    emit("update:modelValue", value);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (resolvedDisabled.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
  }
  // Ctrl/Cmd+Enter to commit
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    commitValue();
  }
}

function onBlur() {
  if (resolvedDisabled.value) return;
  commitValue();
}

function execCommand(cmd: string) {
  if (resolvedDisabled.value) return;
  document.execCommand(cmd, false);
  editorRef.value?.focus();
}
</script>

<template>
  <div v-if="isStandalone" class="of-field-standalone">
    <label v-if="label" class="of-field-standalone__label">
      {{ label }}
      <span v-if="required" class="of-field-standalone__required">*</span>
    </label>
    <div
      class="of-field-standalone__control"
      :class="{
        'of-field-standalone__control--error': error,
        'of-field-standalone__control--disabled': resolvedDisabled,
      }"
    >
      <div class="of-field-richtext">
        <div class="of-field-richtext-toolbar">
          <button
            type="button"
            class="of-field-richtext-btn"
            :disabled="resolvedDisabled"
            @mousedown.prevent="execCommand('bold')"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            class="of-field-richtext-btn"
            :disabled="resolvedDisabled"
            @mousedown.prevent="execCommand('italic')"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            class="of-field-richtext-btn"
            :disabled="resolvedDisabled"
            @mousedown.prevent="execCommand('underline')"
          >
            <u>U</u>
          </button>
        </div>
        <div
          ref="editorRef"
          class="of-field-richtext-editor"
          :contenteditable="!resolvedDisabled"
          role="textbox"
          aria-multiline="true"
          tabindex="0"
          @keydown="onKeydown"
          @blur="onBlur"
        />
      </div>
    </div>
    <span v-if="error" class="of-field-standalone__error">{{ error }}</span>
  </div>

  <div v-else class="of-field-richtext">
    <div class="of-field-richtext-toolbar">
      <button type="button" class="of-field-richtext-btn" @mousedown.prevent="execCommand('bold')">
        <strong>B</strong>
      </button>
      <button
        type="button"
        class="of-field-richtext-btn"
        @mousedown.prevent="execCommand('italic')"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        class="of-field-richtext-btn"
        @mousedown.prevent="execCommand('underline')"
      >
        <u>U</u>
      </button>
    </div>
    <div
      ref="editorRef"
      class="of-field-richtext-editor"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      tabindex="0"
      @keydown="onKeydown"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.of-field-standalone {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

.of-field-standalone__label {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary);
}

.of-field-standalone__required {
  color: var(--of-color-error);
  margin-left: var(--of-spacing-0_5);
}

.of-field-standalone__control {
  border: 1px solid var(--of-border-subtle);
  border-radius: var(--of-radius-md);
  background: var(--of-surface-elevated);
  transition: var(--of-transition-fast);
}

.of-field-standalone__control:focus-within {
  border-color: var(--of-accent-default);
  box-shadow: 0 0 0 2px var(--of-accent-soft);
}

.of-field-standalone__control--error {
  border-color: var(--of-color-error);
}

.of-field-standalone__control--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.of-field-standalone__error {
  font-size: var(--of-font-size-xs);
  color: var(--of-color-error);
}

.of-field-richtext {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 60px;
}
.of-field-richtext-toolbar {
  display: flex;
  gap: var(--of-spacing-0_5);
  padding: var(--of-spacing-0_5) var(--of-spacing-1);
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
}
.of-field-richtext-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--of-radius-md);
  background: transparent;
  cursor: pointer;
  font-size: var(--of-font-size-sm);
  color: var(--of-text-secondary, var(--of-color-gray-600));
}
.of-field-richtext-btn:hover {
  background: var(--of-surface-selected, var(--of-color-gray-100));
}
.of-field-richtext-editor {
  flex: 1;
  padding: var(--of-spacing-1) var(--of-spacing-1_5);
  font-size: var(--of-font-size-base);
  outline: none;
  min-height: 40px;
  line-height: var(--of-line-height-normal);
  color: var(--of-text-primary, var(--of-color-text, #1a1a1a));
}
</style>
