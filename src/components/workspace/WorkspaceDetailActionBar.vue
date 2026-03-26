<script setup lang="ts">
import type { WorkspaceDetailActionItem } from "../../types";

const props = withDefaults(
  defineProps<{
    actions?: WorkspaceDetailActionItem[];
    emptyText?: string;
    align?: "start" | "end";
  }>(),
  {
    actions: () => [],
    emptyText: "暂无可用操作",
    align: "start",
  },
);

defineOptions({ name: "WorkspaceDetailActionBar" });
</script>

<template>
  <div
    class="of-workspace-detail-action-bar"
    :class="[`of-workspace-detail-action-bar--${props.align}`]"
  >
    <slot name="before" />

    <template v-if="props.actions.length">
      <button
        v-for="action in props.actions"
        :key="action.id"
        type="button"
        class="of-workspace-detail-action-bar__action"
        :class="`of-workspace-detail-action-bar__action--${action.tone ?? 'default'}`"
        :disabled="action.disabled || action.loading"
        :aria-label="action.label"
        @click="action.onClick?.()"
      >
        <span v-if="action.icon" class="of-workspace-detail-action-bar__icon">{{ action.icon }}</span>
        <span class="of-workspace-detail-action-bar__label">{{ action.label }}</span>
      </button>
    </template>

    <p v-else class="of-workspace-detail-action-bar__empty">{{ props.emptyText }}</p>

    <slot name="after" />
  </div>
</template>

<style scoped>
.of-workspace-detail-action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--of-spacing-0_75);
  width: 100%;
}

.of-workspace-detail-action-bar--end {
  justify-content: flex-end;
}

.of-workspace-detail-action-bar__action {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1);
  min-height: 22px;
  padding: 0 var(--of-spacing-2);
  border-radius: var(--of-radius-md);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-panel, var(--of-color-white, #fff));
  color: var(--of-text-secondary, var(--of-color-text-secondary, #4b5563));
  font-size: var(--of-font-size-xs);
  font-weight: 400;
  cursor: pointer;
}

.of-workspace-detail-action-bar__action--ghost {
  background: var(--of-surface-elevated);
}

.of-workspace-detail-action-bar__action--primary {
  border-color: var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-muted, var(--of-color-gray-50));
  color: var(--of-text-primary, var(--of-color-gray-900));
}

.of-workspace-detail-action-bar__action--danger {
  border-color: var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-elevated);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
}

.of-workspace-detail-action-bar__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.of-workspace-detail-action-bar__empty {
  margin: 0;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-size: var(--of-font-size-base);
}

.of-workspace-detail-action-bar__icon {
  font-size: var(--of-font-size-xs);
  line-height: 1;
}
</style>
