<script setup lang="ts">
defineProps<{
  content: string;
  timestamp?: string;
  avatar?: string;
}>();
</script>

<template>
  <div class="of-user-message">
    <div class="of-user-message__body">
      <div class="of-user-message__bubble">{{ content }}</div>
      <div v-if="timestamp" class="of-user-message__timestamp">{{ timestamp }}</div>
    </div>
    <div class="of-user-message__avatar">
      <img v-if="avatar" :src="avatar" alt="User" class="of-user-message__avatar-img" />
      <span v-else class="of-user-message__avatar-emoji">👤</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes ofUserMsgSlideIn {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.of-user-message {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: var(--of-spacing-2);
  animation: ofUserMsgSlideIn 250ms ease-out both;
}

.of-user-message__body {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--of-spacing-1);
  max-width: calc(100% - 44px);
}

.of-user-message__bubble {
  background: var(--of-surface-selected, var(--of-color-gray-100));
  color: var(--of-text-primary, var(--of-color-text-inverse));
  border-radius: var(--of-radius-xl) 0 var(--of-radius-xl) var(--of-radius-xl);
  padding: var(--of-spacing-2_5) var(--of-spacing-3_5);
  font-size: var(--of-font-size-md);
  line-height: var(--of-line-height-relaxed);
  font-family: var(--of-font-sans);
  word-break: break-word;
  white-space: pre-wrap;
}

.of-user-message__timestamp {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  font-family: var(--of-font-sans);
}

.of-user-message__avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--of-surface-muted, var(--of-color-gray-50));
  display: flex;
  align-items: center;
  justify-content: center;
}

.of-user-message__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.of-user-message__avatar-emoji {
  font-size: var(--of-font-size-xl);
  line-height: 1;
}
</style>
