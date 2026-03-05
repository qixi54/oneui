<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useInlineEdit } from '@/composables/useInlineEdit'

export type FieldType =
  | 'text' | 'number' | 'checkbox' | 'select' | 'multiselect'
  | 'date' | 'datetime' | 'rating' | 'url' | 'email'

export interface FieldOption {
  label: string
  value: string
  color?: string
}

export interface FieldDef {
  id: string
  type: FieldType
  label: string
  options?: FieldOption[]
  max?: number
  readonly?: boolean
}

export type CellValue = string | number | boolean | string[] | null | undefined

const props = withDefaults(
  defineProps<{
    rowId: string
    field: FieldDef
    value?: CellValue
    readonly?: boolean
  }>(),
  { readonly: false }
)

const emit = defineEmits<{
  commit: [rowId: string, fieldId: string, value: CellValue]
  cancel: []
  tabNext: []
}>()

const { isEditing, activate, commit: commitEdit, cancel } = useInlineEdit()

const editing = computed(() => isEditing(props.rowId, props.field.id))
const isReadonly = computed(() => props.readonly || props.field.readonly)

function handleClick() {
  if (isReadonly.value) return
  activate(props.rowId, props.field.id)
}

function handleCommit(value: CellValue) {
  commitEdit(props.rowId, props.field.id, value)
  emit('commit', props.rowId, props.field.id, value)
}

function handleCancel() {
  cancel()
  emit('cancel')
}

function handleTabNext() {
  emit('tabNext')
}

const editorMap: Record<FieldType, ReturnType<typeof defineAsyncComponent>> = {
  text: defineAsyncComponent(() => import('@/components/field/FieldText.vue')),
  number: defineAsyncComponent(() => import('@/components/field/FieldNumber.vue')),
  checkbox: defineAsyncComponent(() => import('@/components/field/FieldCheckbox.vue')),
  select: defineAsyncComponent(() => import('@/components/field/FieldSelect.vue')),
  multiselect: defineAsyncComponent(() => import('@/components/field/FieldMultiSelect.vue')),
  date: defineAsyncComponent(() => import('@/components/field/FieldDate.vue')),
  datetime: defineAsyncComponent(() => import('@/components/field/FieldDatetime.vue')),
  rating: defineAsyncComponent(() => import('@/components/field/FieldRating.vue')),
  url: defineAsyncComponent(() => import('@/components/field/FieldUrl.vue')),
  email: defineAsyncComponent(() => import('@/components/field/FieldEmail.vue')),
}

const currentEditor = computed(() => editorMap[props.field.type])

const displayValue = computed(() => {
  const v = props.value
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'boolean') return v ? '✓' : '—'
  return String(v)
})
</script>

<template>
  <div
    class="of-field-cell"
    :class="{
      'of-field-cell--editing': editing,
      'of-field-cell--readonly': isReadonly,
    }"
    @click="handleClick"
  >
    <template v-if="editing">
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
      <span class="of-field-cell__display">{{ displayValue }}</span>
    </template>
  </div>
</template>

<style scoped>
.of-field-cell {
  position: relative;
  min-height: 28px;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  transition: background 0.1s;
}

.of-field-cell:hover:not(.of-field-cell--readonly):not(.of-field-cell--editing) {
  background: var(--of-color-gray-50, #f9f9f9);
}

.of-field-cell--editing {
  outline: 2px solid var(--of-color-primary, #1677ff);
  outline-offset: -1px;
  background: var(--of-color-bg-canvas, #fff);
  cursor: default;
  padding: 0;
}

.of-field-cell--readonly {
  cursor: default;
}

.of-field-cell__display {
  font-size: 13px;
  color: var(--of-color-text, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.of-field-cell__loading {
  font-size: 13px;
  color: var(--of-color-gray-400, #aaa);
}
</style>
