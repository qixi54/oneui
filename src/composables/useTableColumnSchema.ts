import { computed, type Ref } from "vue";
import type {
  FieldDef,
  TableColumn,
  TableSchema,
  ViewConfig,
} from "../types";
import type {
  ResolvedTableColumn,
  TableColumnFieldContract,
  TableColumnFieldType,
} from "../types/data-table";
import { DEFAULT_TABLE_COLUMNS } from "../constants/table";

interface LegacyFieldDef {
  id: string;
  type: TableColumnFieldType;
  label: string;
  options?: TableColumnFieldContract["options"];
  max?: number;
  readonly?: boolean;
  hidden?: boolean;
  editorKey?: string;
}

export interface UseTableColumnSchemaOptions {
  columns?: Ref<TableColumn[] | undefined>;
  schema?: Ref<TableSchema | undefined>;
  view?: Ref<ViewConfig | undefined>;
  fieldDefs?: Ref<LegacyFieldDef[] | undefined>;
}

function fieldTypeToColumnType(field: { type: string }): TableColumn["type"] {
  if (field.type === "number" || field.type === "date") return field.type;
  if (field.type === "select") return "status";
  return "string";
}

function normalizeLegacyFieldDef(field: LegacyFieldDef): TableColumnFieldContract {
  return {
    id: field.id,
    label: field.label,
    type: field.type,
    options: field.options,
    max: field.max,
    readonly: field.readonly,
    hidden: field.hidden,
    editorKey: field.editorKey ?? field.type,
  };
}

function normalizeSchemaField(field: FieldDef): TableColumnFieldContract {
  return {
    id: field.id,
    label: field.name,
    type: field.type === "multi_select" ? "multiselect" : field.type,
    readonly: false,
    hidden: field.hidden,
    options: "options" in field && Array.isArray(field.options) ? field.options : undefined,
    max: "max" in field && typeof field.max === "number" ? field.max : undefined,
    editorKey: field.type === "multi_select" ? "multiselect" : field.type,
  };
}

function buildResolvedColumn(
  column: TableColumn,
  field: TableColumnFieldContract,
): ResolvedTableColumn {
  return {
    ...column,
    field,
    editable: !field.readonly,
    editorKey: field.editorKey ?? field.type,
    parser: field.parser,
    formatter: field.formatter,
    validator: field.validator,
  };
}

export function useTableColumnSchema(options: UseTableColumnSchemaOptions) {
  const fieldContracts = computed<Map<string, TableColumnFieldContract>>(() => {
    const next = new Map<string, TableColumnFieldContract>();

    for (const field of options.schema?.value?.fields ?? []) {
      next.set(field.id, normalizeSchemaField(field));
    }

    for (const field of options.fieldDefs?.value ?? []) {
      next.set(field.id, normalizeLegacyFieldDef(field));
    }

    return next;
  });

  const resolvedColumns = computed<ResolvedTableColumn[]>(() => {
    const explicitColumns = options.columns?.value;
    const schemaFields = options.schema?.value?.fields ?? [];
    const sourceColumns: TableColumn[] = explicitColumns?.length
      ? explicitColumns
      : schemaFields.length
        ? (
            options.view?.value?.visibleFields?.length
              ? schemaFields.filter((field) => options.view?.value?.visibleFields?.includes(field.id))
              : schemaFields
          )
            .filter((field) => !field.hidden)
            .map((field) => ({
              key: field.id,
              label: field.name,
              width: field.width,
              type: fieldTypeToColumnType(field),
            }))
        : DEFAULT_TABLE_COLUMNS;

    return sourceColumns.map((column) => {
      const field = fieldContracts.value.get(column.key) ?? {
        id: column.key,
        label: column.label,
        type: "text",
        readonly: false,
        editorKey: "text",
      };
      return buildResolvedColumn(column, field);
    });
  });

  return {
    resolvedColumns,
    fieldContracts,
  };
}
