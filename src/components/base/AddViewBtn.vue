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
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--of-font-sans);
  font-size: 12px;
  font-weight: 400;
  color: var(--of-color-gray-400);
  line-height: 1;
  white-space: nowrap;
  transition: var(--of-transition-fast);
  border-radius: var(--of-radius-md);
}

.of-add-view-btn .of-add-view-btn__icon {
  color: var(--of-color-gray-400);
  flex-shrink: 0;
  transition: var(--of-transition-fast);
}

.of-add-view-btn:hover {
  color: var(--of-color-gray-600);
}

.of-add-view-btn:hover .of-add-view-btn__icon {
  color: var(--of-color-gray-600);
}

.of-add-view-btn__label {
  line-height: 1;
}
</style>
