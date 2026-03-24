<script setup lang="ts">
import type { CommentData } from "../../types";

withDefaults(
  defineProps<{
    comment: CommentData;
  }>(),
  {},
);
</script>

<template>
  <div class="comment-item">
    <!-- 头像 -->
    <div
      class="comment-item__avatar"
      :style="{ backgroundColor: comment.avatarColor ?? 'var(--of-accent-default)' }"
    >
      {{ comment.authorInitial }}
    </div>

    <!-- 内容区 -->
    <div class="comment-item__content">
      <!-- 头部行 -->
      <div class="comment-item__header">
        <span class="comment-item__author">{{ comment.author }}</span>
        <span v-if="comment.action" class="comment-item__action">{{ comment.action }}</span>
        <span class="comment-item__time">{{ comment.time }}</span>
      </div>

      <!-- 评论文字 -->
      <div class="comment-item__text">{{ comment.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--of-spacing-2_5);
  padding: 0 0 var(--of-spacing-3) var(--of-spacing-3);
  border-bottom: 1px solid var(--of-color-gray-100);
  box-sizing: border-box;
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* 头像 */
.comment-item__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--of-color-text-inverse);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-semibold);
  flex-shrink: 0;
  letter-spacing: 0;
  user-select: none;
}

/* 右侧内容 */
.comment-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

/* 头部行 */
.comment-item__header {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  flex-wrap: wrap;
}

.comment-item__author {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-gray-800);
  white-space: nowrap;
}

.comment-item__action {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-color-gray-500);
}

.comment-item__time {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-xs);
  color: var(--of-color-gray-400);
  margin-left: auto;
  white-space: nowrap;
}

/* 内容文字 */
.comment-item__text {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-color-gray-600);
  line-height: var(--of-line-height-normal);
  word-break: break-word;
}
</style>
