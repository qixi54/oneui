import type {
  DatabaseViewLegacyDetailPresentation,
  DatabaseViewDetailPresentation,
  DatabaseViewResolvedDetailPresentation,
} from "../contracts/database";
import type {
  CellValue,
  DataRecord,
  FieldDef as SchemaFieldDef,
  TableColumn,
  TableSchema,
} from "../types";

type DetailCellFieldType =
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

export interface DetailCellFieldDef {
  id: string;
  type: DetailCellFieldType;
  label: string;
  options?: { label: string; value: string; color?: string }[];
  max?: number;
  readonly?: boolean;
}

export interface DatabaseWorkspaceModeOption {
  value: Exclude<DatabaseViewDetailPresentation, "auto">;
  label: string;
}

export interface DatabaseDetailPropertyItem {
  key: string;
  label: string;
  field: DetailCellFieldDef | null;
  value: CellValue | undefined;
  fallbackText: string;
}

function inferFieldIdsFromRecords(records: DataRecord[]): string[] {
  const first = records[0];
  return first ? Object.keys(first.fields) : [];
}

function getVisibleFieldIds(
  schema?: TableSchema | null,
  records: DataRecord[] = [],
): string[] {
  const schemaFieldIds = schema?.fields
    ?.filter((field) => !field.hidden)
    .map((field) => field.id);
  if (schemaFieldIds?.length) return schemaFieldIds;
  return inferFieldIdsFromRecords(records);
}

function getFieldLabel(fieldId: string, schema?: TableSchema | null): string {
  return schema?.fields.find((field) => field.id === fieldId)?.name ?? fieldId;
}

function resolveColumnType(field?: SchemaFieldDef): TableColumn["type"] {
  switch (field?.type) {
    case "number":
    case "currency":
    case "progress":
      return "number";
    case "date":
    case "datetime":
      return "date";
    case "select":
    case "multi_select":
      return "status";
    default:
      return "string";
  }
}

function resolveCellFieldType(field?: SchemaFieldDef): DetailCellFieldType {
  switch (field?.type) {
    case "number":
      return "number";
    case "select":
      return "select";
    case "multi_select":
      return "multiselect";
    case "date":
      return "date";
    case "datetime":
      return "datetime";
    case "checkbox":
      return "checkbox";
    case "url":
      return "url";
    case "email":
      return "email";
    case "phone":
      return "phone";
    case "rating":
      return "rating";
    case "attachment":
      return "attachment";
    case "relation":
      return "relation";
    case "formula":
      return "text";
    case "currency":
      return "currency";
    case "richtext":
      return "richtext";
    case "auto_number":
      return "auto_number";
    case "creator":
      return "creator";
    case "progress":
      return "progress";
    case "text":
    default:
      return "text";
  }
}

function normalizeCellValue(value: CellValue | undefined): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  return String(value);
}

export function buildDetailColumns(
  schema?: TableSchema | null,
  records: DataRecord[] = [],
) {
  const orderedFieldIds = getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      key: fieldId,
      label: getFieldLabel(fieldId, schema),
      type: resolveColumnType(field),
      hidden: field?.hidden ?? false,
      width: field?.width,
    } satisfies TableColumn;
  });
}

export function buildDetailFieldDefs(
  schema?: TableSchema | null,
  records: DataRecord[] = [],
) {
  const orderedFieldIds = getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      id: fieldId,
      type: resolveCellFieldType(field),
      label: getFieldLabel(fieldId, schema),
    } satisfies DetailCellFieldDef;
  });
}

export function toDetailRow(
  record: DataRecord | null,
): Record<string, unknown> & { id: string } {
  if (!record) {
    return { id: "__detail-empty__" };
  }

  return {
    id: record.id,
    ...record.fields,
  };
}

export function buildDetailWorkspaceTitle(record: DataRecord | null): string {
  const fields = record?.fields as Record<string, CellValue | undefined> | undefined;
  return (
    normalizeCellValue(
      fields?.title ?? fields?.name ?? fields?.subject ?? record?.id ?? "记录详情",
    ) || "记录详情"
  );
}

export function partitionDetailColumns(
  columns: TableColumn[],
  fieldDefs: DetailCellFieldDef[],
) {
  const contentFieldIds = new Set(
    fieldDefs
      .filter((field) => field.type === "richtext")
      .map((field) => field.id),
  );

  return {
    propertyColumns: columns.filter((column) => !contentFieldIds.has(column.key)),
    contentColumns: columns.filter((column) => contentFieldIds.has(column.key)),
  };
}

export function buildDetailWorkspaceDescription(
  columns: TableColumn[],
  row: Record<string, unknown>,
): string {
  return columns
    .map((column) => {
      const text = normalizeCellValue(row[column.key] as CellValue | undefined).trim();
      if (!text) return "";
      return `## ${column.label}\n\n${text}`;
    })
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function buildDetailPropertyItems(options: {
  columns: TableColumn[];
  fieldDefs: DetailCellFieldDef[];
  row: Record<string, unknown>;
}): DatabaseDetailPropertyItem[] {
  return options.columns.map((column) => {
    const field = options.fieldDefs.find((item) => item.id === column.key) ?? null;
    const value = options.row[column.key] as CellValue | undefined;
    const fallbackText = normalizeCellValue(value).trim() || "—";

    return {
      key: column.key,
      label: column.label,
      field,
      value,
      fallbackText,
    };
  });
}

export function resolveDetailPresentation(options: {
  requested: DatabaseViewDetailPresentation;
  preferred: DatabaseViewResolvedDetailPresentation | null;
  isMobileViewport: boolean;
}): DatabaseViewResolvedDetailPresentation {
  if (options.requested !== "auto") {
    return options.requested === "sheet"
      ? "drawer"
      : options.requested === "full-page"
        ? "fullscreen"
        : options.requested;
  }

  if (options.preferred) {
    if (options.preferred === "side-panel" && options.isMobileViewport) {
      return "drawer";
    }
    return options.preferred;
  }

  return options.isMobileViewport ? "drawer" : "side-panel";
}

export function buildWorkspaceModes(
  isMobileViewport: boolean,
  legacyAlias?: DatabaseViewLegacyDetailPresentation,
): DatabaseWorkspaceModeOption[] {
  const modes: DatabaseWorkspaceModeOption[] = [];
  const drawerValue = legacyAlias === "sheet" ? "sheet" : "drawer";
  const fullscreenValue = legacyAlias === "full-page" ? "full-page" : "fullscreen";

  if (!isMobileViewport) {
    modes.push({ value: "side-panel", label: "侧边面板" });
  }

  modes.push({ value: drawerValue, label: "详情弹窗" });
  modes.push({ value: fullscreenValue, label: "全屏视图" });

  return modes;
}
