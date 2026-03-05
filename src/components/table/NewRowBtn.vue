<script setup lang="ts">
import { Plus } from "lucide-vue-next";

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button class="of-new-row-btn" @click="emit('click')">
    <Plus :size="14" class="of-new-row-icon" />
    <span class="of-new-row-label">新建任务</span>
  </button>
</template>

<style scoped>
.of-new-row-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-top: none;
  cursor: pointer;
  text-align: left;
  transition: var(--of-transition-fast);
}

.of-new-row-btn:hover {
  background: var(--of-color-gray-50);
}

.of-new-row-icon {
  color: var(--of-color-gray-400);
  flex-shrink: 0;
  transition: var(--of-transition-fast);
}

.of-new-row-label {
  font-size: 13px;
  color: var(--of-color-gray-400);
  transition: var(--of-transition-fast);
}

.of-new-row-btn:hover .of-new-row-icon,
.of-new-row-btn:hover .of-new-row-label {
  color: var(--of-color-gray-600);
}
</style>
