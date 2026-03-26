import { computed, readonly, ref } from "vue";
import type {
  TableCellEditState,
  TableColumnValidationError,
  TableColumnValidator,
  TableColumnParser,
  TableEditingCell,
} from "../types/data-table";

interface CommitOptions<TRecord = Record<string, unknown>> {
  rowId: string;
  fieldId: string;
  value: unknown;
  originalValue: unknown;
  row?: TRecord;
  parser?: TableColumnParser<TRecord>;
  validator?: TableColumnValidator<TRecord>;
}

interface CommitSuccess {
  ok: true;
  value: unknown;
}

interface CommitFailure {
  ok: false;
  error: TableColumnValidationError;
}

type CommitResult = CommitSuccess | CommitFailure;

function buildStateKey(rowId: string, fieldId: string): string {
  return `${rowId}::${fieldId}`;
}

function normalizeError(error: TableColumnValidationError | string): TableColumnValidationError {
  if (typeof error === "string") {
    return {
      code: "validation_error",
      message: error,
    };
  }
  return error;
}

export function useTableEditing<TRecord = Record<string, unknown>>() {
  const editingCell = ref<TableEditingCell | null>(null);
  const stateMap = ref(new Map<string, TableCellEditState>());

  function getCellState(rowId: string, fieldId: string): TableCellEditState | null {
    return stateMap.value.get(buildStateKey(rowId, fieldId)) ?? null;
  }

  function setCellState(state: TableCellEditState) {
    const next = new Map(stateMap.value);
    next.set(buildStateKey(state.rowId, state.fieldId), state);
    stateMap.value = next;
  }

  function clearCellState(rowId: string, fieldId: string) {
    const key = buildStateKey(rowId, fieldId);
    if (!stateMap.value.has(key)) return;
    const next = new Map(stateMap.value);
    next.delete(key);
    stateMap.value = next;
  }

  function activate(rowId: string, fieldId: string, currentValue: unknown) {
    editingCell.value = { rowId, fieldId };
    setCellState({
      rowId,
      fieldId,
      phase: "editing",
      originalValue: currentValue,
      draftValue: currentValue,
      error: null,
    });
  }

  function cancel(rowId?: string, fieldId?: string) {
    const target = rowId && fieldId ? { rowId, fieldId } : editingCell.value;
    if (!target) return;
    clearCellState(target.rowId, target.fieldId);
    if (
      editingCell.value?.rowId === target.rowId &&
      editingCell.value?.fieldId === target.fieldId
    ) {
      editingCell.value = null;
    }
  }

  function isEditing(rowId: string, fieldId: string): boolean {
    return editingCell.value?.rowId === rowId && editingCell.value?.fieldId === fieldId;
  }

  async function commit(options: CommitOptions<TRecord>): Promise<CommitResult> {
    const {
      rowId,
      fieldId,
      value,
      originalValue,
      row,
      parser,
      validator,
    } = options;
    const current = getCellState(rowId, fieldId);
    if (!current) {
      activate(rowId, fieldId, originalValue);
    }

    const dirty = value !== originalValue;
    setCellState({
      rowId,
      fieldId,
      phase: dirty ? "dirty" : "editing",
      originalValue,
      draftValue: value,
      error: null,
    });

    setCellState({
      rowId,
      fieldId,
      phase: "validating",
      originalValue,
      draftValue: value,
      error: null,
    });

    const context = { rowId, fieldId, row, originalValue };
    const parsedValue = parser ? parser(value, context) : value;
    const validationError = validator ? validator(parsedValue, context) : null;

    if (validationError) {
      const normalizedError = normalizeError(validationError);
      setCellState({
        rowId,
        fieldId,
        phase: "error",
        originalValue,
        draftValue: parsedValue,
        error: normalizedError,
      });
      editingCell.value = { rowId, fieldId };
      return {
        ok: false,
        error: normalizedError,
      };
    }

    clearCellState(rowId, fieldId);
    if (isEditing(rowId, fieldId)) {
      editingCell.value = null;
    }
    return {
      ok: true,
      value: parsedValue,
    };
  }

  const activeState = computed(() => {
    if (!editingCell.value) return null;
    return getCellState(editingCell.value.rowId, editingCell.value.fieldId);
  });

  return {
    editingCell: readonly(editingCell),
    stateMap: readonly(stateMap),
    activeState,
    activate,
    cancel,
    commit,
    isEditing,
    getCellState,
  };
}
