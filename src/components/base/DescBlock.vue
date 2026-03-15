<script setup lang="ts">
defineOptions({ name: "DescBlock" });
</script>

<template>
  <div class="one-desc-block">
    <slot />
  </div>
</template>

<style scoped>
.one-desc-block {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  padding: 16px !important;
  border-radius: 8px !important;
  background: var(--of-color-gray-50, #F9FAFB) !important;
  border: 1px solid var(--of-color-gray-100, #F3F4F6) !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  color: var(--of-color-text-secondary, #374151) !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
</style>
