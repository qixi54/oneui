import { computed, type Ref, type ComputedRef } from "vue";
import type { FieldDef, TableColumn, TableSchema, ViewConfig } from "../types";

// ─── Validation ─────────────────────────────────────────────────────────────

export interface ValidationRule {
  fieldId: string;
  type: "required" | "min" | "max" | "pattern" | "custom";
  message: string;
  validate: (value: unknown) => boolean;
}

// ─── Filter Panel Config ────────────────────────────────────────────────────

export interface FilterFieldConfig {
  fieldId: string;
  label: string;
  type: "string" | "number" | "date" | "select" | "boolean";
  options?: { value: string; label: string }[];
}

export interface FilterPanelConfig {
  fields: FilterFieldConfig[];
}

// ─── Schema Engine ──────────────────────────────────────────────────────────

export interface UseSchemaEngineOptions {
  schema: Ref<TableSchema | undefined>;
  view?: Ref<ViewConfig | undefined>;
}

export function useSchemaEngine(options: UseSchemaEngineOptions) {
  // ── Resolved visible fields ─────────────────────────────────────────────

  const fieldDefs: ComputedRef<FieldDef[]> = computed(() => {
    const schema = options.schema.value;
    if (!schema) return [];

    const view = options.view?.value;
    if (view?.visibleFields && view.visibleFields.length > 0) {
      const fieldMap = new Map(schema.fields.map((f) => [f.id, f]));
      return view.visibleFields
        .map((id) => fieldMap.get(id))
        .filter((f): f is FieldDef => f !== undefined && !f.hidden);
    }

    return schema.fields.filter((f) => !f.hidden);
  });

  // ── Auto-generated columns ──────────────────────────────────────────────

  const columns: ComputedRef<TableColumn[]> = computed(() => {
    return fieldDefs.value.map((field) => fieldToColumn(field));
  });

  // ── Validation rules from schema ────────────────────────────────────────

  const validationRules: ComputedRef<Map<string, ValidationRule[]>> = computed(() => {
    const rules = new Map<string, ValidationRule[]>();
    const schema = options.schema.value;
    if (!schema) return rules;

    for (const field of schema.fields) {
      const fieldRules: ValidationRule[] = [];

      if (field.required) {
        fieldRules.push({
          fieldId: field.id,
          type: "required",
          message: `${field.name} 为必填项`,
          validate: (value) => value !== null && value !== undefined && value !== "",
        });
      }

      if (field.type === "number") {
        if (field.min !== undefined) {
          const min = field.min;
          fieldRules.push({
            fieldId: field.id,
            type: "min",
            message: `${field.name} 不能小于 ${min}`,
            validate: (value) => typeof value === "number" && value >= min,
          });
        }
        if (field.max !== undefined) {
          const max = field.max;
          fieldRules.push({
            fieldId: field.id,
            type: "max",
            message: `${field.name} 不能大于 ${max}`,
            validate: (value) => typeof value === "number" && value <= max,
          });
        }
      }

      if (field.type === "email") {
        fieldRules.push({
          fieldId: field.id,
          type: "pattern",
          message: `${field.name} 格式不正确`,
          validate: (value) =>
            typeof value !== "string" || value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        });
      }

      if (field.type === "url") {
        fieldRules.push({
          fieldId: field.id,
          type: "pattern",
          message: `${field.name} 不是有效的 URL`,
          validate: (value) => {
            if (typeof value !== "string" || value === "") return true;
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          },
        });
      }

      if (fieldRules.length > 0) {
        rules.set(field.id, fieldRules);
      }
    }

    return rules;
  });

  // ── Filter config auto-generation ───────────────────────────────────────

  const filterConfig: ComputedRef<FilterPanelConfig> = computed(() => {
    return {
      fields: fieldDefs.value.map((field) => fieldToFilterConfig(field)),
    };
  });

  // ── Formula dependency graph ────────────────────────────────────────────

  const formulaDependencyGraph: ComputedRef<Map<string, string[]>> = computed(() => {
    const graph = new Map<string, string[]>();
    const schema = options.schema.value;
    if (!schema) return graph;

    for (const field of schema.fields) {
      if (field.type === "formula" && field.dependencies) {
        graph.set(field.id, [...field.dependencies]);
      }
    }

    return graph;
  });

  return {
    columns,
    fieldDefs,
    validationRules,
    filterConfig,
    formulaDependencyGraph,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const FIELD_TYPE_TO_COL_TYPE: Record<string, TableColumn["type"]> = {
  text: "string",
  number: "number",
  currency: "number",
  progress: "number",
  rating: "number",
  date: "date",
  datetime: "date",
  select: "status",
  multi_select: "status",
};

function fieldToColumn(field: FieldDef): TableColumn {
  return {
    key: field.id,
    label: field.name,
    width: field.width ?? "fill",
    type: FIELD_TYPE_TO_COL_TYPE[field.type] ?? "string",
    hidden: field.hidden,
  };
}

function fieldToFilterConfig(field: FieldDef): FilterFieldConfig {
  const base: FilterFieldConfig = {
    fieldId: field.id,
    label: field.name,
    type: "string",
  };

  switch (field.type) {
    case "number":
    case "currency":
    case "progress":
    case "rating":
      base.type = "number";
      break;
    case "date":
    case "datetime":
      base.type = "date";
      break;
    case "checkbox":
      base.type = "boolean";
      break;
    case "select":
    case "multi_select":
      base.type = "select";
      base.options = field.options.map((o) => ({ value: o.value, label: o.label }));
      break;
  }

  return base;
}
