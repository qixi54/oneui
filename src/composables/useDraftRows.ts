import { ref, readonly, type Ref } from "vue";
import type { CellValue, DataRecord, DraftRowState, TableSchema } from "../types";

let draftCounter = 0;

function generateDraftId(): string {
  return `__draft__${++draftCounter}__${Date.now()}`;
}

export interface UseDraftRowsOptions {
  schema: Ref<TableSchema | undefined>;
  groupFieldId?: Ref<string | undefined>;
}

export function useDraftRows(options: UseDraftRowsOptions) {
  const drafts = ref(new Map<string, DraftRowState>());

  /**
   * Add a new draft row, optionally inheriting a group field value.
   * Returns the draftId.
   */
  function addDraft(groupFieldValue?: CellValue): string {
    const draftId = generateDraftId();
    const fields: Record<string, CellValue> = {};

    // Pre-fill from schema defaults
    const schema = options.schema.value;
    if (schema) {
      for (const field of schema.fields) {
        fields[field.id] = null;
      }
    }

    // Inherit group field value
    const groupFieldId = options.groupFieldId?.value;
    if (groupFieldId && groupFieldValue !== undefined) {
      fields[groupFieldId] = groupFieldValue;
    }

    const next = new Map(drafts.value);
    next.set(draftId, {
      draftId,
      fields,
      dirtyFields: new Set(),
      validationErrors: new Map(),
      groupFieldValue,
    });
    drafts.value = next;

    return draftId;
  }

  /**
   * Update a single field in a draft row.
   */
  function updateDraftField(draftId: string, fieldId: string, value: CellValue) {
    const draft = drafts.value.get(draftId);
    if (!draft) return;

    const next = new Map(drafts.value);
    const updatedDraft: DraftRowState = {
      ...draft,
      fields: { ...draft.fields, [fieldId]: value },
      dirtyFields: new Set([...draft.dirtyFields, fieldId]),
    };

    // Clear validation error for this field if it was previously invalid
    if (draft.validationErrors.has(fieldId)) {
      const newErrors = new Map(draft.validationErrors);
      newErrors.delete(fieldId);
      updatedDraft.validationErrors = newErrors;
    }

    next.set(draftId, updatedDraft);
    drafts.value = next;
  }

  /**
   * Remove a draft row without committing.
   */
  function removeDraft(draftId: string) {
    const next = new Map(drafts.value);
    next.delete(draftId);
    drafts.value = next;
  }

  /**
   * Validate and commit a single draft row.
   * Returns the DataRecord if valid, null if validation fails.
   */
  function commitDraft(draftId: string): DataRecord | null {
    const draft = drafts.value.get(draftId);
    if (!draft) return null;

    // Validate required fields
    const errors = validate(draft);
    if (errors.size > 0) {
      const next = new Map(drafts.value);
      next.set(draftId, { ...draft, validationErrors: errors });
      drafts.value = next;
      return null;
    }

    const record: DataRecord = {
      id: draftId, // Consumer should replace with server-generated id
      fields: { ...draft.fields },
    };

    removeDraft(draftId);
    return record;
  }

  /**
   * Commit all valid drafts. Returns successfully committed records.
   * Invalid drafts remain with validation errors highlighted.
   */
  function commitAll(): DataRecord[] {
    const records: DataRecord[] = [];
    const remaining = new Map<string, DraftRowState>();

    for (const [draftId, draft] of drafts.value) {
      const errors = validate(draft);
      if (errors.size > 0) {
        remaining.set(draftId, { ...draft, validationErrors: errors });
      } else {
        records.push({
          id: draftId,
          fields: { ...draft.fields },
        });
      }
    }

    drafts.value = remaining;
    return records;
  }

  /**
   * Discard all draft rows.
   */
  function discardAll() {
    drafts.value = new Map();
  }

  /**
   * Check if a row id belongs to a draft.
   */
  function isDraft(rowId: string): boolean {
    return drafts.value.has(rowId);
  }

  /**
   * Get validation errors for a specific draft.
   */
  function getDraftErrors(draftId: string): Map<string, string> {
    return drafts.value.get(draftId)?.validationErrors ?? new Map();
  }

  // ── Validation ──────────────────────────────────────────────────────────

  function validate(draft: DraftRowState): Map<string, string> {
    const errors = new Map<string, string>();
    const schema = options.schema.value;
    if (!schema) return errors;

    for (const field of schema.fields) {
      if (field.required) {
        const value = draft.fields[field.id];
        if (value === null || value === undefined || value === "") {
          errors.set(field.id, `${field.name} 为必填项`);
        }
      }
    }

    return errors;
  }

  return {
    drafts: readonly(drafts),
    addDraft,
    updateDraftField,
    removeDraft,
    commitDraft,
    commitAll,
    discardAll,
    isDraft,
    getDraftErrors,
  };
}
