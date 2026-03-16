<script setup lang="ts">
import { computed } from "vue";
import { resolveIcon } from "../../utils/icon";

const props = defineProps<{
  icon: string;
  label: string;
  active?: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

// icon prop 为运行时字符串，通过 resolveIcon 动态查找 Lucide 组件。
// 全量引入由 icon.ts 统一处理，此处无需重复引入 lucide-vue-next。
const iconComponent = computed(() => resolveIcon(props.icon));

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

@media (max-width: 768px) {
  .of-toolbar-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
