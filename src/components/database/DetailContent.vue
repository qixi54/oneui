<script setup lang="ts">
import { computed } from "vue";
import { ChevronRight, History, Info, Layout, Maximize2, PanelRight, X } from "lucide-vue-next";
import { normalizeDetailPresentation } from "./databaseViewUtils";
import type {
  DatabaseDetailWorkspaceModeOption,
  DatabaseDetailWorkspacePropertyItem,
  DatabaseDetailWorkspaceSlotContext,
  DatabaseDetailWorkspaceSlots,
  DatabaseViewDetailPresentation,
  DatabaseViewResolvedDetailPresentation,
} from "../../contracts/database";

interface Props {
  title: string;
  rowId: string;
  recordId: string;
  viewType?: string;
  description?: string;
  presentation: Exclude<DatabaseViewDetailPresentation, "auto">;
  source?: string;
  canSwitchPresentation: boolean;
  workspaceModes: DatabaseDetailWorkspaceModeOption[];
  propertyItems: DatabaseDetailWorkspacePropertyItem[];
  readonly?: boolean;
  hasDraftChanges?: boolean;
  recordTypeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  viewType: "detail",
  description: "",
  source: undefined,
  readonly: false,
  hasDraftChanges: false,
  recordTypeLabel: "记录",
});

const emit = defineEmits<{
  close: [];
  save: [];
  delete: [string];
  "update:presentation": [Exclude<DatabaseViewDetailPresentation, "auto">];
  commit: [rowId: string, fieldId: string, value: unknown];
}>();

defineSlots<DatabaseDetailWorkspaceSlots>();

const normalizedPresentation = computed<DatabaseViewResolvedDetailPresentation>(() =>
  normalizeDetailPresentation(props.presentation),
);
const isCompact = computed(() => normalizedPresentation.value === "side-panel");
const isFullscreen = computed(() => normalizedPresentation.value === "fullscreen");

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

const presentationIcons: Record<string, typeof Info> = {
  "side-panel": PanelRight,
  sheet: Layout,
  drawer: Layout,
  "full-page": Maximize2,
  fullscreen: Maximize2,
};

function getDisplayValue(value: unknown, fallbackText: string) {
  if (value === null || value === undefined) return fallbackText;
  const normalized = String(value).trim();
  return normalized || fallbackText;
}

function getPropertyTone(item: DatabaseDetailWorkspacePropertyItem) {
  const key = item.key.toLowerCase();
  const value = getDisplayValue(item.value, item.fallbackText).toLowerCase();

  if (key.includes("status")) {
    if (/(done|完成|closed|已完成|resolved)/.test(value)) return "success";
    if (/(doing|进行|blocked|阻塞|review|评审)/.test(value)) return "warning";
    return "accent";
  }

  if (key.includes("priority") || key.includes("level")) {
    return /(p0|p1|high|critical|紧急)/.test(value) ? "danger" : "warning";
  }

  return "plain";
}

function handlePresentationChange(mode: Exclude<DatabaseViewDetailPresentation, "auto">) {
  emit("update:presentation", mode);
}
</script>

<template>
  <div class="of-detail-content" :class="{ 'is-compact': isCompact, 'is-fullscreen': isFullscreen }">
    <div v-if="$slots.header" class="of-detail-content__slot of-detail-content__slot--header">
      <slot name="header" v-bind="slotContext" />
    </div>

    <header class="of-detail-header">
      <div class="of-detail-header__top">
        <nav class="of-detail-breadcrumb">
          <span class="of-detail-breadcrumb__item">
            <span class="of-detail-breadcrumb__dot" />
            {{ recordTypeLabel }}
          </span>
          <ChevronRight class="of-detail-breadcrumb__separator" :size="12" />
          <span class="of-detail-breadcrumb__id">#{{ recordId || rowId.slice(0, 8) }}</span>
        </nav>

        <div class="of-detail-header__actions">
          <div v-if="$slots.actions" class="of-detail-header__slot-actions">
            <slot name="actions" v-bind="slotContext" />
          </div>
          <div
            v-if="canSwitchPresentation"
            class="of-detail-modes"
            data-role="workspace-mode-switch"
          >
            <button
              v-for="mode in workspaceModes"
              :key="mode.value"
              type="button"
              class="of-detail-mode-btn"
              :class="{ 'is-active': presentation === mode.value }"
              :data-mode="mode.value"
              :title="mode.label"
              @click="handlePresentationChange(mode.value)"
            >
              <component :is="presentationIcons[mode.value] || Info" :size="14" />
            </button>
          </div>
          <div v-if="$slots.actions || canSwitchPresentation" class="of-detail-header__divider" />
          <button type="button" class="of-detail-close-btn" title="关闭" @click="emit('close')">
            <X :size="18" />
          </button>
        </div>
      </div>

      <div class="of-detail-header__main">
        <h1 class="of-detail-title">{{ title }}</h1>
        <div v-if="description" class="of-detail-description">{{ description }}</div>
      </div>
    </header>

    <section v-if="propertyItems.length > 0" class="of-detail-metadata">
      <div class="of-detail-metadata__grid">
        <div
          v-for="item in propertyItems"
          :key="item.key"
          class="of-detail-metadata__item"
        >
          <span class="of-detail-metadata__label">{{ item.label }}</span>
          <div class="of-detail-metadata__value">
            <span
              v-if="getPropertyTone(item) !== 'plain'"
              class="of-detail-metadata__badge"
              :class="`of-detail-metadata__badge--${getPropertyTone(item)}`"
            >
              {{ getDisplayValue(item.value, item.fallbackText) }}
            </span>
            <span v-else>
              {{ getDisplayValue(item.value, item.fallbackText) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <main class="of-detail-body">
      <div class="of-detail-body__sections">
        <div class="of-detail-section of-detail-section--preview">
          <div class="of-detail-section__header">
            <span class="of-detail-section__title">
              <Layout :size="14" class="of-detail-section__icon" />
              详细内容
            </span>
          </div>
          <div class="of-detail-section__content">
            <slot name="preview" v-bind="slotContext">
              <div class="of-detail-empty-content">暂无详细内容描述</div>
            </slot>
          </div>
        </div>

        <div class="of-detail-section of-detail-section--activity">
          <div class="of-detail-section__header">
            <span class="of-detail-section__title">
              <History :size="14" class="of-detail-section__icon" />
              活动历史
            </span>
          </div>
          <div class="of-detail-section__content">
            <slot name="activity" v-bind="slotContext">
              <div class="of-detail-empty-content">暂无活动记录</div>
            </slot>
          </div>
        </div>
      </div>
    </main>

    <footer v-if="$slots.footer || !readonly" class="of-detail-footer">
      <slot v-if="$slots.footer" name="footer" v-bind="slotContext" />
      <template v-else>
        <div class="of-detail-footer__left">
          <button type="button" class="of-detail-btn is-danger" @click="emit('delete', rowId)">删除</button>
        </div>
        <div class="of-detail-footer__right">
          <button type="button" class="of-detail-btn" @click="emit('close')">取消</button>
          <button
            type="button"
            class="of-detail-btn is-primary"
            :disabled="!hasDraftChanges"
            @click="emit('save')"
          >
            保存变更
          </button>
        </div>
      </template>
    </footer>
  </div>
</template>

<style scoped>
.of-detail-content {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  background: var(--of-surface-elevated);
  color: var(--of-color-text, #1a1a1a);
  overflow: hidden;
  font-family: var(--of-font-family, system-ui, -apple-system, sans-serif);
}

.of-detail-content__slot--header {
  padding: var(--of-spacing-2_5) var(--of-spacing-5) 0;
}

.of-detail-header {
  padding: var(--of-spacing-3_5) var(--of-spacing-5) var(--of-spacing-2_5);
  border-bottom: 1px solid var(--of-border-subtle);
  background: var(--of-surface-elevated);
}

.of-detail-header__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--of-spacing-2_5);
  margin-bottom: var(--of-spacing-1_5);
}

.of-detail-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  min-width: 0;
  font-size: var(--of-font-size-xs);
  color: var(--of-text-secondary, var(--of-color-gray-500));
  line-height: 1.4;
}

.of-detail-breadcrumb__item {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
}

.of-detail-breadcrumb__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--of-radius-sm);
  background: var(--of-text-tertiary, var(--of-color-gray-400));
}

.of-detail-breadcrumb__separator {
  opacity: 0.5;
}

.of-detail-breadcrumb__id {
  font-family: var(--of-font-family-mono, monospace);
  opacity: 0.8;
}

.of-detail-header__actions {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1);
  flex-shrink: 0;
}

.of-detail-modes {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-0_5);
  padding: var(--of-spacing-0_5);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-md);
  background: var(--of-surface-elevated);
}

.of-detail-mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: var(--of-radius-md);
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-gray-500));
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.of-detail-mode-btn.is-active {
  background: var(--of-surface-selected, var(--of-color-gray-100));
  color: var(--of-text-primary, var(--of-color-gray-900));
}

.of-detail-mode-btn:hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

.of-detail-header__slot-actions {
  display: flex;
  align-items: center;
  margin-right: var(--of-spacing-0_5);
}

.of-detail-header__divider {
  width: 1px;
  height: 14px;
  background: var(--of-border-subtle, var(--of-color-gray-200));
}

.of-detail-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: var(--of-radius-md);
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-gray-500));
  cursor: pointer;
  border: 0;
}

.of-detail-close-btn:hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

.of-detail-header__main {
  display: grid;
  gap: var(--of-spacing-0_5);
}

.of-detail-title {
  margin: 0;
  font-size: var(--of-font-size-xl);
  line-height: var(--of-line-height-tight);
  font-weight: var(--of-font-weight-semibold);
  letter-spacing: -0.02em;
}

.of-detail-description {
  color: var(--of-color-text-secondary, #6b7280);
  font-size: var(--of-font-size-xs);
  line-height: 1.55;
}

.of-detail-metadata {
  padding: var(--of-spacing-1_5) var(--of-spacing-5) var(--of-spacing-2);
  border-bottom: 0;
}

.of-detail-metadata__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--of-spacing-1_5) var(--of-spacing-3_5);
  padding: var(--of-spacing-2) 0 var(--of-spacing-1_25);
  border-top: 1px solid var(--of-border-subtle);
  border-bottom: 1px solid var(--of-border-subtle);
}

.of-detail-metadata__item {
  display: grid;
  gap: var(--of-spacing-0_5);
  min-width: 0;
}

.of-detail-metadata__label {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  letter-spacing: 0.02em;
}

.of-detail-metadata__value {
  min-width: 0;
  color: var(--of-text-primary, var(--of-color-gray-900));
  font-size: var(--of-font-size-xs);
  line-height: 1.4;
}

.of-detail-metadata__badge {
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 var(--of-spacing-1_25);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-md);
  width: fit-content;
  font-size: var(--of-font-size-xs);
  font-weight: 400;
  background: var(--of-surface-elevated);
}

.of-detail-metadata__badge--accent {
  border-color: var(--of-color-blue-50);
  color: var(--of-color-blue-600);
}

.of-detail-metadata__badge--warning {
  border-color: var(--of-color-warning-200, var(--of-color-yellow-200));
  color: var(--of-color-warning-700, var(--of-color-yellow-700));
}

.of-detail-metadata__badge--success {
  border-color: var(--of-color-success-200, var(--of-color-green-200));
  color: var(--of-color-success-dark, var(--of-color-green-600));
}

.of-detail-metadata__badge--danger {
  border-color: var(--of-color-red-200);
  color: var(--of-color-red-700, var(--of-color-error));
}

.of-detail-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--of-spacing-3_5) var(--of-spacing-5) var(--of-spacing-4);
}

.of-detail-body__sections {
  display: grid;
  gap: var(--of-spacing-4);
}

.of-detail-section {
  display: grid;
  gap: var(--of-spacing-2);
}

.of-detail-section__header {
  display: flex;
  align-items: center;
  padding-bottom: var(--of-spacing-1_25);
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-gray-100));
}

.of-detail-section__title {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary, var(--of-color-gray-500));
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.of-detail-section__content {
  padding: 0;
}

.of-detail-section--preview .of-detail-section__content {
  min-height: 0;
}

.of-detail-section--activity .of-detail-section__content {
  padding-top: 0;
}

.of-detail-empty-content {
  color: var(--of-text-secondary, var(--of-color-gray-500));
  font-size: var(--of-font-size-sm);
  line-height: 1.65;
}

.of-detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--of-spacing-2);
  padding: var(--of-spacing-1) var(--of-spacing-5) var(--of-spacing-1_5);
  border-top: 1px solid var(--of-border-subtle, var(--of-color-gray-100));
  background: var(--of-surface-elevated);
}

.of-detail-footer__left,
.of-detail-footer__right {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
}

.of-detail-btn {
  height: 24px;
  padding: 0 var(--of-spacing-2);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-md);
  background: var(--of-surface-elevated, var(--of-color-white));
  color: var(--of-text-secondary, var(--of-color-gray-600));
  cursor: pointer;
  font-size: var(--of-font-size-xs);
  font-weight: 400;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.of-detail-btn.is-primary {
  border-color: var(--of-color-gray-200);
  background: var(--of-surface-muted, var(--of-color-gray-50));
  color: var(--of-text-primary, var(--of-color-gray-900));
}

.of-detail-btn.is-danger {
  border-color: var(--of-color-gray-200);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  background: var(--of-surface-elevated);
}

.of-detail-btn:hover:not(:disabled) {
  border-color: var(--of-border-strong, var(--of-color-gray-300));
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

.of-detail-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.is-compact .of-detail-header,
.is-compact .of-detail-metadata,
.is-compact .of-detail-body,
.is-compact .of-detail-footer {
  padding-left: var(--of-spacing-4);
  padding-right: var(--of-spacing-4);
}

.is-compact .of-detail-title {
  font-size: var(--of-font-size-xl);
}

.is-fullscreen .of-detail-header,
.is-fullscreen .of-detail-metadata,
.is-fullscreen .of-detail-body,
.is-fullscreen .of-detail-footer {
  padding-left: var(--of-spacing-8);
  padding-right: var(--of-spacing-8);
}

.is-fullscreen .of-detail-title {
  font-size: var(--of-font-size-2xl);
}

.is-fullscreen .of-detail-metadata__grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .of-detail-header__top,
  .of-detail-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .of-detail-header__actions,
  .of-detail-footer__left,
  .of-detail-footer__right {
    width: 100%;
  }

  .of-detail-footer__right {
    justify-content: space-between;
  }

  .of-detail-title {
    font-size: var(--of-font-size-2xl);
  }

  .of-detail-metadata__grid,
  .is-fullscreen .of-detail-metadata__grid {
    grid-template-columns: 1fr;
  }
}
</style>
