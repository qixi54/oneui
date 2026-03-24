<script setup lang="ts">
import AiStreamingCursor from "./AiStreamingCursor.vue";

defineProps<{
  content: string;
  isStreaming?: boolean;
  /** 是否为错误状态，气泡显示为红色 */
  isError?: boolean;
  avatar?: string;
  name?: string;
  timestamp?: string;
}>();
</script>

<template>
  <div class="of-ai-message">
    <div class="of-ai-message__avatar">
      <img v-if="avatar" :src="avatar" :alt="name || 'AI'" class="of-ai-message__avatar-img" />
      <span v-else class="of-ai-message__avatar-emoji">🤖</span>
    </div>
    <div class="of-ai-message__body">
      <div v-if="name" class="of-ai-message__name">{{ name }}</div>
      <div class="of-ai-message__bubble" :class="{ 'of-ai-message__bubble--error': isError }">
        <span class="of-ai-message__content">{{ content }}</span>
        <AiStreamingCursor v-if="isStreaming" />
      </div>
      <div v-if="timestamp" class="of-ai-message__timestamp">{{ timestamp }}</div>
    </div>
  </div>
</template>

<style scoped>
@keyframes ofMsgSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.of-ai-message {
  display: flex;
  align-items: flex-start;
  gap: var(--of-spacing-2);
  animation: ofMsgSlideIn 300ms ease-out both;
}

.of-ai-message__avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--of-surface-muted, var(--of-color-gray-200));
  display: flex;
  align-items: center;
  justify-content: center;
}

.of-ai-message__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.of-ai-message__avatar-emoji {
  font-size: var(--of-font-size-xl);
  line-height: 1;
}

.of-ai-message__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--of-spacing-1);
  max-width: calc(100% - 44px);
}

.of-ai-message__name {
  font-size: var(--of-font-size-sm);
  color: var(--of-text-secondary, var(--of-color-gray-500));
  font-family: var(--of-font-sans);
  font-weight: var(--of-font-weight-medium);
}

.of-ai-message__bubble {
  background: var(--of-surface-muted, var(--of-color-gray-100));
  border-radius: 0 var(--of-radius-xl) var(--of-radius-xl) var(--of-radius-xl);
  padding: var(--of-spacing-2_5) var(--of-spacing-3_5);
  font-size: var(--of-font-size-md);
  line-height: var(--of-line-height-relaxed);
  color: var(--of-text-primary, var(--of-color-gray-800));
  font-family: var(--of-font-sans);
  word-break: break-word;
  white-space: pre-wrap;
}

.of-ai-message__bubble--error {
  background: var(--of-surface-selected, var(--of-color-error-light));
  color: var(--of-color-error);
}

.of-ai-message__content {
  display: inline;
}

.of-ai-message__timestamp {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  font-family: var(--of-font-sans);
}
</style>
