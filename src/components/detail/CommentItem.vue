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
      :style="{ backgroundColor: comment.avatarColor ?? 'var(--of-color-primary-500)' }"
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
  gap: 10px;
  padding: 0 0 12px 12px;
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
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--of-color-text-inverse);
  font-family: var(--of-font-sans);
  font-size: 11px;
  font-weight: 600;
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
  gap: 4px;
}

/* 头部行 */
.comment-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.comment-item__author {
  font-family: var(--of-font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--of-color-gray-800);
  white-space: nowrap;
}

.comment-item__action {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-color-gray-500);
}

.comment-item__time {
  font-family: var(--of-font-sans);
  font-size: 11px;
  color: var(--of-color-gray-400);
  margin-left: auto;
  white-space: nowrap;
}

/* 内容文字 */
.comment-item__text {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-color-gray-600);
  line-height: 1.5;
  word-break: break-word;
}
</style>
