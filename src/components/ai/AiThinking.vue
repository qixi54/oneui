<script setup lang="ts">
defineProps<{ size?: "sm" | "md" }>();
</script>

<template>
  <div class="of-ai-thinking" :class="size">
    <span class="of-ai-thinking__dot" />
    <span class="of-ai-thinking__dot" />
    <span class="of-ai-thinking__dot" />
  </div>
</template>

<style scoped>
@keyframes ofDotBounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.of-ai-thinking {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: var(--of-spacing-2) var(--of-spacing-3);
  background: var(--of-surface-muted, var(--of-color-gray-100));
  border-radius: 0 var(--of-radius-xl) var(--of-radius-xl) var(--of-radius-xl);
}

.of-ai-thinking.sm {
  padding: var(--of-spacing-1_5) var(--of-spacing-2_5);
  gap: var(--of-spacing-0_75);
}

.of-ai-thinking__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--of-text-secondary, var(--of-color-gray-500));
  animation: ofDotBounce 1.4s ease-in-out infinite;
}

.of-ai-thinking__dot:nth-child(1) {
  animation-delay: 0s;
}
.of-ai-thinking__dot:nth-child(2) {
  animation-delay: 0.2s;
}
.of-ai-thinking__dot:nth-child(3) {
  animation-delay: 0.4s;
}

.of-ai-thinking.sm .of-ai-thinking__dot {
  width: 5px;
  height: 5px;
}
</style>
