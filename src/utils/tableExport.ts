import type {
  TableExportBuildOptions,
  TableExportColumn,
  TableExportFieldMapping,
  TableExportMatrix,
} from "../types/table-import-export";

const DEFAULT_COLUMN_WIDTH = 10;
const MAX_COLUMN_WIDTH = 48;

function normalizeHeaderLabel(column: TableExportColumn, mapping?: TableExportFieldMapping) {
  return mapping?.targetLabel?.trim() || column.label || column.key;
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((item) => normalizeCellValue(item)).filter(Boolean).join(", ");
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const entity = value as { label?: unknown; name?: unknown; title?: unknown; id?: unknown };
    if (typeof entity.label === "string" && entity.label) return entity.label;
    if (typeof entity.name === "string" && entity.name) return entity.name;
    if (typeof entity.title === "string" && entity.title) return entity.title;
    if (typeof entity.id === "string" && entity.id) return entity.id;
    return JSON.stringify(value);
  }
  return String(value);
}

function resolveFieldMapping(
  column: TableExportColumn,
  fieldMappings: readonly TableExportFieldMapping[],
) {
  return (
    fieldMappings.find((mapping) => mapping.targetKey === column.key) ??
    fieldMappings.find((mapping) => mapping.sourceKey === column.sourceKey) ??
    fieldMappings.find((mapping) => mapping.sourceKey === column.key) ??
    null
  );
}

export function resolveTableExportColumns(
  columns: readonly TableExportColumn[],
  options?: Pick<TableExportBuildOptions, "includeHidden" | "fieldMappings">,
) {
  const includeHidden = options?.includeHidden ?? false;
  const fieldMappings = options?.fieldMappings ?? [];

  return columns
    .filter((column) => includeHidden || !column.hidden)
    .map((column) => {
      const mapping = resolveFieldMapping(column, fieldMappings);
      return {
        key: mapping?.sourceKey || column.sourceKey || column.key,
        label: normalizeHeaderLabel(column, mapping ?? undefined),
      };
    });
}

export function buildTableExportMatrix(options: TableExportBuildOptions): TableExportMatrix {
  const exportColumns = resolveTableExportColumns(options.columns, {
    includeHidden: options.includeHidden,
    fieldMappings: options.fieldMappings,
  });

  const headers = exportColumns.map((column) => column.label);
  const keys = exportColumns.map((column) => column.key);
  const rows = options.data.map((record) => keys.map((key) => normalizeCellValue(record[key])));
  const matrix = [headers, ...rows];
  const widths = keys.map((_, columnIndex) => {
    const headerWidth = Math.max(DEFAULT_COLUMN_WIDTH, headers[columnIndex]?.length ?? DEFAULT_COLUMN_WIDTH);
    const contentWidth = rows.reduce((currentMax, row) => {
      return Math.max(currentMax, row[columnIndex]?.length ?? 0);
    }, headerWidth);

    return {
      wch: Math.min(MAX_COLUMN_WIDTH, Math.max(DEFAULT_COLUMN_WIDTH, contentWidth + 2)),
    };
  });

  return {
    headers,
    rows,
    keys,
    matrix,
    widths,
  };
}
