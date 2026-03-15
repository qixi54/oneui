<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { GripVertical, Plus, Trash2 } from "lucide-vue-next";
import { VueDraggable } from "vue-draggable-plus";
import {
  isSelectField,
  type FieldDef,
  type FieldDefBase,
  type FieldType,
  type SelectFieldDef,
  type TableSchema,
} from "../../types";

const FIELD_TYPE_OPTIONS: Array<{ value: FieldType; label: string }> = [
  { value: "text", label: "文本" },
  { value: "number", label: "数字" },
  { value: "select", label: "单选" },
  { value: "multi_select", label: "多选" },
  { value: "date", label: "日期" },
  { value: "datetime", label: "日期时间" },
  { value: "checkbox", label: "勾选" },
  { value: "url", label: "链接" },
  { value: "email", label: "邮箱" },
  { value: "phone", label: "电话" },
  { value: "rating", label: "评分" },
  { value: "user", label: "用户" },
  { value: "attachment", label: "附件" },
  { value: "relation", label: "关联" },
  { value: "formula", label: "公式" },
];

const props = withDefaults(
  defineProps<{
    schema: TableSchema;
    title?: string;
    readonly?: boolean;
  }>(),
  {
    title: "Form Designer",
    readonly: false,
  },
);

const emit = defineEmits<{
  "update:schema": [schema: TableSchema];
  change: [schema: TableSchema];
}>();

const localSchema = ref<TableSchema>(cloneSchema(props.schema));

watch(
  () => props.schema,
  (val) => {
    localSchema.value = cloneSchema(val);
  },
  { deep: true },
);

const fieldCountLabel = computed(() => `${localSchema.value.fields.length} 个字段`);

function cloneSchema(schema: TableSchema): TableSchema {
  return {
    ...schema,
    fields: schema.fields.map(cloneField),
    views: schema.views.map((view) => ({ ...view })),
  };
}

function cloneField(field: FieldDef): FieldDef {
  if (isSelectField(field)) {
    return {
      ...field,
      options: field.options.map((opt: SelectFieldDef["options"][number]) => ({ ...opt })),
    };
  }
  return { ...field };
}

function emitSchema() {
  const next = cloneSchema(localSchema.value);
  emit("update:schema", next);
  emit("change", next);
}

function createField(): FieldDef {
  return createFieldOfType("text", {
    id: `field_${Date.now()}`,
    name: "新字段",
    required: false,
    hidden: false,
  });
}

function createFieldOfType(type: FieldType, base: FieldDefBase): FieldDef {
  switch (type) {
    case "text":
      return { ...base, type };
    case "number":
      return { ...base, type };
    case "select":
    case "multi_select":
      return {
        ...base,
        type,
        options: defaultSelectOptions(),
      };
    case "date":
    case "datetime":
      return { ...base, type };
    case "checkbox":
      return { ...base, type };
    case "url":
    case "email":
    case "phone":
      return { ...base, type };
    case "rating":
      return { ...base, type };
    case "user":
      return { ...base, type };
    case "attachment":
      return { ...base, type };
    case "relation":
      return { ...base, type };
    case "formula":
      return { ...base, type, formula: "" };
  }
}

function defaultSelectOptions(): SelectFieldDef["options"] {
  return [
    { value: "option_1", label: "选项 1" },
    { value: "option_2", label: "选项 2" },
  ];
}

function addField() {
  if (props.readonly) return;
  localSchema.value.fields.push(createField());
  emitSchema();
}

function removeField(fieldId: string) {
  if (props.readonly) return;
  localSchema.value.fields = localSchema.value.fields.filter((f) => f.id !== fieldId);
  emitSchema();
}

function onFieldTypeChange(field: FieldDef, nextType: FieldType) {
  const index = localSchema.value.fields.findIndex((item) => item.id === field.id);
  if (index === -1) return;

  const base: FieldDefBase = {
    id: field.id,
    name: field.name,
    required: field.required,
    hidden: field.hidden,
    width: field.width,
  };

  localSchema.value.fields[index] =
    isSelectField(field) && (nextType === "select" || nextType === "multi_select")
      ? {
          ...base,
          type: nextType,
          options: (field as SelectFieldDef).options.map(
            (opt: SelectFieldDef["options"][number]) => ({ ...opt }),
          ),
        }
      : createFieldOfType(nextType, base);
  emitSchema();
}

function updateSelectOptions(field: FieldDef, raw: string) {
  if (!isSelectField(field)) return;
  const items = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  (field as SelectFieldDef).options = items.map((item) => ({ value: item, label: item }));
  emitSchema();
}

function optionsToString(field: FieldDef): string {
  return isSelectField(field)
    ? field.options.map((opt: SelectFieldDef["options"][number]) => opt.label).join(", ")
    : "";
}

function handleDragEnd() {
  emitSchema();
}
</script>

<template>
  <div class="of-form-designer">
    <div class="of-form-designer__header">
      <div>
        <h3 class="of-form-designer__title">{{ title }}</h3>
        <p class="of-form-designer__meta">{{ localSchema.name }} · {{ fieldCountLabel }}</p>
      </div>
      <button v-if="!readonly" class="of-form-designer__add-btn" @click="addField">
        <Plus :size="14" />
        添加字段
      </button>
    </div>

    <VueDraggable
      v-model="localSchema.fields"
      handle=".of-form-designer__drag"
      :disabled="readonly"
      :animation="150"
      @end="handleDragEnd"
    >
      <div v-for="field in localSchema.fields" :key="field.id" class="of-form-designer__row">
        <span class="of-form-designer__drag" :class="{ disabled: readonly }">
          <GripVertical :size="14" />
        </span>

        <div class="of-form-designer__inputs">
          <input
            :value="field.name"
            class="of-form-designer__input"
            placeholder="字段名称"
            :disabled="readonly"
            @input="field.name = String(($event.target as HTMLInputElement).value); emitSchema()"
          />

          <select
            class="of-form-designer__select"
            :value="field.type"
            :disabled="readonly"
            @change="onFieldTypeChange(field, ($event.target as HTMLSelectElement).value as FieldType)"
          >
            <option v-for="option in FIELD_TYPE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <label class="of-form-designer__checkbox-label">
            <input
              type="checkbox"
              :checked="Boolean(field.required)"
              :disabled="readonly"
              @change="field.required = ($event.target as HTMLInputElement).checked; emitSchema()"
            />
            必填
          </label>

          <label class="of-form-designer__checkbox-label">
            <input
              type="checkbox"
              :checked="Boolean(field.hidden)"
              :disabled="readonly"
              @change="field.hidden = ($event.target as HTMLInputElement).checked; emitSchema()"
            />
            隐藏
          </label>
        </div>

        <button
          v-if="!readonly"
          class="of-form-designer__remove-btn"
          @click="removeField(field.id)"
        >
          <Trash2 :size="14" />
        </button>

        <div v-if="field.type === 'select' || field.type === 'multi_select'" class="of-form-designer__options-wrap">
          <label class="of-form-designer__options-label">选项（逗号分隔）</label>
          <input
            :value="optionsToString(field)"
            class="of-form-designer__input"
            placeholder="例如：待办, 进行中, 完成"
            :disabled="readonly"
            @change="updateSelectOptions(field, String(($event.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </VueDraggable>
  </div>
</template>

<style scoped>
.of-form-designer {
  width: 100%;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-xl);
  padding: 14px;
  background: var(--of-color-bg-elevated);
  font-family: var(--of-font-sans);
}

.of-form-designer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.of-form-designer__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--of-color-gray-900);
}

.of-form-designer__meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--of-color-gray-500);
}

.of-form-designer__add-btn {
  border: 1px solid var(--of-color-gray-200);
  background: var(--of-color-gray-50);
  color: var(--of-color-gray-700);
  border-radius: var(--of-radius-md);
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.of-form-designer__add-btn:hover {
  background: var(--of-color-gray-100);
}

.of-form-designer__row {
  border: 1px solid var(--of-color-gray-100);
  border-radius: var(--of-radius-lg);
  padding: 10px;
  margin-bottom: 8px;
}

.of-form-designer__row:last-child {
  margin-bottom: 0;
}

.of-form-designer__drag {
  color: var(--of-color-gray-300);
  cursor: grab;
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
}

.of-form-designer__drag.disabled {
  cursor: not-allowed;
}

.of-form-designer__inputs {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 140px auto auto;
  gap: 8px;
  align-items: center;
}

.of-form-designer__input,
.of-form-designer__select {
  width: 100%;
  min-height: 32px;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-md);
  padding: 6px 10px;
  font-size: 12px;
  box-sizing: border-box;
  color: var(--of-color-gray-800);
  background: var(--of-color-bg-elevated);
}

.of-form-designer__checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--of-color-gray-600);
}

.of-form-designer__remove-btn {
  margin-top: 8px;
  border: none;
  background: transparent;
  color: var(--of-color-error);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--of-radius-sm);
  display: inline-flex;
  align-items: center;
}

.of-form-designer__remove-btn:hover {
  background: var(--of-color-error-light);
}

.of-form-designer__options-wrap {
  margin-top: 8px;
}

.of-form-designer__options-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--of-color-gray-500);
}

@media (max-width: 900px) {
  .of-form-designer__inputs {
    grid-template-columns: 1fr;
  }
}
</style>
