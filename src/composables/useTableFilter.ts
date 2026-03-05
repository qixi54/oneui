import { ref, computed, readonly } from "vue";
import type { TableColumn } from "../types";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "is_empty"
  | "is_not_empty";

export type FilterLogic = "and" | "or";

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

export interface UseTableFilterOptions {
  columns?: TableColumn[];
}

const STRING_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "包含" },
  { value: "not_contains", label: "不包含" },
  { value: "equals", label: "等于" },
  { value: "not_equals", label: "不等于" },
  { value: "starts_with", label: "开头是" },
  { value: "ends_with", label: "结尾是" },
  { value: "is_empty", label: "为空" },
  { value: "is_not_empty", label: "不为空" },
];

const NUMBER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "equals", label: "等于" },
  { value: "not_equals", label: "不等于" },
  { value: "gt", label: "大于" },
  { value: "gte", label: "大于等于" },
  { value: "lt", label: "小于" },
  { value: "lte", label: "小于等于" },
  { value: "is_empty", label: "为空" },
  { value: "is_not_empty", label: "不为空" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

function applyCondition(value: unknown, cond: FilterCondition): boolean {
  const strVal = String(value ?? "").toLowerCase();
  const condVal = cond.value.toLowerCase();
  switch (cond.operator) {
    case "equals":
      return strVal === condVal;
    case "not_equals":
      return strVal !== condVal;
    case "contains":
      return strVal.includes(condVal);
    case "not_contains":
      return !strVal.includes(condVal);
    case "starts_with":
      return strVal.startsWith(condVal);
    case "ends_with":
      return strVal.endsWith(condVal);
    case "is_empty":
      return strVal === "" || value == null;
    case "is_not_empty":
      return strVal !== "" && value != null;
    case "gt":
      return Number(value) > Number(cond.value);
    case "gte":
      return Number(value) >= Number(cond.value);
    case "lt":
      return Number(value) < Number(cond.value);
    case "lte":
      return Number(value) <= Number(cond.value);
    default:
      return true;
  }
}

export function useTableFilter<T extends Record<string, unknown>>(
  options: UseTableFilterOptions = {},
) {
  const conditions = ref<FilterCondition[]>([]);
  const logic = ref<FilterLogic>("and");
  const isActive = computed(() => conditions.value.length > 0);

  function addCondition(field?: string) {
    conditions.value.push({
      id: generateId(),
      field: field ?? options.columns?.[0]?.key ?? "",
      operator: "contains",
      value: "",
    });
  }

  function removeCondition(id: string) {
    conditions.value = conditions.value.filter((c) => c.id !== id);
  }

  function updateCondition(id: string, update: Partial<FilterCondition>) {
    const idx = conditions.value.findIndex((c) => c.id === id);
    if (idx !== -1) conditions.value[idx] = { ...conditions.value[idx], ...update };
  }

  function clearConditions() {
    conditions.value = [];
  }

  function filterData(data: T[]): T[] {
    if (!conditions.value.length) return data;
    return data.filter((row) => {
      const results = conditions.value.map((cond) => {
        if (!cond.field) return true;
        return applyCondition(row[cond.field], cond);
      });
      return logic.value === "and" ? results.every(Boolean) : results.some(Boolean);
    });
  }

  const operatorsFor = (colType?: string) => {
    return colType === "number" ? NUMBER_OPERATORS : STRING_OPERATORS;
  };

  return {
    conditions: readonly(conditions),
    logic,
    isActive,
    addCondition,
    removeCondition,
    updateCondition,
    clearConditions,
    filterData,
    operatorsFor,
  };
}
