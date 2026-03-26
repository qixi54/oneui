<script setup lang="ts">
import { computed } from "vue";
import DetailLayout from "../detail/DetailLayout.vue";
import { ContentBlock } from "../editor";
import FieldCell from "../table/FieldCell.vue";
import type { CellValue as FieldCellValue, FieldDef } from "../table/FieldCell.vue";
import type {
  DatabaseDetailWorkspaceModeOption,
  DatabaseDetailWorkspacePropertyItem,
  DatabaseDetailWorkspaceSlotContext,
  DatabaseDetailWorkspaceSlots,
  DatabaseViewDetailPresentation,
} from "../../contracts/database";

const props = withDefaults(
  defineProps<{
    rowId: string;
    title: string;
    description: string;
    recordId?: string;
    source?: string;
    viewType: string;
    presentation: Exclude<DatabaseViewDetailPresentation, "auto">;
    canSwitchPresentation?: boolean;
    workspaceModes?: DatabaseDetailWorkspaceModeOption[];
    propertyItems?: DatabaseDetailWorkspacePropertyItem[];
    readonly?: boolean;
    hasDraftChanges?: boolean;
  }>(),
  {
    recordId: "",
    source: undefined,
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
  "update:presentation": [value: Exclude<DatabaseViewDetailPresentation, "auto">];
}>();

defineSlots<DatabaseDetailWorkspaceSlots>();

const slotContext = computed<DatabaseDetailWorkspaceSlotContext>(() => ({
  rowId: props.rowId,
  recordId: props.recordId,
  source: props.source,
  title: props.title,
  description: props.description,
  viewType: props.viewType,
  presentation: props.presentation,
  canSwitchPresentation: props.canSwitchPresentation,
  workspaceModes: props.workspaceModes,
  propertyItems: props.propertyItems,
  readonly: props.readonly,
  hasDraftChanges: props.hasDraftChanges,
}));

function handleFieldCommit(rowId: string, fieldId: string, value: FieldCellValue) {
  emit("commit", rowId, fieldId, value);
}

defineOptions({ name: "DatabaseDetailWorkspace" });
</script>

<template>
  <div v-if="$slots.header" class="of-database-view__detail-workspace-header">
    <slot name="header" v-bind="slotContext" />
  </div>

  <div v-if="$slots.actions" class="of-database-view__detail-workspace-actions">
    <slot name="actions" v-bind="slotContext" />
  </div>

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

    <template #description>
      <slot name="preview" v-bind="slotContext">
        <div class="of-database-view__detail-workspace-preview">
          <ContentBlock :content="props.description" :editable="false" />
          <p v-if="!props.description" class="of-database-view__detail-workspace-empty">
            暂无预览内容
          </p>
        </div>
      </slot>
    </template>

    <template #comments>
      <slot name="activity" v-bind="slotContext">
        <p class="of-database-view__detail-workspace-empty">暂无活动记录</p>
      </slot>
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
                :field="item.field as FieldDef"
                :value="item.value as FieldCellValue"
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
.of-database-view__detail-workspace-header,
.of-database-view__detail-workspace-actions {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3);
  margin-bottom: var(--of-spacing-3);
}

.of-database-view__detail-workspace-actions {
  margin-bottom: var(--of-spacing-4);
  flex-wrap: wrap;
}

.of-database-view__detail-workspace-preview {
  display: grid;
  gap: var(--of-spacing-2_5);
}

.of-database-view__detail-workspace-empty {
  margin: 0;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-size: var(--of-font-size-base);
}

.of-database-view__detail-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
  min-height: 0;
}

.of-database-view__workspace-modes {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  padding: var(--of-spacing-1);
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200)));
  border-radius: var(--of-radius-pill, 999px);
  background: var(
    --of-surface-workspace-raised,
    var(--of-surface-elevated, var(--of-color-bg-elevated))
  );
}

.of-database-view__workspace-mode-btn {
  border: none;
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  border-radius: var(--of-radius-pill, 999px);
  padding: var(--of-spacing-1_5) var(--of-spacing-2_5);
  font-size: var(--of-font-size-sm);
  line-height: 1;
  cursor: pointer;
}

.of-database-view__workspace-mode-btn--active {
  background: var(
    --of-surface-workspace-strong,
    var(--of-row-action-surface, var(--of-surface-selected, var(--of-color-gray-100)))
  );
  color: var(--of-text-primary, var(--of-color-text));
}

.of-database-view__workspace-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--of-spacing-0_5) var(--of-spacing-2);
  border-radius: var(--of-radius-full);
  background: var(
    --of-surface-workspace-strong,
    var(--of-surface-muted, var(--of-color-gray-100))
  );
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-size: var(--of-font-size-sm);
}

.of-database-view__detail-workspace-properties {
  display: grid;
  gap: var(--of-spacing-3);
}

.of-database-view__detail-workspace-field {
  display: grid;
  gap: var(--of-spacing-1_5);
  padding: var(--of-spacing-3_5);
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200)));
  border-radius: var(--of-radius-xl, 12px);
  background: var(
    --of-surface-workspace-raised,
    var(--of-surface-elevated, var(--of-color-white))
  );
}

.of-database-view__detail-workspace-label {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-database-view__detail-workspace-value,
.of-database-view__detail-workspace-fallback {
  min-width: 0;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-fallback {
  line-height: var(--of-line-height-relaxed);
}

.of-database-view__detail-workspace-footer-spacer {
  flex: 1;
}

.of-database-view__detail-workspace-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 var(--of-spacing-3_5);
  border: 1px solid transparent;
  border-radius: var(--of-radius-lg, 8px);
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  cursor: pointer;
}

.of-database-view__detail-workspace-btn--delete {
  border-color: var(--of-color-error, var(--of-color-danger-border, var(--of-color-red-200)));
  background: var(
    --of-surface-workspace-strong,
    var(--of-surface-selected, var(--of-color-danger-bg, var(--of-color-red-50)))
  );
  color: var(--of-color-error, var(--of-color-danger, var(--of-color-red-700)));
}

.of-database-view__detail-workspace-btn--cancel {
  border-color: var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200)));
  background: var(
    --of-surface-workspace,
    var(--of-surface-panel, var(--of-color-gray-50))
  );
  color: var(--of-text-primary, var(--of-color-text));
}

.of-database-view__detail-workspace-btn--save {
  border-color: var(--of-row-action-border, var(--of-workspace-border, var(--of-border-strong)));
  background: var(--of-row-action-text, var(--of-accent-default, var(--of-text-strong)));
  color: var(--of-text-inverse, var(--of-color-white));
}

.of-database-view__detail-workspace-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.of-database-view__workspace-mode-btn:focus-visible,
.of-database-view__detail-workspace-btn:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}
</style>
