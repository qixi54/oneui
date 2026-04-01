<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useTextOverflow } from "@/composables";
import { useInlineEdit } from "@/composables/useInlineEdit";
import type {
  TableCellEditState,
  TableColumnFieldContract,
  TableColumnFieldOption,
  TableColumnFieldType,
} from "../../types/data-table";

export type FieldType = TableColumnFieldType;
export type FieldOption = TableColumnFieldOption;
export type FieldDef = TableColumnFieldContract;

export type CellValue = string | number | boolean | string[] | null | undefined;

const props = withDefaults(
  defineProps<{
    rowId: string;
    field: FieldDef;
    value?: CellValue;
    readonly?: boolean;
    editing?: boolean;
    state?: TableCellEditState | null;
  }>(),
  {
    value: undefined,
    readonly: false,
    editing: undefined,
    state: null,
  },
);

const emit = defineEmits<{
  commit: [rowId: string, fieldId: string, value: CellValue];
  cancel: [];
  "request-cancel": [];
  tabNext: [];
  "request-edit": [rowId: string, fieldId: string];
}>();

const { isEditing, activate, commit: commitEdit, cancel } = useInlineEdit();

const localEditing = computed(() => isEditing(props.rowId, props.field.id));
const isStateEditing = computed(() => {
  const phase = props.state?.phase;
  return phase === "editing" || phase === "dirty" || phase === "validating" || phase === "error";
});
const isEffectivelyEditing = computed(() => {
  if (props.editing !== undefined) return props.editing;
  if (props.state !== null) return isStateEditing.value;
  return localEditing.value;
});
const isReadonly = computed(() => props.readonly || props.field.readonly);
const isActionable = computed(() => !isReadonly.value);
const hasError = computed(() => props.state?.phase === "error" && props.state.error !== null);
const errorMessage = computed(() => props.state?.error?.message ?? "");

function handleClick() {
  if (isReadonly.value) return;
  if (props.editing !== undefined) {
    emit("request-edit", props.rowId, props.field.id);
    return;
  }
  activate(props.rowId, props.field.id);
}

function handleCommit(value: CellValue) {
  commitEdit(props.rowId, props.field.id, value);
  emit("commit", props.rowId, props.field.id, value);
}

function handleCancel() {
  if (props.editing === undefined) {
    cancel();
  }
  emit("request-cancel");
  emit("cancel");
}

function handleTabNext() {
  emit("tabNext");
}

const editorMap: Record<FieldType, ReturnType<typeof defineAsyncComponent>> = {
  text: defineAsyncComponent(() => import("@/components/field/FieldText.vue")),
  number: defineAsyncComponent(() => import("@/components/field/FieldNumber.vue")),
  checkbox: defineAsyncComponent(() => import("@/components/field/FieldCheckbox.vue")),
  select: defineAsyncComponent(() => import("@/components/field/FieldSelect.vue")),
  multiselect: defineAsyncComponent(() => import("@/components/field/FieldMultiSelect.vue")),
  multi_select: defineAsyncComponent(() => import("@/components/field/FieldMultiSelect.vue")),
  date: defineAsyncComponent(() => import("@/components/field/FieldDate.vue")),
  datetime: defineAsyncComponent(() => import("@/components/field/FieldDatetime.vue")),
  rating: defineAsyncComponent(() => import("@/components/field/FieldRating.vue")),
  url: defineAsyncComponent(() => import("@/components/field/FieldUrl.vue")),
  email: defineAsyncComponent(() => import("@/components/field/FieldEmail.vue")),
  user: defineAsyncComponent(() => import("@/components/field/FieldText.vue")),
  currency: defineAsyncComponent(() => import("@/components/field/FieldCurrency.vue")),
  richtext: defineAsyncComponent(() => import("@/components/field/FieldRichText.vue")),
  auto_number: defineAsyncComponent(() => import("@/components/field/FieldAutoNumber.vue")),
  creator: defineAsyncComponent(() => import("@/components/field/FieldCreator.vue")),
  progress: defineAsyncComponent(() => import("@/components/field/FieldProgress.vue")),
  relation: defineAsyncComponent(() => import("@/components/field/FieldRelation.vue")),
  attachment: defineAsyncComponent(() => import("@/components/field/FieldAttachment.vue")),
  formula: defineAsyncComponent(() => import("@/components/field/FieldText.vue")),
  phone: defineAsyncComponent(() => import("@/components/field/FieldPhone.vue")),
};

const FieldMarkdownPreviewAsync = defineAsyncComponent(
  () => import("@/components/field/FieldMarkdownPreview.vue"),
);

const currentEditor = computed(() => editorMap[props.field.type]);
const isRichtextPreview = computed(
  () => props.field.type === "richtext" && typeof props.value === "string" && props.value.length > 0,
);
function stripMarkdownPreviewText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "[代码]")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[图片]")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\n{2,}/g, " — ")
    .replace(/\n/g, " ")
    .trim();
}

const displayValue = computed(() => {
  const v = props.value;
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "✓" : "—";
  if (props.field.formatter) {
    return String(
      props.field.formatter(v, {
        rowId: props.rowId,
        fieldId: props.field.id,
        originalValue: props.state?.originalValue,
      }),
    );
  }
  return String(v);
});

const previewText = computed(() => {
  if (!isRichtextPreview.value) return displayValue.value;
  return stripMarkdownPreviewText(String(props.value));
});

const previewFont = computed(() =>
  isRichtextPreview.value
    ? "14px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    : "14px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
);

const previewLineHeight = computed(() => (isRichtextPreview.value ? 20 : 20));
const previewMaxLines = computed(() => (isRichtextPreview.value ? 2 : 1));

const textOverflow = useTextOverflow({
  text: previewText,
  font: previewFont,
  lineHeight: previewLineHeight,
  maxLines: previewMaxLines,
  whiteSpace: "normal",
});

const contentRef = textOverflow.targetRef;
const predictedHeight = computed(() => Math.round(textOverflow.predictedHeight.value));
const clampHeight = computed(() => Math.round(textOverflow.clampHeight.value));
const overflowState = computed<"fit" | "overflow" | "unknown">(() => {
  if (isEffectivelyEditing.value) return "unknown";
  return textOverflow.isOverflowing.value ? "overflow" : "fit";
});
</script>

<template>
  <component
    :is="isReadonly || isEffectivelyEditing ? 'div' : 'button'"
    class="of-field-cell"
    :class="{
      'of-field-cell--editing': isEffectivelyEditing,
      'of-field-cell--readonly': isReadonly,
      'of-field-cell--actionable': isActionable,
      'of-field-cell--error': hasError,
    }"
    :data-edit-phase="state?.phase ?? (isEffectivelyEditing ? 'editing' : 'idle')"
    :data-field-cell-content-kind="isRichtextPreview ? 'richtext' : 'text'"
    :data-field-cell-overflow-state="overflowState"
    :data-field-cell-text-length="previewText.length"
    :data-field-cell-predicted-height="predictedHeight"
    :data-field-cell-clamp-height="clampHeight"
    :type="isReadonly || isEffectivelyEditing ? undefined : 'button'"
    :aria-label="`${field.label}字段`"
    :title="isReadonly ? undefined : `点击编辑 ${field.label}`"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <template v-if="isEffectivelyEditing">
      <Suspense>
        <component
          :is="currentEditor"
          :value="value"
          :field="field"
          @commit="handleCommit"
          @cancel="handleCancel"
          @tab-next="handleTabNext"
        />
        <template #fallback>
          <span class="of-field-cell__loading">...</span>
        </template>
      </Suspense>
    </template>

    <template v-else>
      <div
        v-if="isRichtextPreview"
        ref="contentRef"
        class="of-field-cell__preview"
        data-field-cell-preview-mode="richtext"
        :data-field-cell-content-kind="isRichtextPreview ? 'richtext' : 'text'"
        :data-field-cell-overflow-state="overflowState"
        :data-field-cell-text-length="previewText.length"
        :data-field-cell-predicted-height="predictedHeight"
        :data-field-cell-clamp-height="clampHeight"
      >
        <FieldMarkdownPreviewAsync :content="String(value)" :max-lines="2" />
      </div>
      <span
        v-else
        ref="contentRef"
        class="of-field-cell__display"
        data-field-cell-preview-mode="text"
        :data-field-cell-content-kind="isRichtextPreview ? 'richtext' : 'text'"
        :data-field-cell-overflow-state="overflowState"
        :data-field-cell-text-length="previewText.length"
        :data-field-cell-predicted-height="predictedHeight"
        :data-field-cell-clamp-height="clampHeight"
      >
        {{ displayValue }}
      </span>
    </template>

    <span v-if="hasError" class="of-field-cell__error">{{ errorMessage }}</span>
  </component>
</template>

<style scoped>
.of-field-cell {
  position: relative;
  min-height: 28px;
  padding: var(--of-spacing-0_5) var(--of-spacing-1_5);
  cursor: pointer;
  border-radius: var(--of-radius-sm);
  display: flex;
  align-items: center;
  transition: background 0.1s;
}

.of-field-cell:hover:not(.of-field-cell--readonly):not(.of-field-cell--editing) {
  background: var(--of-surface-muted, var(--of-color-bg-hover));
}

.of-field-cell--editing {
  outline: 2px solid var(--of-border-strong, var(--of-color-gray-300));
  outline-offset: -1px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  cursor: default;
  padding: 0 var(--of-spacing-0_5);
}

.of-field-cell--error {
  outline: 2px solid var(--of-danger-border, var(--of-color-danger-500, #dc2626));
  outline-offset: -1px;
}

.of-field-cell--readonly {
  cursor: default;
}

.of-field-cell--actionable:not(.of-field-cell--readonly):not(.of-field-cell--editing) {
  cursor: text;
}

.of-field-cell__display {
  display: block;
  flex: 1;
  min-width: 0;
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary, var(--of-color-gray-700));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.of-field-cell__preview {
  display: block;
  flex: 1;
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.of-field-cell__loading {
  font-size: var(--of-font-size-base);
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
}

.of-field-cell__error {
  position: absolute;
  left: var(--of-spacing-1_5);
  right: var(--of-spacing-1_5);
  bottom: calc(var(--of-spacing-2) * -1);
  font-size: var(--of-font-size-xs, 12px);
  line-height: 1.2;
  color: var(--of-danger-text, var(--of-color-danger-600, #b91c1c));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Touch-optimized: all field editors get larger touch targets on mobile */
@media (max-width: 768px), (pointer: coarse) {
  .of-field-cell {
    min-height: 44px;
  }

  .of-field-cell :deep(.of-field-input) {
    min-height: 44px;
    font-size: var(--of-font-size-lg);
    padding: var(--of-spacing-2) var(--of-spacing-3);
  }

  .of-field-cell__display {
    font-size: var(--of-font-size-md);
    padding: var(--of-spacing-2) 0;
  }
}
</style>
