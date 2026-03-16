import { ref, readonly } from "vue";

export interface EditingCell {
  rowId: string;
  fieldId: string;
}

const editingCell = ref<EditingCell | null>(null);

export function useInlineEdit() {
  function activate(rowId: string, fieldId: string) {
    editingCell.value = { rowId, fieldId };
  }

  function commit(rowId: string, fieldId: string, value: unknown) {
    if (editingCell.value?.rowId === rowId && editingCell.value?.fieldId === fieldId) {
      editingCell.value = null;
    }
    return value;
  }

  function cancel() {
    editingCell.value = null;
  }

  function isEditing(rowId: string, fieldId: string): boolean {
    return editingCell.value?.rowId === rowId && editingCell.value?.fieldId === fieldId;
  }

  return {
    editingCell: readonly(editingCell),
    activate,
    commit,
    cancel,
    isEditing,
  };
}
