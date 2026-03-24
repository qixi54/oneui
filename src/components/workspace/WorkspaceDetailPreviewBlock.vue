<script setup lang="ts">
import { computed } from "vue";
import { ContentBlock } from "../editor";
import type { WorkspaceMetaItem, WorkspacePreviewItem } from "../../types";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    content?: string;
    editable?: boolean;
    items?: WorkspacePreviewItem[];
    meta?: WorkspaceMetaItem[];
    emptyText?: string;
  }>(),
  {
    title: "",
    subtitle: "",
    content: "",
    editable: false,
    items: () => [],
    meta: () => [],
    emptyText: "暂无预览内容",
  },
);

const hasContent = computed(() => Boolean(props.content && props.content.trim().length > 0));
const hasItems = computed(() => props.items.length > 0);

defineOptions({ name: "WorkspaceDetailPreviewBlock" });
</script>

<template>
  <section class="of-workspace-detail-preview-block">
    <header v-if="props.title || props.subtitle || props.meta.length" class="of-workspace-detail-preview-block__header">
      <div class="of-workspace-detail-preview-block__title-group">
        <h3 v-if="props.title" class="of-workspace-detail-preview-block__title">{{ props.title }}</h3>
        <p v-if="props.subtitle" class="of-workspace-detail-preview-block__subtitle">{{ props.subtitle }}</p>
      </div>

      <div v-if="props.meta.length" class="of-workspace-detail-preview-block__meta">
        <span
          v-for="item in props.meta"
          :key="item.key"
          class="of-workspace-detail-preview-block__chip"
          :class="`of-workspace-detail-preview-block__chip--${item.tone ?? 'neutral'}`"
        >
          <span class="of-workspace-detail-preview-block__chip-label">{{ item.label }}</span>
          <span class="of-workspace-detail-preview-block__chip-value">{{ item.value }}</span>
        </span>
      </div>
    </header>

    <div class="of-workspace-detail-preview-block__body">
      <slot name="content">
        <ContentBlock v-if="hasContent" :content="props.content" :editable="props.editable" />
        <p v-else class="of-workspace-detail-preview-block__empty">{{ props.emptyText }}</p>
      </slot>
    </div>

    <div v-if="hasItems" class="of-workspace-detail-preview-block__items">
      <div class="of-workspace-detail-preview-block__items-title">补充信息</div>
      <article
        v-for="item in props.items"
        :key="item.id"
        class="of-workspace-detail-preview-block__item"
        :class="`of-workspace-detail-preview-block__item--${item.tone ?? 'neutral'}`"
      >
        <div class="of-workspace-detail-preview-block__item-head">
          <span v-if="item.icon" class="of-workspace-detail-preview-block__item-icon">{{ item.icon }}</span>
          <span class="of-workspace-detail-preview-block__item-label">{{ item.label }}</span>
        </div>
        <div class="of-workspace-detail-preview-block__item-value">{{ item.value }}</div>
        <p v-if="item.description" class="of-workspace-detail-preview-block__item-description">
          {{ item.description }}
        </p>
      </article>
    </div>

    <footer v-if="$slots.footer" class="of-workspace-detail-preview-block__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.of-workspace-detail-preview-block {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-3);
  width: 100%;
}

.of-workspace-detail-preview-block__header {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1_5);
}

.of-workspace-detail-preview-block__title-group {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

.of-workspace-detail-preview-block__title {
  margin: 0;
  font-size: var(--of-font-size-sm);
  line-height: 1.4;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-weight: var(--of-font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.of-workspace-detail-preview-block__subtitle {
  margin: 0;
  font-size: var(--of-font-size-sm);
  line-height: 1.55;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-detail-preview-block__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-1_5);
}

.of-workspace-detail-preview-block__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  padding: 1px var(--of-spacing-1_5);
  border-radius: var(--of-radius-md);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  background: var(--of-surface-elevated);
  font-size: var(--of-font-size-xs);
}

.of-workspace-detail-preview-block__chip--accent {
  border-color: #dbeafe;
}

.of-workspace-detail-preview-block__chip--success {
  border-color: var(--of-color-success-border, #bbf7d0);
}

.of-workspace-detail-preview-block__chip--warning {
  border-color: var(--of-color-warning-border, #fde68a);
}

.of-workspace-detail-preview-block__chip--danger {
  border-color: var(--of-color-danger-border, #fecaca);
}

.of-workspace-detail-preview-block__chip-label,
.of-workspace-detail-preview-block__item-description {
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-detail-preview-block__body {
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #f0f0f0));
  border-radius: var(--of-radius-md);
  background: var(--of-surface-elevated);
  max-height: 360px;
  overflow: auto;
  padding: var(--of-spacing-3) var(--of-spacing-3_5);
}

.of-workspace-detail-preview-block__items {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-top: var(--of-spacing-0_5);
  border-top: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #f0f0f0));
}

.of-workspace-detail-preview-block__items-title {
  padding: var(--of-spacing-2) 0 var(--of-spacing-1_5);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-detail-preview-block__item {
  display: grid;
  grid-template-columns: minmax(72px, 88px) minmax(0, 1fr);
  gap: var(--of-spacing-0_5) var(--of-spacing-3);
  padding: var(--of-spacing-2) 0;
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #f0f0f0));
}

.of-workspace-detail-preview-block__item-head {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  grid-column: 1;
  grid-row: 1 / span 2;
}

.of-workspace-detail-preview-block__item-label {
  font-size: var(--of-font-size-xs);
  font-weight: 400;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-detail-preview-block__item-value {
  font-size: var(--of-font-size-xs);
  font-weight: 400;
  color: var(--of-text-primary, var(--of-color-text, #111827));
  word-break: break-word;
}

.of-workspace-detail-preview-block__item-description {
  margin: 0;
  font-size: var(--of-font-size-xs);
  line-height: var(--of-line-height-normal);
}

.of-workspace-detail-preview-block__item-icon {
  display: none;
}

.of-workspace-detail-preview-block__empty {
  margin: 0;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-size: var(--of-font-size-base);
}

.of-workspace-detail-preview-block__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-2);
}

.of-workspace-detail-preview-block__body :deep(.of-content-block) {
  padding: 0;
  border: 0;
  background: transparent;
}

.of-workspace-detail-preview-block__body :deep(.of-content-block__content) {
  font-size: var(--of-font-size-xs);
  line-height: 1.66;
}

.of-workspace-detail-preview-block__body :deep(.content-block) {
  padding: 0;
  border: 0;
  background: transparent;
  gap: var(--of-spacing-3);
}

.of-workspace-detail-preview-block__body :deep(.content-block__para),
.of-workspace-detail-preview-block__body :deep(p),
.of-workspace-detail-preview-block__body :deep(li) {
  margin: 0;
  font-size: var(--of-font-size-xs);
  line-height: 1.62;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-workspace-detail-preview-block__body :deep(h1),
.of-workspace-detail-preview-block__body :deep(h2),
.of-workspace-detail-preview-block__body :deep(h3),
.of-workspace-detail-preview-block__body :deep(h4) {
  margin: 0 0 var(--of-spacing-2);
  color: var(--of-text-primary, var(--of-color-text, #111827));
  line-height: 1.35;
  font-weight: var(--of-font-weight-semibold);
}

.of-workspace-detail-preview-block__body :deep(h1) {
  font-size: var(--of-font-size-md);
}

.of-workspace-detail-preview-block__body :deep(h2) {
  font-size: var(--of-font-size-sm);
}

.of-workspace-detail-preview-block__body :deep(h3),
.of-workspace-detail-preview-block__body :deep(h4) {
  font-size: var(--of-font-size-xs);
}

.of-workspace-detail-preview-block__body :deep(ul),
.of-workspace-detail-preview-block__body :deep(ol) {
  margin: 0;
  padding-left: var(--of-spacing-5);
  display: grid;
  gap: var(--of-spacing-1_5);
}

.of-workspace-detail-preview-block__body :deep(blockquote) {
  margin: 0;
  padding-left: var(--of-spacing-3);
  border-left: 2px solid var(--of-color-gray-200);
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-detail-preview-block__body :deep(code) {
  padding: 1px var(--of-spacing-1);
  border-radius: var(--of-radius-sm);
  background: #f8fafc;
  font-size: var(--of-font-size-2xs);
}

.of-workspace-detail-preview-block__body :deep(pre) {
  margin: 0;
  padding: var(--of-spacing-3);
  border-radius: var(--of-radius-md);
  background: #f8fafc;
  overflow: auto;
}
</style>
