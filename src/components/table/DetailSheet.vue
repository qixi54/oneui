<script setup lang="ts">
import { computed, defineComponent, h, ref, Teleport, Transition } from "vue";
import FieldCell from "./FieldCell.vue";
import type { CellValue, FieldDef as CellFieldDef } from "./FieldCell.vue";
import type { TableColumn } from "../../types";
import { useMarkdown } from "@/composables/useMarkdown";

type TableRow = Record<string, unknown> & { id: string };

const props = defineProps<{
  row: TableRow;
  columns: TableColumn[];
  fieldDefs?: CellFieldDef[];
  visible: boolean;
  /** 作为右侧工作区内嵌时，不渲染 Teleport / 遮罩层 */
  embedded?: boolean;
  /** 标记哪些字段是 content 字段（全宽 markdown 渲染） */
  contentFields?: string[];
  /** 是否显示为全屏模式（桌面端宽面板） */
  fullPage?: boolean;
  /** 只读模式 */
  readonly?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: { rowId: string; fields: Record<string, unknown> }];
  delete: [rowId: string];
  "cell-edit": [payload: { rowId: string; fieldId: string; value: unknown }];
}>();

const { renderMarkdown } = useMarkdown({ showCopyButton: true });

const DetailSheetShell = defineComponent({
  name: "DetailSheetShell",
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    fullPage: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    cancel: () => true,
  },
  setup(shellProps, { emit: shellEmit, slots }) {
    return () => {
      if (shellProps.embedded) {
        if (!shellProps.visible) return null;
        return h(
          "div",
          { class: ["of-detail-sheet-shell", "of-detail-sheet-shell--embedded"] },
          slots.default?.(),
        );
      }

      return h(
        Teleport,
        { to: "body" },
        h(
          Transition,
          { name: "of-sheet" },
          {
            default: () =>
              shellProps.visible
                ? h(
                    "div",
                    {
                      class: [
                        "of-detail-sheet-overlay",
                        { "of-detail-sheet-overlay--full-page": shellProps.fullPage },
                      ],
                    },
                    [
                      h("button", {
                        type: "button",
                        class: "of-detail-sheet-overlay__hitarea",
                        "aria-label": "关闭详情",
                        onClick: () => shellEmit("cancel"),
                      }),
                      ...(slots.default?.() ?? []),
                    ],
                  )
                : null,
          },
        ),
      );
    };
  },
});

const pendingChanges = ref<Record<string, unknown>>({});
const hasChanges = computed(() => Object.keys(pendingChanges.value).length > 0);
const isVisible = computed(() => props.embedded || props.visible);

/** content 字段 ID 集合 */
const contentFieldSet = computed(() => new Set(props.contentFields ?? []));

/** 判断字段是否为 content 类型 */
function isContentField(col: TableColumn): boolean {
  if (contentFieldSet.value.has(col.key)) return true;
  // 自动检测：如果 fieldDef 是 richtext 类型
  const fd = props.fieldDefs?.find((f) => f.id === col.key);
  return fd?.type === "richtext";
}

/** 属性字段（结构化） */
const propertyColumns = computed(() => props.columns.filter((col) => !isContentField(col)));

/** 内容字段（markdown） */
const contentColumns = computed(() => props.columns.filter((col) => isContentField(col)));

function getFieldDef(colKey: string): CellFieldDef {
  return (
    props.fieldDefs?.find((f) => f.id === colKey) ?? {
      id: colKey,
      type: "text" as const,
      label: colKey,
    }
  );
}

function getCellValue(col: TableColumn): CellValue {
  if (col.key in pendingChanges.value) {
    return pendingChanges.value[col.key] as CellValue;
  }
  return props.row[col.key] as CellValue;
}

/** 渲染 markdown 内容 */
function getRenderedContent(col: TableColumn): string {
  const value = getCellValue(col);
  if (typeof value !== "string" || !value) return "";
  return renderMarkdown(value);
}

function onCellCommit(rowId: string, fieldId: string, value: unknown) {
  pendingChanges.value = { ...pendingChanges.value, [fieldId]: value };
  emit("cell-edit", { rowId, fieldId, value });
}

function handleSave() {
  emit("save", { rowId: props.row.id, fields: { ...pendingChanges.value } });
  pendingChanges.value = {};
  emit("close");
}

function handleCancel() {
  pendingChanges.value = {};
  emit("close");
}

function handleDelete() {
  emit("delete", props.row.id);
  emit("close");
}
</script>

<template>
  <DetailSheetShell
    :embedded="embedded"
    :visible="isVisible"
    :full-page="fullPage"
    @cancel="handleCancel"
  >
    <div class="of-detail-sheet" :class="{ 'of-detail-sheet--full-page': fullPage }">
      <div class="of-detail-sheet__header">
        <button class="of-detail-sheet__close" @click="handleCancel">✕</button>
        <h3 class="of-detail-sheet__title">记录详情</h3>
        <div class="of-detail-sheet__header-spacer" />
      </div>

      <div class="of-detail-sheet__body" :class="{ 'of-detail-sheet__body--full-page': fullPage }">
        <div class="of-detail-sheet__properties">
          <div v-for="col in propertyColumns" :key="col.key" class="of-detail-sheet__field">
            <span class="of-detail-sheet__label">{{ col.label }}</span>
            <div class="of-detail-sheet__cell">
              <FieldCell
                v-if="fieldDefs?.length"
                :row-id="row.id"
                :field="getFieldDef(col.key)"
                :value="getCellValue(col)"
                :readonly="readonly"
                @commit="onCellCommit"
              />
              <span v-else class="of-detail-sheet__value">
                {{ getCellValue(col) ?? "—" }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="contentColumns.length > 0" class="of-detail-sheet__content">
          <div v-for="col in contentColumns" :key="col.key" class="of-detail-sheet__content-block">
            <span class="of-detail-sheet__content-label">{{ col.label }}</span>
            <!-- eslint-disable vue/no-v-html -->
            <!-- Markdown is rendered from the shared sanitizer pipeline in useMarkdown. -->
            <div class="of-detail-sheet__markdown of-markdown" v-html="getRenderedContent(col)" />
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </div>

      <div class="of-detail-sheet__footer">
        <button class="of-detail-sheet__btn of-detail-sheet__btn--delete" @click="handleDelete">
          删除
        </button>
        <div class="of-detail-sheet__footer-spacer" />
        <button class="of-detail-sheet__btn of-detail-sheet__btn--cancel" @click="handleCancel">
          取消
        </button>
        <button
          class="of-detail-sheet__btn of-detail-sheet__btn--save"
          :disabled="!hasChanges"
          @click="handleSave"
        >
          保存
        </button>
      </div>
    </div>
  </DetailSheetShell>
</template>

<style scoped>
.of-detail-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--of-z-overlay);
  background: var(--of-color-overlay);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.of-detail-sheet-overlay__hitarea {
  position: absolute;
  inset: 0;
  border: none;
  background: transparent;
  cursor: default;
}

.of-detail-sheet-overlay--full-page {
  align-items: center;
}

.of-detail-sheet {
  width: 100%;
  max-width: 600px;
  max-height: 90dvh;
  background: var(--of-surface-workspace-raised, var(--of-surface-elevated, #fff));
  box-shadow: var(--of-elevation-modal, var(--of-shadow-modal));
  border-radius: var(--of-radius-2xl) var(--of-radius-2xl) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.of-detail-sheet--full-page {
  width: min(1200px, calc(100vw - 32px));
  max-width: none;
  height: min(95dvh, calc(100dvh - 32px));
  max-height: none;
  border-radius: var(--of-radius-2xl);
}

.of-detail-sheet-shell {
  width: 100%;
  min-width: 0;
}

.of-detail-sheet-shell--embedded {
  display: flex;
  flex: 1;
  min-height: 0;
}

.of-detail-sheet-shell--embedded .of-detail-sheet {
  max-width: none;
  max-height: none;
  height: 100%;
  border-radius: var(--of-radius-xl);
}

.of-detail-sheet__header {
  display: flex;
  align-items: center;
  padding: var(--of-spacing-3) var(--of-spacing-4);
  border-bottom: 1px solid var(--of-border-workspace, var(--of-border-subtle));
  gap: var(--of-spacing-3);
}

.of-detail-sheet__close {
  border: none;
  background: none;
  font-size: var(--of-font-size-xl);
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
  cursor: pointer;
  padding: var(--of-spacing-1);
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.of-detail-sheet__title {
  font-size: var(--of-font-size-lg);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
  margin: 0;
  flex: 1;
  text-align: center;
}

.of-detail-sheet__header-spacer {
  width: 32px;
}

.of-detail-sheet__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--of-spacing-4);
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
}

.of-detail-sheet__body--full-page {
  padding: var(--of-spacing-5) var(--of-spacing-6);
}

/* 属性区 */
.of-detail-sheet__properties {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
}

.of-detail-sheet__field {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

.of-detail-sheet__label {
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
}

.of-detail-sheet__cell {
  min-height: 44px;
  display: flex;
  align-items: center;
  border: 1px solid var(--of-border-workspace, var(--of-border-subtle));
  border-radius: var(--of-radius-lg);
  padding: var(--of-spacing-1) var(--of-spacing-2);
  background: var(--of-surface-workspace, var(--of-surface-elevated));
}

.of-detail-sheet__value {
  font-size: var(--of-font-size-md);
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
  padding: var(--of-spacing-2) 0;
}

/* 内容区 */
.of-detail-sheet__content {
  padding-top: var(--of-spacing-4);
  border-top: 1px solid var(--of-border-workspace, var(--of-border-subtle));
  margin-top: var(--of-spacing-4);
}

.of-detail-sheet__content-block {
  margin-bottom: var(--of-spacing-6);
}

.of-detail-sheet__content-block:last-child {
  margin-bottom: 0;
}

.of-detail-sheet__content-label {
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
  margin-bottom: var(--of-spacing-2);
  display: block;
}

.of-detail-sheet__markdown {
  font-size: var(--of-font-size-md);
  line-height: 1.7;
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
}

/* markdown 内部元素间距 */
.of-detail-sheet__markdown :deep(h1) {
  font-size: var(--of-font-size-2xl);
  margin: var(--of-spacing-4) 0 var(--of-spacing-2);
}
.of-detail-sheet__markdown :deep(h2) {
  font-size: var(--of-font-size-xl);
  margin: var(--of-spacing-3_5) 0 var(--of-spacing-1_5);
}
.of-detail-sheet__markdown :deep(h3) {
  font-size: var(--of-font-size-lg);
  margin: var(--of-spacing-3) 0 var(--of-spacing-1);
}
.of-detail-sheet__markdown :deep(p) {
  margin: var(--of-spacing-2) 0;
}
.of-detail-sheet__markdown :deep(ul),
.of-detail-sheet__markdown :deep(ol) {
  padding-left: var(--of-spacing-5);
  margin: var(--of-spacing-2) 0;
}
.of-detail-sheet__markdown :deep(pre) {
  margin: var(--of-spacing-3) 0;
  border-radius: var(--of-radius-lg);
  overflow-x: auto;
}
.of-detail-sheet__markdown :deep(code) {
  background: var(--of-surface-muted, var(--of-color-gray-100, #f3f4f6));
  padding: 1px var(--of-spacing-1);
  border-radius: var(--of-radius-sm);
  font-size: 0.9em;
}
.of-detail-sheet__markdown :deep(blockquote) {
  border-left: 3px solid var(--of-border-strong, var(--of-color-gray-300, #d1d5db));
  padding-left: var(--of-spacing-3);
  margin: var(--of-spacing-2) 0;
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
}

.of-detail-sheet__footer {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  padding: var(--of-spacing-3) var(--of-spacing-4);
  border-top: 1px solid var(--of-border-workspace, var(--of-border-subtle));
  padding-bottom: max(var(--of-spacing-3), env(safe-area-inset-bottom));
}

.of-detail-sheet__footer-spacer {
  flex: 1;
}

.of-detail-sheet__btn {
  padding: var(--of-spacing-2_5) var(--of-spacing-5);
  border-radius: var(--of-radius-lg);
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-medium);
  border: none;
  cursor: pointer;
  min-height: 44px;
}

.of-detail-sheet__btn--save {
  background: var(--of-surface-selected, var(--of-color-primary-50, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
}

.of-detail-sheet__btn--save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.of-detail-sheet__btn--cancel {
  background: var(--of-surface-workspace, var(--of-surface-muted, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
}

.of-detail-sheet__btn--delete {
  background: transparent;
  color: var(--of-color-error, #dc2626);
}

/* Transition */
.of-sheet-enter-active,
.of-sheet-leave-active {
  transition:
    opacity 0.2s,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.of-sheet-enter-active .of-detail-sheet,
.of-sheet-leave-active .of-detail-sheet {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.of-sheet-enter-from,
.of-sheet-leave-to {
  opacity: 0;
}

.of-sheet-enter-from .of-detail-sheet,
.of-sheet-leave-to .of-detail-sheet {
  transform: translateY(100%);
}
</style>
