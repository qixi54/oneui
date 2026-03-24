<script setup lang="ts">
import { computed } from "vue";
import type {
  WorkspaceFilterItem,
  WorkspaceMetaItem,
  WorkspaceToolbarAction,
} from "../../types";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    recordMeta?: WorkspaceMetaItem[];
    filterItems?: WorkspaceFilterItem[];
    toolbarActions?: WorkspaceToolbarAction[];
    showMeta?: boolean;
    showFilters?: boolean;
  }>(),
  {
    title: "",
    subtitle: "",
    eyebrow: "",
    recordMeta: () => [],
    filterItems: () => [],
    toolbarActions: () => [],
    showMeta: true,
    showFilters: true,
  },
);

const metaItems = computed(() => props.recordMeta ?? []);
const filterItems = computed(() => props.filterItems ?? []);
const toolbarActions = computed(() => props.toolbarActions ?? []);
</script>

<template>
  <section class="of-workspace-shell">
    <header class="of-workspace-shell__header">
      <div class="of-workspace-shell__title-group">
        <span v-if="props.eyebrow" class="of-workspace-shell__eyebrow">{{ props.eyebrow }}</span>
        <h2 class="of-workspace-shell__title">{{ props.title || "工作区" }}</h2>
        <p v-if="props.subtitle" class="of-workspace-shell__subtitle">{{ props.subtitle }}</p>
      </div>

      <div class="of-workspace-shell__toolbar">
        <slot name="toolbar">
          <button
            v-for="action in toolbarActions"
            :key="action.id"
            type="button"
            class="of-workspace-shell__action"
            :class="`of-workspace-shell__action--${action.tone ?? 'default'}`"
            :disabled="action.disabled || action.loading"
            @click="action.onClick?.()"
          >
            <span v-if="action.icon" class="of-workspace-shell__action-icon">{{ action.icon }}</span>
            <span>{{ action.label }}</span>
          </button>
        </slot>
      </div>
    </header>

    <div v-if="props.showMeta && (metaItems.length || $slots.meta)" class="of-workspace-shell__meta">
      <slot name="meta">
        <span
          v-for="item in metaItems"
          :key="item.key"
          class="of-workspace-shell__chip"
          :class="`of-workspace-shell__chip--${item.tone ?? 'neutral'}`"
        >
          <span class="of-workspace-shell__chip-label">{{ item.label }}</span>
          <span class="of-workspace-shell__chip-value">{{ item.value }}</span>
        </span>
      </slot>
    </div>

    <div
      v-if="props.showFilters && (filterItems.length || $slots.filters)"
      class="of-workspace-shell__filters"
    >
      <slot name="filters">
        <button
          v-for="item in filterItems"
          :key="item.id"
          type="button"
          class="of-workspace-shell__filter"
          :class="[
            `of-workspace-shell__filter--${item.tone ?? 'neutral'}`,
            { 'of-workspace-shell__filter--active': item.active },
          ]"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.value" class="of-workspace-shell__filter-value">{{ item.value }}</span>
        </button>
      </slot>
    </div>

    <div class="of-workspace-shell__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="of-workspace-shell__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.of-workspace-shell {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
  width: 100%;
}

.of-workspace-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--of-spacing-4);
}

.of-workspace-shell__title-group {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1_5);
  min-width: 0;
}

.of-workspace-shell__eyebrow {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-shell__title {
  margin: 0;
  font-size: var(--of-font-size-xl);
  line-height: var(--of-line-height-tight);
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-workspace-shell__subtitle {
  margin: 0;
  font-size: var(--of-font-size-base);
  line-height: var(--of-line-height-relaxed);
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-shell__toolbar,
.of-workspace-shell__meta,
.of-workspace-shell__filters,
.of-workspace-shell__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-2);
}

.of-workspace-shell__toolbar {
  justify-content: flex-end;
}

.of-workspace-shell__action,
.of-workspace-shell__filter {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  min-height: 32px;
  padding: 0 var(--of-spacing-3);
  border-radius: var(--of-radius-full);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  background: var(--of-surface-panel, var(--of-color-white, #fff));
  color: var(--of-text-primary, var(--of-color-text, #111827));
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-semibold);
  cursor: pointer;
}

.of-workspace-shell__action--ghost,
.of-workspace-shell__filter {
  background: var(--of-surface-muted, var(--of-color-gray-50, #f9fafb));
}

.of-workspace-shell__action--primary {
  border-color: transparent;
  background: var(--of-accent-default, #334155);
  color: #fff;
}

.of-workspace-shell__action--danger {
  border-color: var(--of-color-danger-border, #fecaca);
  background: var(--of-color-danger-bg, #fef2f2);
  color: var(--of-color-danger, #b91c1c);
}

.of-workspace-shell__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.of-workspace-shell__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  padding: var(--of-spacing-1) var(--of-spacing-2_5);
  border-radius: var(--of-radius-full);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  background: var(--of-surface-muted, var(--of-color-gray-50, #f9fafb));
  font-size: var(--of-font-size-sm);
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-workspace-shell__chip-label,
.of-workspace-shell__filter-value {
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-shell__chip--accent {
  border-color: var(--of-accent-border, rgba(51, 65, 85, 0.18));
  background: var(--of-accent-soft, rgba(51, 65, 85, 0.08));
}

.of-workspace-shell__chip--success {
  border-color: var(--of-color-success-border, #bbf7d0);
  background: var(--of-color-success-bg, #f0fdf4);
}

.of-workspace-shell__chip--warning {
  border-color: var(--of-color-warning-border, #fde68a);
  background: var(--of-color-warning-bg, #fffbeb);
}

.of-workspace-shell__chip--danger {
  border-color: var(--of-color-danger-border, #fecaca);
  background: var(--of-color-danger-bg, #fef2f2);
}

.of-workspace-shell__filter--active {
  border-color: var(--of-accent-border, rgba(51, 65, 85, 0.18));
  background: var(--of-accent-soft, rgba(51, 65, 85, 0.08));
}

.of-workspace-shell__body {
  min-width: 0;
}
</style>
