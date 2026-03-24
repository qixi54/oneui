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
  gap: var(--of-spacing-2_5);
  padding: var(--of-spacing-4);
  border-radius: var(--of-radius-lg);
  background: var(--of-surface-panel, var(--of-color-gray-50, #f9fafb));
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-100, #f3f4f6));
  font-size: var(--of-font-size-base);
  line-height: var(--of-line-height-normal);
  color: var(--of-text-secondary, var(--of-color-text-secondary, #374151));
  width: 100%;
  box-sizing: border-box;
}
</style>
