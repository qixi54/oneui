<script setup lang="ts">
defineProps<{ visible?: boolean }>();
</script>

<template>
  <span v-if="visible !== false" class="of-streaming-cursor" />
</template>

<style scoped>
@keyframes ofCursorBlink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.of-streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  margin-left: 1px;
  vertical-align: text-bottom;
  animation: ofCursorBlink 1s infinite;
}
</style>
