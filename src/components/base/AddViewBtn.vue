<script setup lang="ts">
import { PlusIcon } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  emit("click", event);
}
</script>

<template>
  <button class="of-add-view-btn" :disabled="disabled" @click="handleClick">
    <PlusIcon class="of-add-view-btn__icon" :size="12" />
    <span class="of-add-view-btn__label">添加视图</span>
  </button>
</template>

<style scoped>
.of-add-view-btn {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: var(--of-spacing-1_5) var(--of-spacing-2_5);
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  font-weight: 400;
  color: var(--of-color-gray-400);
  line-height: 1;
  white-space: nowrap;
  transition: var(--of-transition-fast);
  border-radius: var(--of-radius-md);
}

.of-add-view-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.of-add-view-btn:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
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
