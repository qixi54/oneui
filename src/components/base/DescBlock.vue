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
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 8px;
  background: var(--of-color-gray-50, #F9FAFB);
  border: 1px solid var(--of-color-gray-100, #F3F4F6);
  font-size: 13px;
  line-height: 1.5;
  color: var(--of-color-text-secondary, #374151);
  width: 100%;
  box-sizing: border-box;
}
</style>
