import type { TableColumn } from "./index";

export interface TableExportColumn extends Pick<TableColumn, "key" | "label" | "hidden"> {
  sourceKey?: string;
}

export interface TableExportFieldMapping {
  sourceKey: string;
  targetKey: string;
  targetLabel?: string;
}

export interface TableExportBuildOptions {
  columns: readonly TableExportColumn[];
  data: readonly Record<string, unknown>[];
  includeHidden?: boolean;
  fieldMappings?: readonly TableExportFieldMapping[];
}

export interface TableExportColumnWidth {
  wch: number;
}

export interface TableExportMatrix {
  headers: string[];
  rows: string[][];
  keys: string[];
  matrix: string[][];
  widths: TableExportColumnWidth[];
}

export type TableImportIssueSeverity = "error" | "warning";

export type TableImportIssueCode =
  | "unmapped_header"
  | "duplicate_mapping"
  | "missing_required_field"
  | "missing_required_value";

export interface TableImportColumn extends Pick<TableColumn, "key" | "label" | "hidden"> {
  required?: boolean;
  aliases?: string[];
}

export interface TableImportFieldMapping {
  sourceHeader: string;
  targetKey: string | null;
  targetLabel?: string;
  matchedBy: "label" | "key" | "alias" | "manual" | "unmapped";
}

export interface TableImportManualFieldMapping {
  sourceHeader: string;
  targetKey: string;
}

export interface TableImportValidationIssue {
  code: TableImportIssueCode;
  severity: TableImportIssueSeverity;
  message: string;
  sourceHeader?: string;
  targetKey?: string;
  rowIndex?: number;
  value?: unknown;
}

export interface TableImportPreviewRow {
  rowIndex: number;
  source: Record<string, unknown>;
  values: Record<string, unknown>;
  issues: TableImportValidationIssue[];
  isValid: boolean;
}

export interface TableImportPreviewSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errorCount: number;
  warningCount: number;
  unmappedHeaders: string[];
  missingRequiredFields: string[];
  fieldIssueCount: Record<string, number>;
}

export interface TableImportPreviewOptions {
  columns: readonly TableImportColumn[];
  headers: readonly string[];
  rows: readonly unknown[][];
  fieldMappings?: readonly TableImportManualFieldMapping[];
  requiredFields?: readonly string[];
}

export interface TableImportPreviewResult {
  headers: string[];
  mappings: TableImportFieldMapping[];
  rows: TableImportPreviewRow[];
  issues: TableImportValidationIssue[];
  summary: TableImportPreviewSummary;
}
