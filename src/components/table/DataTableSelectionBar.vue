<script setup lang="ts">
import type { ResolvedBulkActionItem } from "../../types/data-table";

defineProps<{
  selectionCount: number;
  items: ResolvedBulkActionItem[];
}>();

const emit = defineEmits<{
  action: [action: ResolvedBulkActionItem];
}>();
</script>

<template>
  <div class="of-data-table-selection-bar" data-role="selection-bar">
    <div class="of-data-table-selection-bar__summary">
      <span class="of-data-table-selection-bar__count">{{ selectionCount }}</span>
      <span class="of-data-table-selection-bar__text">条记录已选中</span>
    </div>
    <div class="of-data-table-selection-bar__actions">
      <button
        v-for="action in items"
        :key="action.key"
        type="button"
        class="of-data-table-selection-bar__btn"
        :class="{ 'of-data-table-selection-bar__btn--danger': action.variant === 'danger' }"
        :disabled="action.resolvedDisabled"
        @click="emit('action', action)"
      >
        {{ action.resolvedLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.of-data-table-selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid
    var(--of-border-workspace, var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200))));
  background: var(
    --of-surface-workspace-strong,
    var(--of-surface-selected, var(--of-color-bg-active, var(--of-color-gray-100)))
  );
}

.of-data-table-selection-bar__summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.of-data-table-selection-bar__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--of-status-active-bg, var(--of-surface-elevated, var(--of-color-bg-elevated, #fff)));
  color: var(
    --of-status-active,
    var(--of-row-action-text, var(--of-text-primary, var(--of-color-text-primary, #111827)))
  );
  font-size: 12px;
  font-weight: 700;
}

.of-data-table-selection-bar__text {
  color: var(--of-text-secondary, var(--of-color-text-secondary, var(--of-color-gray-600)));
  font-size: 13px;
  font-weight: 500;
}

.of-data-table-selection-bar__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.of-data-table-selection-bar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 6px 12px;
  border: 1px solid var(--of-row-action-border, var(--of-border-default, var(--of-border-subtle, var(--of-color-gray-200))));
  border-radius: 999px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  color: var(--of-row-action-text, var(--of-text-primary, var(--of-color-text-primary, var(--of-color-gray-800))));
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-data-table-selection-bar__btn:hover:not(:disabled),
.of-data-table-selection-bar__btn:focus-visible:not(:disabled) {
  background: var(--of-row-action-hover, var(--of-surface-selected, var(--of-color-bg-active, var(--of-color-gray-100))));
}

.of-data-table-selection-bar__btn--danger {
  color: var(--of-error-text, var(--of-color-error-600));
}

.of-data-table-selection-bar__btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 768px) {
  .of-data-table-selection-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .of-data-table-selection-bar__actions {
    justify-content: stretch;
  }

  .of-data-table-selection-bar__btn {
    width: 100%;
  }
}
</style>
