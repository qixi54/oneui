<script setup lang="ts">
import { Plus, Trash2, X } from "lucide-vue-next";
import type { TableColumn } from "../../types";
import type {
  FilterCondition,
  FilterLogic,
  FilterOperator,
} from "../../composables/useTableFilter";

const props = defineProps<{
  columns: TableColumn[];
  conditions: readonly FilterCondition[];
  logic: FilterLogic;
  visible?: boolean;
}>();

const emit = defineEmits<{
  "add-condition": [];
  "remove-condition": [id: string];
  "update-condition": [id: string, update: Partial<FilterCondition>];
  "update:logic": [logic: FilterLogic];
  clear: [];
  close: [];
}>();

const STRING_OPS = [
  { value: "contains", label: "包含" },
  { value: "not_contains", label: "不包含" },
  { value: "equals", label: "等于" },
  { value: "not_equals", label: "不等于" },
  { value: "starts_with", label: "开头是" },
  { value: "ends_with", label: "结尾是" },
  { value: "is_empty", label: "为空" },
  { value: "is_not_empty", label: "不为空" },
];

function getColType(key: string) {
  return props.columns.find((c) => c.key === key)?.type;
}

function getOperators(key: string) {
  const type = getColType(key);
  if (type === "number") {
    return [
      { value: "equals", label: "等于" },
      { value: "not_equals", label: "不等于" },
      { value: "gt", label: "大于" },
      { value: "gte", label: "大于等于" },
      { value: "lt", label: "小于" },
      { value: "lte", label: "小于等于" },
      { value: "is_empty", label: "为空" },
      { value: "is_not_empty", label: "不为空" },
    ];
  }
  return STRING_OPS;
}

const noValueOps: FilterOperator[] = ["is_empty", "is_not_empty"];

function isNoValue(op: FilterOperator) {
  return noValueOps.includes(op);
}
</script>

<template>
  <div v-if="visible !== false" class="of-filter-panel">
    <div class="of-filter-panel__header">
      <span class="of-filter-panel__title">筛选</span>
      <button class="of-filter-panel__close" @click="emit('close')">
        <X :size="14" />
      </button>
    </div>

    <div v-if="conditions.length === 0" class="of-filter-panel__empty">
      暂无筛选条件，点击下方添加
    </div>

    <div v-else class="of-filter-panel__conditions">
      <div v-for="(cond, idx) in conditions" :key="cond.id" class="of-filter-condition">
        <span v-if="idx === 0" class="of-filter-condition__logic-label">当</span>
        <span v-else class="of-filter-condition__logic-group">
          <button
            class="of-filter-condition__logic-btn"
            :class="{ active: logic === 'and' }"
            @click="emit('update:logic', 'and')"
          >
            且
          </button>
          <button
            class="of-filter-condition__logic-btn"
            :class="{ active: logic === 'or' }"
            @click="emit('update:logic', 'or')"
          >
            或
          </button>
        </span>

        <select
          class="of-filter-condition__select of-filter-condition__select--field"
          :value="cond.field"
          @change="
            emit('update-condition', cond.id, { field: ($event.target as HTMLSelectElement).value })
          "
        >
          <option v-for="col in columns" :key="col.key" :value="col.key">{{ col.label }}</option>
        </select>

        <select
          class="of-filter-condition__select"
          :value="cond.operator"
          @change="
            emit('update-condition', cond.id, {
              operator: ($event.target as HTMLSelectElement).value as FilterOperator,
            })
          "
        >
          <option v-for="op in getOperators(cond.field)" :key="op.value" :value="op.value">
            {{ op.label }}
          </option>
        </select>

        <input
          v-if="!isNoValue(cond.operator)"
          class="of-filter-condition__input"
          :value="cond.value"
          placeholder="输入值..."
          @input="
            emit('update-condition', cond.id, { value: ($event.target as HTMLInputElement).value })
          "
        />
        <span v-else class="of-filter-condition__no-value" />

        <button class="of-filter-condition__remove" @click="emit('remove-condition', cond.id)">
          <Trash2 :size="13" />
        </button>
      </div>
    </div>

    <div class="of-filter-panel__footer">
      <button class="of-filter-panel__add-btn" @click="emit('add-condition')">
        <Plus :size="13" />
        添加条件
      </button>
      <button v-if="conditions.length" class="of-filter-panel__clear" @click="emit('clear')">
        清除全部
      </button>
    </div>
  </div>
</template>

<style scoped>
.of-filter-panel {
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-xl);
  box-shadow: var(--of-shadow-modal);
  min-width: 420px;
  padding: 12px 16px;
  font-family: var(--of-font-sans);
}

.of-filter-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.of-filter-panel__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--of-color-gray-800);
}

.of-filter-panel__close {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--of-color-gray-400);
  padding: 2px;
  border-radius: var(--of-radius-sm);
  display: flex;
  align-items: center;
}

.of-filter-panel__close:hover {
  color: var(--of-color-gray-600);
  background: var(--of-color-gray-100);
}

.of-filter-panel__empty {
  font-size: 12px;
  color: var(--of-color-gray-400);
  text-align: center;
  padding: 12px 0;
}

.of-filter-panel__conditions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.of-filter-condition {
  display: flex;
  align-items: center;
  gap: 6px;
}

.of-filter-condition__logic-label {
  font-size: 12px;
  color: var(--of-color-gray-500);
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.of-filter-condition__logic-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 28px;
}

.of-filter-condition__logic-btn {
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-sm);
  background: none;
  cursor: pointer;
  color: var(--of-color-gray-500);
  margin: 0 1px;
}

.of-filter-condition__logic-btn.active {
  background: var(--of-color-primary-100);
  border-color: var(--of-color-primary-300);
  color: var(--of-color-primary-700);
  font-weight: 600;
}

.of-filter-condition__select,
.of-filter-condition__input {
  font-size: 12px;
  font-family: var(--of-font-sans);
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-md);
  padding: 4px 8px;
  background: var(--of-color-bg-elevated);
  color: var(--of-color-gray-800);
  outline: none;
}

.of-filter-condition__select {
  flex-shrink: 0;
}

.of-filter-condition__select--field {
  max-width: 110px;
}

.of-filter-condition__input {
  flex: 1;
  min-width: 80px;
}

.of-filter-condition__no-value {
  flex: 1;
}

.of-filter-condition__remove {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--of-color-gray-400);
  padding: 3px;
  border-radius: var(--of-radius-sm);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.of-filter-condition__remove:hover {
  color: var(--of-color-error);
  background: var(--of-color-error-light);
}

.of-filter-panel__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--of-color-gray-100);
}

.of-filter-panel__add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-family: var(--of-font-sans);
  color: var(--of-color-primary-600);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--of-radius-md);
}

.of-filter-panel__add-btn:hover {
  background: var(--of-color-primary-50);
}

.of-filter-panel__clear {
  font-size: 12px;
  color: var(--of-color-gray-400);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--of-font-sans);
  margin-left: auto;
}

.of-filter-panel__clear:hover {
  color: var(--of-color-error);
}
</style>
