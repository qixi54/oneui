<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";
import { X } from "lucide-vue-next";

export interface SidePanelProps {
  modelValue: boolean;
  width?: number;
  title?: string;
  showClose?: boolean;
  mode?: "lazy" | "persistent";
}

const props = withDefaults(defineProps<SidePanelProps>(), {
  width: 500,
  showClose: true,
  mode: "persistent",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

defineSlots<{
  default?: () => VNode[];
  header?: () => VNode[];
}>();

const panelStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
}));

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <Teleport to="body">
    <template v-if="mode === 'lazy'">
      <aside
        v-if="modelValue"
        class="of-side-panel"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div v-if="$slots.header || title || showClose" class="of-side-panel__header">
          <slot name="header">
            <h3 v-if="title" class="of-side-panel__title">{{ title }}</h3>
            <div v-else class="of-side-panel__title-placeholder" />
          </slot>
          <button
            v-if="showClose"
            class="of-side-panel__close"
            type="button"
            aria-label="关闭"
            @click="close"
          >
            <X :size="18" />
          </button>
        </div>
        <div class="of-side-panel__body">
          <slot />
        </div>
      </aside>
    </template>

    <aside
      v-else
      v-show="modelValue"
      class="of-side-panel"
      :style="panelStyle"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div v-if="$slots.header || title || showClose" class="of-side-panel__header">
        <slot name="header">
          <h3 v-if="title" class="of-side-panel__title">{{ title }}</h3>
          <div v-else class="of-side-panel__title-placeholder" />
        </slot>
        <button
          v-if="showClose"
          class="of-side-panel__close"
          type="button"
          aria-label="关闭"
          @click="close"
        >
          <X :size="18" />
        </button>
      </div>
      <div class="of-side-panel__body">
        <slot />
      </div>
    </aside>
  </Teleport>
</template>

<style scoped>
.of-side-panel {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  height: 100vh !important;
  z-index: 200 !important;
  display: flex !important;
  flex-direction: column !important;
  background: var(--of-color-bg-elevated, #ffffff) !important;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.13) !important;
  overflow: hidden !important;
  max-width: 100vw !important;
}

.of-side-panel__header {
  display: flex !important;
  align-items: center !important;
  gap: var(--of-spacing-3, 12px) !important;
  padding: var(--of-spacing-4, 16px) !important;
  border-bottom: 1px solid var(--of-color-gray-200, #f0f0f0) !important;
  flex-shrink: 0 !important;
}

.of-side-panel__title {
  margin: 0 !important;
  flex: 1 !important;
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  color: var(--of-color-text, #111827) !important;
}

.of-side-panel__title-placeholder {
  flex: 1 !important;
}

.of-side-panel__close {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border: none !important;
  border-radius: var(--of-radius-md, 6px) !important;
  background: transparent !important;
  color: var(--of-color-text-secondary, #6b7280) !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
}

.of-side-panel__close:hover {
  background: var(--of-color-gray-100, #f3f4f6) !important;
  color: var(--of-color-text, #111827) !important;
}

.of-side-panel__body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: var(--of-spacing-4, 16px) !important;
  min-height: 0 !important;
}
</style>
