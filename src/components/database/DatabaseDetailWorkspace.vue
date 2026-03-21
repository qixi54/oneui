<script setup lang="ts">
import DetailLayout from "../detail/DetailLayout.vue";
import FieldCell from "../table/FieldCell.vue";
import type { CellValue as FieldCellValue } from "../table/FieldCell.vue";
import type { DatabaseViewResolvedDetailPresentation } from "../../contracts/database";
import type { DatabaseDetailPropertyItem, DatabaseWorkspaceModeOption } from "./databaseViewUtils";

const props = withDefaults(
  defineProps<{
    rowId: string;
    title: string;
    description: string;
    recordId?: string;
    viewType: string;
    presentation: DatabaseViewResolvedDetailPresentation;
    canSwitchPresentation?: boolean;
    workspaceModes?: DatabaseWorkspaceModeOption[];
    propertyItems?: DatabaseDetailPropertyItem[];
    readonly?: boolean;
    hasDraftChanges?: boolean;
  }>(),
  {
    recordId: "",
    canSwitchPresentation: false,
    workspaceModes: () => [],
    propertyItems: () => [],
    readonly: false,
    hasDraftChanges: false,
  },
);

const emit = defineEmits<{
  commit: [rowId: string, fieldId: string, value: FieldCellValue];
  save: [];
  delete: [rowId: string];
  close: [];
  "update:presentation": [value: DatabaseViewResolvedDetailPresentation];
}>();

function handleFieldCommit(rowId: string, fieldId: string, value: FieldCellValue) {
  emit("commit", rowId, fieldId, value);
}

defineOptions({ name: "DatabaseDetailWorkspace" });
</script>

<template>
  <DetailLayout
    :title="props.title"
    :comments="[]"
    :description-content="props.description"
    :description-editable="false"
  >
    <template #meta>
      <div
        v-if="props.canSwitchPresentation"
        class="of-database-view__workspace-modes"
        data-role="workspace-mode-switch"
      >
        <button
          v-for="workspaceMode in props.workspaceModes"
          :key="workspaceMode.value"
          type="button"
          class="of-database-view__workspace-mode-btn"
          :class="{ 'of-database-view__workspace-mode-btn--active': props.presentation === workspaceMode.value }"
          :data-mode="workspaceMode.value"
          @click="emit('update:presentation', workspaceMode.value)"
        >
          {{ workspaceMode.label }}
        </button>
      </div>
      <span class="of-database-view__workspace-chip">{{ props.recordId || "record" }}</span>
      <span class="of-database-view__workspace-chip">{{ props.viewType }}</span>
      <span class="of-database-view__workspace-chip">{{ props.presentation }}</span>
    </template>

    <template #props>
      <div class="of-database-view__detail-workspace" :data-record-id="props.recordId">
        <section class="of-database-view__detail-workspace-properties">
          <div
            v-for="item in props.propertyItems"
            :key="item.key"
            class="of-database-view__detail-workspace-field"
          >
            <span class="of-database-view__detail-workspace-label">{{ item.label }}</span>
            <div class="of-database-view__detail-workspace-value">
              <FieldCell
                v-if="item.field"
                :row-id="props.rowId"
                :field="item.field"
                :value="item.value"
                :readonly="props.readonly"
                @commit="handleFieldCommit"
              />
              <span v-else class="of-database-view__detail-workspace-fallback">
                {{ item.fallbackText }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <button
        class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--delete"
        type="button"
        @click="emit('delete', props.rowId)"
      >
        删除
      </button>
      <div class="of-database-view__detail-workspace-footer-spacer" />
      <button
        class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--cancel"
        type="button"
        @click="emit('close')"
      >
        取消
      </button>
      <button
        class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--save"
        type="button"
        :disabled="props.readonly || !props.hasDraftChanges"
        @click="emit('save')"
      >
        保存
      </button>
    </template>
  </DetailLayout>
</template>

<style scoped>
.of-database-view__detail-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.of-database-view__workspace-modes {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200)));
  border-radius: var(--of-radius-pill, 999px);
  background: var(--of-surface-workspace-raised, var(--of-surface-elevated, var(--of-color-bg-elevated)));
}

.of-database-view__workspace-mode-btn {
  border: none;
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  border-radius: var(--of-radius-pill, 999px);
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.of-database-view__workspace-mode-btn--active {
  background: var(--of-row-action-surface, var(--of-surface-selected, var(--of-color-gray-100)));
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__workspace-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--of-surface-muted, var(--of-color-gray-100, #f3f4f6));
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-size: 12px;
}

.of-database-view__detail-workspace-properties {
  display: grid;
  gap: 12px;
}

.of-database-view__detail-workspace-field {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  border-radius: var(--of-radius-xl, 12px);
  background: var(--of-surface-elevated, var(--of-color-white, #ffffff));
}

.of-database-view__detail-workspace-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-database-view__detail-workspace-value,
.of-database-view__detail-workspace-fallback {
  min-width: 0;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-fallback {
  line-height: 1.6;
}

.of-database-view__detail-workspace-footer-spacer {
  flex: 1;
}

.of-database-view__detail-workspace-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--of-radius-lg, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.of-database-view__detail-workspace-btn--delete {
  border-color: var(--of-border-subtle, var(--of-color-danger-border, #fecaca));
  background: var(--of-surface-selected, var(--of-color-danger-bg, #fef2f2));
  color: var(--of-color-danger, #b91c1c);
}

.of-database-view__detail-workspace-btn--cancel {
  border-color: var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  background: var(--of-surface-panel, var(--of-color-gray-50, #f9fafb));
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-btn--save {
  border-color: var(--of-border-strong, rgba(15, 23, 42, 0.14));
  background: var(--of-accent-default, #334155);
  color: var(--of-text-inverse, #fff);
}

.of-database-view__detail-workspace-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
