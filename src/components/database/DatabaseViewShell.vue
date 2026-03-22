<script setup lang="ts">
import type { Component } from "vue";
import { Loader2 } from "lucide-vue-next";
import EmptyState from "../base/EmptyState.vue";
import type { EmptyStateAction } from "../base/EmptyState.vue";

const props = withDefaults(
  defineProps<{
    state: "loading" | "error" | "empty" | "normal";
    loadingTitle: string;
    loadingDescription: string;
    errorTitle: string;
    errorDescription: string;
    errorIcon: Component;
    emptyIcon: Component;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction?: EmptyStateAction;
  }>(),
  {
    emptyAction: undefined,
  },
);

defineOptions({ name: "DatabaseViewShell", inheritAttrs: false });
</script>

<template>
  <section class="of-database-view" data-role="database-view" v-bind="$attrs">
    <div
      v-if="props.state === 'loading'"
      class="of-database-view__state of-database-view__state--loading"
      data-role="loading-state"
    >
      <Loader2 class="of-database-view__spinner" :size="20" aria-hidden="true" />
      <div class="of-database-view__state-text">
        <div class="of-database-view__state-title">{{ props.loadingTitle }}</div>
        <div class="of-database-view__state-description">{{ props.loadingDescription }}</div>
      </div>
    </div>

    <div v-else-if="props.state === 'error'" class="of-database-view__state" data-role="error-state">
      <EmptyState
        :icon="props.errorIcon"
        :title="props.errorTitle"
        :description="props.errorDescription"
      />
    </div>

    <template v-else>
      <slot name="toolbar" />

      <div
        v-if="props.state === 'empty'"
        class="of-database-view__state of-database-view__state--empty"
        data-role="empty-state"
      >
        <EmptyState
          :icon="props.emptyIcon"
          :title="props.emptyTitle"
          :description="props.emptyDescription"
          :action="props.emptyAction"
        />
      </div>

      <slot v-else name="content" />
    </template>

    <slot name="detail" />
  </section>
</template>

<style scoped>
.of-database-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 100%;
  background: var(--of-surface-workspace, var(--of-surface-elevated, var(--of-color-white)));
}

.of-database-view__state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200)));
  border-radius: var(--of-radius-xl);
  background: var(
    --of-surface-workspace-raised,
    var(--of-surface-elevated, var(--of-color-white))
  );
}

.of-database-view__state--loading {
  gap: 14px;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
}

.of-database-view__state-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.of-database-view__state-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--of-text-primary, var(--of-color-text));
}

.of-database-view__state-description {
  font-size: 13px;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
}

.of-database-view__spinner {
  color: var(--of-row-action-text, var(--of-accent-default, #334155));
  flex-shrink: 0;
  animation: of-database-view-spin 0.9s linear infinite;
}

@keyframes of-database-view-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
