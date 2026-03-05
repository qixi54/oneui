<script setup lang="ts">
import { PlusIcon } from "lucide-vue-next";

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

function handleClick(event: MouseEvent) {
  emit("click", event);
}
</script>

<template>
  <button class="of-add-view-btn" @click="handleClick">
    <PlusIcon class="of-add-view-btn__icon" :size="12" />
    <span class="of-add-view-btn__label">添加视图</span>
  </button>
</template>

<style scoped>
.of-add-view-btn {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 6px 10px !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  font-weight: 400 !important;
  color: var(--of-color-gray-400) !important;
  line-height: 1 !important;
  white-space: nowrap !important;
  transition: var(--of-transition-fast) !important;
  border-radius: var(--of-radius-md) !important;
}

.of-add-view-btn .of-add-view-btn__icon {
  color: var(--of-color-gray-400) !important;
  flex-shrink: 0;
  transition: var(--of-transition-fast) !important;
}

.of-add-view-btn:hover {
  color: var(--of-color-gray-600) !important;
}

.of-add-view-btn:hover .of-add-view-btn__icon {
  color: var(--of-color-gray-600) !important;
}

.of-add-view-btn__label {
  line-height: 1;
}
</style>
