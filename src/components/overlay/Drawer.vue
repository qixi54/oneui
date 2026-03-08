<script setup lang="ts">
import { computed, useSlots } from "vue";
import { X } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    width?: number;
    title?: string;
    showClose?: boolean;
  }>(),
  {
    width: 390,
    showClose: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const slots = useSlots();

const drawerStyle = computed(() => ({
  width: props.modelValue ? `${props.width}px` : "0",
}));

const drawerInnerStyle = computed(() => ({
  width: `${props.width}px`,
}));

function handleClose() {
  emit("update:modelValue", false);
}
</script>

<template>
  <aside
    class="of-drawer"
    :style="drawerStyle"
    :aria-hidden="!modelValue"
  >
    <div class="of-drawer__inner" :style="drawerInnerStyle">
      <div v-if="slots.title || title || showClose" class="of-drawer__header">
        <div class="of-drawer__title">
          <slot name="title">
            <h3 v-if="title" class="of-drawer__title-text">{{ title }}</h3>
          </slot>
        </div>
        <button
          v-if="showClose"
          class="of-drawer__close"
          type="button"
          aria-label="关闭"
          @click="handleClose"
        >
          <X :size="18" />
        </button>
      </div>

      <div class="of-drawer__body">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.of-drawer {
  width: 0;
  overflow: hidden;
  transition: width 0.22s ease;
  border-left: 1px solid #f0f0f0;
  background: var(--of-color-bg-elevated, #ffffff);
  flex-shrink: 0;
  min-width: 0;
}

.of-drawer__inner {
  padding: 14px;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 78vh;
  height: 100%;
}

.of-drawer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 9px;
}

.of-drawer__title {
  flex: 1;
  min-width: 0;
}

.of-drawer__title-text {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--of-color-text, #111827);
}

.of-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #bfbfbf;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}

.of-drawer__close:hover {
  color: var(--of-color-text, #111827);
}

.of-drawer__body {
  min-width: 0;
}
</style>
