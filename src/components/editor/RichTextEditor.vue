<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Modal from "../overlay/Modal.vue";
import { useToast } from "../../composables/useToast";

interface Props {
  modelValue?: string;
  placeholder?: string;
  editable?: boolean;
  minHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请输入内容...",
  editable: true,
  minHeight: 220,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  save: [value: string];
}>();

const toast = useToast();
const localHtml = ref(props.modelValue);
const showLinkModal = ref(false);
const linkText = ref("");
const linkUrl = ref("");
const editorRef = ref<any>(null);

const modules = {
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike"],
      [{ header: [1, 2, 3, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  },
};

watch(
  () => props.modelValue,
  (value) => {
    if (value !== localHtml.value) localHtml.value = value;
  },
);

const canEdit = computed(() => props.editable);

function handleUpdate(value: string) {
  localHtml.value = value;
  emit("update:modelValue", value);
  emit("change", value);
}

function insertLink() {
  const quill = editorRef.value?.getQuill?.();
  if (!quill) return;
  const range = quill.getSelection(true);
  const safeUrl = (linkUrl.value || "").trim();
  if (!safeUrl) return;
  if (linkText.value.trim()) {
    quill.insertText(range.index, linkText.value.trim(), "link", safeUrl);
    quill.setSelection(range.index + linkText.value.trim().length, 0);
  } else {
    quill.format("link", safeUrl);
  }
  showLinkModal.value = false;
  linkText.value = "";
  linkUrl.value = "";
}

function promptInsertLink() {
  if (!canEdit.value) return;
  showLinkModal.value = true;
}

function saveContent() {
  emit("save", localHtml.value || "");
  toast.success("内容已保存");
}
</script>

<template>
  <div
    class="of-rich-editor"
    :class="{ 'is-readonly': !canEdit }"
    :style="{ '--of-rich-editor-min-height': `${minHeight}px` }"
  >
    <div class="of-rich-editor__toolbar-actions">
      <button
        type="button"
        class="of-rich-editor__btn"
        :disabled="!canEdit"
        @click="promptInsertLink"
      >
        插入链接
      </button>
      <button
        type="button"
        class="of-rich-editor__btn of-rich-editor__btn--primary"
        :disabled="!canEdit"
        @click="saveContent"
      >
        保存
      </button>
    </div>

    <QuillEditor
      ref="editorRef"
      theme="snow"
      content-type="html"
      :content="localHtml"
      :options="{ readOnly: !canEdit, placeholder, modules }"
      @update:content="handleUpdate"
    />

    <Modal v-model="showLinkModal" title="插入链接" width="480px">
      <div class="of-rich-editor__form">
        <label class="of-rich-editor__label" for="link-text">链接文本</label>
        <input
          id="link-text"
          v-model="linkText"
          class="of-rich-editor__input"
          placeholder="请输入链接文本"
        />
        <label class="of-rich-editor__label" for="link-url">链接地址</label>
        <input
          id="link-url"
          v-model="linkUrl"
          class="of-rich-editor__input"
          placeholder="https://example.com"
        />
      </div>
      <template #footer>
        <button type="button" class="of-rich-editor__btn" @click="showLinkModal = false">
          取消
        </button>
        <button
          type="button"
          class="of-rich-editor__btn of-rich-editor__btn--primary"
          @click="insertLink"
        >
          确认
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.of-rich-editor {
  border: 1px solid var(--of-border-color);
  border-radius: var(--of-radius-md, 8px);
  background: var(--of-color-bg-elevated);
}

.of-rich-editor__toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 12px 0 12px;
}

.of-rich-editor__btn {
  border: 1px solid var(--of-color-gray-300);
  border-radius: 6px;
  background: var(--of-color-bg-elevated);
  color: var(--of-color-gray-700);
  font-size: 12px;
  line-height: 1;
  padding: 8px 12px;
  cursor: pointer;
}

.of-rich-editor__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.of-rich-editor__btn--primary {
  background: var(--of-color-primary-500);
  color: var(--of-color-text-inverse);
  border-color: var(--of-color-primary-500);
}

.of-rich-editor__btn--primary:hover:not(:disabled) {
  background: var(--of-color-primary-600);
  border-color: var(--of-color-primary-600);
}

.of-rich-editor__form {
  display: grid;
  gap: 8px;
}

.of-rich-editor__label {
  font-size: 12px;
  color: var(--of-color-text-secondary);
}

.of-rich-editor__input {
  border: 1px solid var(--of-border-color);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

.of-rich-editor :deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid var(--of-border-color);
  padding: 8px 10px;
}

.of-rich-editor :deep(.ql-container.ql-snow) {
  border: none;
}

.of-rich-editor :deep(.ql-editor) {
  min-height: var(--of-rich-editor-min-height, 220px);
  font-size: 14px;
  color: var(--of-color-text-primary);
}

.of-rich-editor :deep(.ql-snow .ql-picker.ql-expanded .ql-picker-options) {
  border-color: var(--of-border-color);
}

.of-rich-editor :deep(.ql-snow .ql-stroke) {
  stroke: var(--of-color-text-secondary);
}

.of-rich-editor :deep(.ql-snow .ql-fill) {
  fill: var(--of-color-text-secondary);
}

.of-rich-editor :deep(.ql-snow .ql-active .ql-stroke),
.of-rich-editor :deep(.ql-snow .ql-picker-label.ql-active .ql-stroke),
.of-rich-editor :deep(.ql-snow .ql-picker-item.ql-selected .ql-stroke),
.of-rich-editor :deep(.ql-snow .ql-picker-label:hover .ql-stroke),
.of-rich-editor :deep(.ql-snow .ql-picker-item:hover .ql-stroke) {
  stroke: var(--of-color-primary-500);
}

.of-rich-editor :deep(.ql-snow .ql-active .ql-fill),
.of-rich-editor :deep(.ql-snow .ql-picker-label.ql-active .ql-fill),
.of-rich-editor :deep(.ql-snow .ql-picker-item.ql-selected .ql-fill),
.of-rich-editor :deep(.ql-snow .ql-picker-label:hover .ql-fill),
.of-rich-editor :deep(.ql-snow .ql-picker-item:hover .ql-fill) {
  fill: var(--of-color-primary-500);
}
</style>
