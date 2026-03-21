import type { CSSProperties } from "vue";
import type { Density, FieldType, TableColumn } from "../../types";
import type {
  BulkActionContext,
  BulkActionItem,
  ResolvedBulkActionItem,
} from "../../types/data-table";
import type { FieldDef as CellFieldDef } from "./FieldCell.vue";

export function normalizeFieldType(type?: CellFieldDef["type"]): FieldType | undefined {
  if (type === "multiselect") return "multi_select";
  return type;
}

export function resolveRowId(row: Record<string, unknown>, rowKey: string): string {
  const value = row[rowKey];
  return value != null ? String(value) : "";
}

export function resolveFieldDef(
  fieldDefs: CellFieldDef[] | undefined,
  colKey: string,
): CellFieldDef {
  return (
    fieldDefs?.find((field) => field.id === colKey) ?? {
      id: colKey,
      type: "text",
      label: colKey,
    }
  );
}

export function resolveFirstEditableFieldKey<T extends Record<string, unknown>>(params: {
  row: T;
  readonly: boolean;
  columns: TableColumn[];
  editableFieldKeys: string[];
}): string | null {
  const { row, readonly, columns, editableFieldKeys } = params;
  if (readonly) return null;
  for (const col of columns) {
    if (col.hidden) continue;
    if (!editableFieldKeys.includes(col.key)) continue;
    if (row[col.key] === undefined && !(col.key in row)) continue;
    return col.key;
  }
  return null;
}

export function buildResolvedBulkActionItems<TRecord>(
  customItems: BulkActionItem[] | undefined,
  context: BulkActionContext<TRecord>,
): ResolvedBulkActionItem[] {
  const defaults: BulkActionItem[] = [
    {
      key: "clear-selection",
      label: "清空选择",
      clearSelectionAfter: true,
    },
  ];

  return [...defaults, ...(customItems ?? [])]
    .filter((action) => {
      if (typeof action.visible === "function") {
        return action.visible(context as BulkActionContext<unknown>);
      }
      return action.visible ?? true;
    })
    .map((action) => ({
      ...action,
      resolvedLabel:
        typeof action.label === "function"
          ? action.label(context as BulkActionContext<unknown>)
          : action.label,
      resolvedDisabled:
        typeof action.disabled === "function"
          ? action.disabled(context as BulkActionContext<unknown>)
          : (action.disabled ?? false),
    }));
}

export function getDensityCellPadding(density: Density): { x: number; y: number } {
  if (density === "compact") return { x: 10, y: 6 };
  if (density === "comfortable") return { x: 14, y: 10 };
  return { x: 12, y: 8 };
}

export function buildDataRowStyle(rowHeight: number): CSSProperties {
  return {
    minHeight: `${rowHeight}px`,
  };
}

export function buildBodyCellStyle(params: {
  density: Density;
  col: TableColumn;
  resolvedWidth: number;
  fillMinWidth: number;
}): CSSProperties {
  const { density, col, resolvedWidth, fillMinWidth } = params;
  const { x, y } = getDensityCellPadding(density);
  const padding = {
    padding: `${y}px ${x}px`,
  };

  if (col.width === "fill") {
    const minWidth = `${col.minWidth ?? fillMinWidth}px`;
    return { ...padding, flex: `1 1 ${minWidth}`, minWidth };
  }

  if (typeof col.width === "number") {
    return { ...padding, width: `${col.width}px`, flexShrink: "0", flexGrow: "0" };
  }

  return {
    ...padding,
    width: `${resolvedWidth}px`,
    flexShrink: "0",
    flexGrow: "0",
  };
}

export function buildGroupSpacerStyle(groupRowHeight: number): CSSProperties {
  return {
    height: `${groupRowHeight}px`,
  };
}
