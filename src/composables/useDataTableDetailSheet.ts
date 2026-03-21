import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { DataRecord } from "../types";

export type DataTableDetailSheetBaseRow = { id: string } & Record<string, unknown>;

export type DataTableDetailSheetRow<TTableRow, TRecord = DataRecord> = TTableRow & {
  __record?: TRecord;
};

export interface DataTableCellEditPayload {
  rowId: string;
  fieldId: string;
  value: unknown;
}

export interface DataTableDetailSavePayload {
  rowId: string;
  fields: Record<string, unknown>;
}

export type DataTableRowClickResult<TTableRow, TRecord = DataRecord> =
  | {
      type: "open-detail-sheet";
      row: DataTableDetailSheetRow<TTableRow, TRecord>;
    }
  | {
      type: "emit-record";
      row: TRecord;
    }
  | {
      type: "emit-row";
      row: TTableRow;
    };

export function buildDetailSheetCellEditPayloads(
  payload: DataTableDetailSavePayload,
): DataTableCellEditPayload[] {
  return Object.entries(payload.fields).map(([fieldId, value]) => ({
    rowId: payload.rowId,
    fieldId,
    value,
  }));
}

export interface UseDataTableDetailSheetReturn<
  TTableRow extends DataTableDetailSheetBaseRow,
  TRecord = DataRecord,
> {
  detailSheetVisible: Ref<boolean>;
  detailSheetTableRow: ComputedRef<(Record<string, unknown> & { id: string }) | null>;
  openDetailSheet: (row: DataTableDetailSheetRow<TTableRow, TRecord>) => DataTableDetailSheetRow<TTableRow, TRecord>;
  closeDetailSheet: () => void;
  clearDetailSheet: () => void;
  handleRowClick: (params: {
    row: DataTableDetailSheetRow<TTableRow, TRecord>;
    isMobile: boolean;
  }) => DataTableRowClickResult<TTableRow, TRecord>;
  handleMobileRowClick: (
    row: DataTableDetailSheetRow<TTableRow, TRecord>,
  ) => {
    type: "open-detail-sheet";
    row: DataTableDetailSheetRow<TTableRow, TRecord>;
  };
  buildDetailSavePayloads: (payload: DataTableDetailSavePayload) => DataTableCellEditPayload[];
}

export function useDataTableDetailSheet<
  TTableRow extends DataTableDetailSheetBaseRow,
  TRecord = DataRecord,
>(): UseDataTableDetailSheetReturn<TTableRow, TRecord> {
  const detailSheetVisible = ref(false);
  const detailSheetRow = ref<DataTableDetailSheetRow<TTableRow, TRecord> | null>(null);

  const detailSheetTableRow = computed(() =>
    detailSheetRow.value as (Record<string, unknown> & { id: string }) | null,
  );

  function openDetailSheet(row: DataTableDetailSheetRow<TTableRow, TRecord>) {
    detailSheetRow.value = row;
    detailSheetVisible.value = true;
    return row;
  }

  function closeDetailSheet() {
    detailSheetVisible.value = false;
  }

  function clearDetailSheet() {
    detailSheetVisible.value = false;
    detailSheetRow.value = null;
  }

  function handleMobileRowClick(row: DataTableDetailSheetRow<TTableRow, TRecord>) {
    openDetailSheet(row);
    return {
      type: "open-detail-sheet" as const,
      row,
    };
  }

  function handleRowClick(params: {
    row: DataTableDetailSheetRow<TTableRow, TRecord>;
    isMobile: boolean;
  }): DataTableRowClickResult<TTableRow, TRecord> {
    const { row, isMobile } = params;

    if (isMobile) {
      return handleMobileRowClick(row);
    }

    const record = row.__record;
    if (record) {
      return {
        type: "emit-record",
        row: record,
      };
    }

    return {
      type: "emit-row",
      row,
    };
  }

  function buildDetailSavePayloads(payload: DataTableDetailSavePayload) {
    return buildDetailSheetCellEditPayloads(payload);
  }

  return {
    detailSheetVisible,
    detailSheetTableRow,
    openDetailSheet,
    closeDetailSheet,
    clearDetailSheet,
    handleRowClick,
    handleMobileRowClick,
    buildDetailSavePayloads,
  };
}
