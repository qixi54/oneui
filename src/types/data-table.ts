import type { DataRecord, Density } from "./index";

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
