<script setup lang="ts">
import { computed, type Component } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{
  icon: string;
  label: string;
  active?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

function toPascalCase(name: string): string {
  return (
    name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Icon"
  );
}

const iconComponent = computed<Component | undefined>(() => {
  const key = toPascalCase(props.icon);
  return (LucideIcons as unknown as Record<string, Component>)[key];
});

function handleClick(event: MouseEvent) {
  emit("click", event);
}
</script>

<template>
  <button class="of-toolbar-btn" :class="{ 'of-toolbar-btn--active': active }" @click="handleClick">
    <component :is="iconComponent" class="of-toolbar-btn__icon" :size="13" />
    <span class="of-toolbar-btn__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.of-toolbar-btn {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-md);
  cursor: pointer;
  font-family: var(--of-font-sans);
  font-size: 12px;
  font-weight: 400;
  color: var(--of-color-gray-600);
  line-height: 1;
  white-space: nowrap;
  transition: var(--of-transition-fast);
}

.of-toolbar-btn .of-toolbar-btn__icon {
  color: var(--of-color-gray-500);
  flex-shrink: 0;
}

.of-toolbar-btn:hover:not(.of-toolbar-btn--active) {
  background: var(--of-color-gray-50);
}

.of-toolbar-btn--active {
  background: var(--of-color-primary-50);
  color: var(--of-color-primary-600);
  border-color: var(--of-color-primary-200);
}

.of-toolbar-btn--active .of-toolbar-btn__icon {
  color: var(--of-color-primary-600);
}

.of-toolbar-btn__label {
  line-height: 1;
}
</style>
