<script setup lang="ts">
import { computed } from "vue";
import { useMarkdown } from "@/composables/useMarkdown";

const props = withDefaults(
  defineProps<{
    /** markdown 原文 */
    content: string;
    /** 最大显示行数，默认 2 */
    maxLines?: number;
    /** 是否展开显示完整内容 */
    expanded?: boolean;
  }>(),
  {
    maxLines: 2,
    expanded: false,
  },
);

const { renderMarkdown } = useMarkdown();

/** 截断预览：提取纯文本，去掉 markdown 标记 */
const previewText = computed(() => {
  if (!props.content) return "—";
  return stripMarkdown(props.content);
});

/** 完整渲染的 HTML */
const renderedHtml = computed(() => {
  if (!props.content) return "";
  return renderMarkdown(props.content);
});

/** 是否有内容需要截断 */
const isTruncated = computed(() => {
  if (!props.content) return false;
  return props.content.length > 100 || props.content.includes("\n");
});

/**
 * 轻量级 markdown 剥离（用于表格单元格预览）
 * 不需要完美，只需要可读
 */
function stripMarkdown(md: string): string {
  return (
    md
      // 标题：## Title → Title
      .replace(/^#{1,6}\s+/gm, "")
      // 粗体/斜体
      .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
      .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
      // 代码块（多行）
      .replace(/```[\s\S]*?```/g, "[代码]")
      // 行内代码
      .replace(/`([^`]+)`/g, "$1")
      // 链接 [text](url) → text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // 图片 ![alt](url) → [图片]
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[图片]")
      // 列表标记
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // 引用
      .replace(/^>\s+/gm, "")
      // 水平线
      .replace(/^---+$/gm, "")
      // 多个换行合并
      .replace(/\n{2,}/g, " — ")
      .replace(/\n/g, " ")
      .trim()
  );
}
</script>

<template>
  <div class="of-field-md-preview" :class="{ 'of-field-md-preview--expanded': expanded }">
    <!-- 截断预览模式 -->
    <span
      v-if="!expanded"
      class="of-field-md-preview__text"
      :style="{ '-webkit-line-clamp': maxLines }"
    >
      {{ previewText }}
    </span>

    <!-- 展开模式：完整 markdown 渲染 -->
    <!-- renderMarkdown 已在 composable 内完成 markdown->HTML 渲染与消毒 -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else class="of-field-md-preview__full of-markdown" v-html="renderedHtml" />

    <!-- 截断指示器 -->
    <span v-if="!expanded && isTruncated" class="of-field-md-preview__more">...</span>
  </div>
</template>

<style scoped>
.of-field-md-preview {
  width: 100%;
  overflow: hidden;
}

.of-field-md-preview__text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--of-font-size-base);
  line-height: 1.4;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #4b5563));
  word-break: break-word;
}

.of-field-md-preview__more {
  color: var(--of-text-tertiary, var(--of-color-gray-400, #9ca3af));
  font-size: var(--of-font-size-sm);
}

.of-field-md-preview__full {
  font-size: var(--of-font-size-md);
  line-height: var(--of-line-height-relaxed);
  color: var(--of-text-primary, var(--of-color-text-primary, #1a1a1a));
}

/* 展开模式下的 markdown 样式微调 */
.of-field-md-preview__full :deep(h1),
.of-field-md-preview__full :deep(h2),
.of-field-md-preview__full :deep(h3) {
  margin-top: 0.5em;
  margin-bottom: 0.3em;
}

.of-field-md-preview__full :deep(p) {
  margin: 0.3em 0;
}

.of-field-md-preview__full :deep(code) {
  background: var(--of-surface-muted, var(--of-color-gray-100, #f3f4f6));
  padding: 1px var(--of-spacing-1);
  border-radius: var(--of-radius-md);
  font-size: 0.9em;
}
</style>
