/**
 * Internal types for DataTable implementation.
 * These are NOT part of the public API.
 */

import type { CellValue, AggregationFn } from "./index";

// ─── Column Resize State ────────────────────────────────────────────────────

export interface ColumnResizeState {
  colKey: string;
  startX: number;
  initialWidth: number;
}

// ─── Fixed Column Config ────────────────────────────────────────────────────

export interface FixedColumnLayout {
  /** Total width of all fixed columns including selector checkbox (40px) */
  totalWidth: number;
  /** Left offset for each fixed column, keyed by column key */
  offsets: Map<string, number>;
}

// ─── Group Aggregation ──────────────────────────────────────────────────────

export interface GroupAggregationResult {
  /** Aggregation function used */
  fn: AggregationFn;
  /** Field ID the aggregation is computed on */
  fieldId: string;
  /** Computed result value */
  value: number;
}

// ─── Flattened Row (Discriminated Union) ────────────────────────────────────

/**
 * Replaces the previous __type string marker pattern.
 * Used in virtual scroll and rendering pipeline.
 */
export type FlattenedRow<T> = FlattenedDataRow<T> | FlattenedGroupHeader | FlattenedDraftRow;

export interface FlattenedDataRow<T> {
  readonly __type: "data-row";
  readonly id: string;
  readonly data: T;
}

export interface FlattenedGroupHeader {
  readonly __type: "group-header";
  readonly id: string;
  readonly groupKey: string;
  /** Full path for nested groups, e.g. ['status:done', 'priority:P0'] */
  readonly groupPath: string[];
  readonly groupLevel: number;
  readonly groupCount: number;
  readonly aggregations?: GroupAggregationResult[];
}

export interface FlattenedDraftRow {
  readonly __type: "draft-row";
  readonly id: string;
  readonly draftId: string;
  readonly fields: Record<string, CellValue>;
  readonly dirtyFields: ReadonlySet<string>;
  readonly validationErrors: ReadonlyMap<string, string>;
}

// ─── Type Guards ────────────────────────────────────────────────────────────

export function isDataRow<T>(row: FlattenedRow<T>): row is FlattenedDataRow<T> {
  return row.__type === "data-row";
}

export function isGroupHeader<T>(row: FlattenedRow<T>): row is FlattenedGroupHeader {
  return row.__type === "group-header";
}

export function isDraftRow<T>(row: FlattenedRow<T>): row is FlattenedDraftRow {
  return row.__type === "draft-row";
}

// ─── Virtual Scroll Internal ────────────────────────────────────────────────

export interface RowHeightConfig {
  dataRow: number;
  groupHeader: number;
  draftRow: number;
  groupSpacing: number;
}

// ─── Keyboard Navigation Internal ───────────────────────────────────────────

export interface CellCoordinate {
  rowIndex: number;
  colIndex: number;
}

// ─── Hover Sync ─────────────────────────────────────────────────────────────

export interface HoverState {
  rowId: string | null;
}
