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
  gap: 4px;
  padding: 8px 12px;
  background: var(--of-color-gray-100);
  border-radius: 0 12px 12px 12px;
}

.of-ai-thinking.sm {
  padding: 6px 10px;
  gap: 3px;
}

.of-ai-thinking__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--of-color-gray-500);
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
