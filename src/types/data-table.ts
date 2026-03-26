import type { DataRecord, Density, FieldType as SchemaFieldType, TableColumn } from "./index";

export interface BulkActionItem {
  key: string;
  label: string | ((context: BulkActionContext<unknown>) => string);
  variant?: "default" | "danger";
  disabled?: boolean | ((context: BulkActionContext<unknown>) => boolean);
  visible?: boolean | ((context: BulkActionContext<unknown>) => boolean);
  clearSelectionAfter?: boolean;
}

export interface BulkActionContext<TRecord = DataRecord> {
  selectionCount: number;
  rowIds: string[];
  rows: TRecord[];
}

export interface ResolvedBulkActionItem extends BulkActionItem {
  resolvedLabel: string;
  resolvedDisabled: boolean;
}

export type TableColumnEditorKey = string;

export type TableColumnFieldType = SchemaFieldType | "multiselect";

export interface TableColumnFieldOption {
  label: string;
  value: string;
  color?: string;
}

export interface TableColumnValidationError {
  code: string;
  message: string;
}

export interface TableColumnValidationContext<TRecord = Record<string, unknown>> {
  rowId: string;
  fieldId: string;
  row?: TRecord;
  originalValue?: unknown;
}

export type TableColumnParser<TRecord = Record<string, unknown>> = (
  value: unknown,
  context: TableColumnValidationContext<TRecord>,
) => unknown;

export type TableColumnFormatter<TRecord = Record<string, unknown>> = (
  value: unknown,
  context: TableColumnValidationContext<TRecord>,
) => string;

export type TableColumnValidator<TRecord = Record<string, unknown>> = (
  value: unknown,
  context: TableColumnValidationContext<TRecord>,
) => TableColumnValidationError | null;

export interface TableColumnFieldContract<TRecord = Record<string, unknown>> {
  id: string;
  type: TableColumnFieldType;
  label: string;
  options?: TableColumnFieldOption[];
  max?: number;
  readonly?: boolean;
  hidden?: boolean;
  editorKey?: TableColumnEditorKey;
  parser?: TableColumnParser<TRecord>;
  formatter?: TableColumnFormatter<TRecord>;
  validator?: TableColumnValidator<TRecord>;
}

export interface ResolvedTableColumn<TRecord = Record<string, unknown>> extends TableColumn {
  field: TableColumnFieldContract<TRecord>;
  editable: boolean;
  editorKey: TableColumnEditorKey;
  parser?: TableColumnParser<TRecord>;
  formatter?: TableColumnFormatter<TRecord>;
  validator?: TableColumnValidator<TRecord>;
}

export type TableEditingPhase =
  | "idle"
  | "editing"
  | "dirty"
  | "validating"
  | "error";

export interface TableEditingCell {
  rowId: string;
  fieldId: string;
}

export interface TableCellEditState {
  rowId: string;
  fieldId: string;
  phase: TableEditingPhase;
  originalValue: unknown;
  draftValue: unknown;
  error: TableColumnValidationError | null;
}

export interface DataTableDensityMetrics {
  headerHeight: number;
  rowHeight: number;
  groupRowHeight: number;
  mobileCardPaddingX: number;
  mobileCardPaddingY: number;
  fillMinWidth: number;
}

export const TABLE_DENSITY_METRICS: Record<Density, DataTableDensityMetrics> = {
  compact: {
    headerHeight: 32,
    rowHeight: 36,
    groupRowHeight: 32,
    mobileCardPaddingX: 12,
    mobileCardPaddingY: 10,
    fillMinWidth: 180,
  },
  standard: {
    headerHeight: 36,
    rowHeight: 44,
    groupRowHeight: 36,
    mobileCardPaddingX: 16,
    mobileCardPaddingY: 12,
    fillMinWidth: 220,
  },
  comfortable: {
    headerHeight: 40,
    rowHeight: 52,
    groupRowHeight: 40,
    mobileCardPaddingX: 18,
    mobileCardPaddingY: 14,
    fillMinWidth: 240,
  },
};
