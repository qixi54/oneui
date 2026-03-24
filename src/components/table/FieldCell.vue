<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useInlineEdit } from "@/composables/useInlineEdit";

export type FieldType =
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "multiselect"
  | "date"
  | "datetime"
  | "rating"
  | "url"
  | "email"
  | "currency"
  | "richtext"
  | "auto_number"
  | "creator"
  | "progress"
  | "relation"
  | "attachment"
  | "phone";

export interface FieldOption {
  label: string;
  value: string;
  color?: string;
}

export interface FieldDef {
  id: string;
  type: FieldType;
  label: string;
  options?: FieldOption[];
  max?: number;
  readonly?: boolean;
}

export type CellValue = string | number | boolean | string[] | null | undefined;

const props = withDefaults(
  defineProps<{
    rowId: string;
    field: FieldDef;
    value?: CellValue;
    readonly?: boolean;
    editing?: boolean;
  }>(),
  {
    value: undefined,
    readonly: false,
    editing: undefined,
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
const isEffectivelyEditing = computed(() => props.editing ?? localEditing.value);
const isReadonly = computed(() => props.readonly || props.field.readonly);
const isActionable = computed(() => !isReadonly.value);

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
  date: defineAsyncComponent(() => import("@/components/field/FieldDate.vue")),
  datetime: defineAsyncComponent(() => import("@/components/field/FieldDatetime.vue")),
  rating: defineAsyncComponent(() => import("@/components/field/FieldRating.vue")),
  url: defineAsyncComponent(() => import("@/components/field/FieldUrl.vue")),
  email: defineAsyncComponent(() => import("@/components/field/FieldEmail.vue")),
  currency: defineAsyncComponent(() => import("@/components/field/FieldCurrency.vue")),
  richtext: defineAsyncComponent(() => import("@/components/field/FieldRichText.vue")),
  auto_number: defineAsyncComponent(() => import("@/components/field/FieldAutoNumber.vue")),
  creator: defineAsyncComponent(() => import("@/components/field/FieldCreator.vue")),
  progress: defineAsyncComponent(() => import("@/components/field/FieldProgress.vue")),
  relation: defineAsyncComponent(() => import("@/components/field/FieldRelation.vue")),
  attachment: defineAsyncComponent(() => import("@/components/field/FieldAttachment.vue")),
  phone: defineAsyncComponent(() => import("@/components/field/FieldPhone.vue")),
};

const FieldMarkdownPreviewAsync = defineAsyncComponent(
  () => import("@/components/field/FieldMarkdownPreview.vue"),
);

const currentEditor = computed(() => editorMap[props.field.type]);

const displayValue = computed(() => {
  const v = props.value;
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "✓" : "—";
  return String(v);
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
    }"
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
      <FieldMarkdownPreviewAsync
        v-if="field.type === 'richtext' && typeof value === 'string' && value"
        :content="value"
        :max-lines="2"
      />
      <span v-else class="of-field-cell__display">{{ displayValue }}</span>
    </template>
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
  padding: 0;
}

.of-field-cell--readonly {
  cursor: default;
}

.of-field-cell--actionable:not(.of-field-cell--readonly):not(.of-field-cell--editing) {
  cursor: text;
}

.of-field-cell__display {
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary, var(--of-color-gray-700));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.of-field-cell__loading {
  font-size: var(--of-font-size-base);
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
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
