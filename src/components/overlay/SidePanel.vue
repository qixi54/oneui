<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch, type CSSProperties, type VNode } from "vue";
import { X } from "lucide-vue-next";
import { useFocusTrap } from "../../composables/useFocusTrap";

export interface SidePanelProps {
  modelValue: boolean;
  width?: number;
  title?: string;
  showClose?: boolean;
  mode?: "lazy" | "persistent";
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

const props = withDefaults(defineProps<SidePanelProps>(), {
  width: 500,
  title: undefined,
  showClose: true,
  mode: "persistent",
  resizable: false,
  minWidth: 360,
  maxWidth: 1320,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:width": [value: number];
}>();

defineSlots<{
  default?: () => VNode[];
  header?: () => VNode[];
}>();

const panelStyle = computed<CSSProperties>(() => ({
  "--of-side-panel-width": `${props.width}px`,
}));

// ── Focus Trap ────────────────────────────────────────────────
const {
  containerRef: sidePanelRef,
  activate: activateTrap,
  deactivate: deactivateTrap,
} = useFocusTrap();
// ─────────────────────────────────────────────────────────────

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.modelValue) close();
}

onMounted(() => {
  if (typeof document === "undefined") return;
  document.addEventListener("keydown", onKeydown);
});

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      activateTrap();
    } else {
      deactivateTrap();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});

function close() {
  emit("update:modelValue", false);
}

function clampWidth(width: number): number {
  return Math.max(props.minWidth, Math.min(props.maxWidth, width));
}

function handleResizeStart(event: PointerEvent) {
  if (!props.resizable || typeof window === "undefined") return;
  event.preventDefault();
  const onPointerMove = (moveEvent: PointerEvent) => {
    const nextWidth = clampWidth(window.innerWidth - moveEvent.clientX);
    emit("update:width", nextWidth);
  };
  const onPointerUp = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp, { once: true });
}
</script>

<template>
  <Teleport to="body">
    <template v-if="mode === 'lazy'">
      <aside
        v-if="modelValue"
        ref="sidePanelRef"
        class="of-side-panel"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <button
          v-if="resizable"
          type="button"
          class="of-side-panel__resize-handle"
          aria-label="调整面板宽度"
          @pointerdown="handleResizeStart"
        />
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
      ref="sidePanelRef"
    class="of-side-panel"
    :style="panelStyle"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <button
        v-if="resizable"
        type="button"
        class="of-side-panel__resize-handle"
        aria-label="调整面板宽度"
        @pointerdown="handleResizeStart"
      />
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
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #ffffff));
  box-shadow: var(--of-shadow-panel);
  overflow: hidden;
  width: min(var(--of-side-panel-width, 500px), 100vw);
  max-width: 100vw;
}

.of-side-panel__resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 10px;
  height: 100%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: ew-resize;
}

.of-side-panel__header {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3, 12px);
  padding: var(--of-spacing-4, 16px);
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  flex-shrink: 0;
}

.of-side-panel__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-side-panel__title-placeholder {
  flex: 1;
}

.of-side-panel__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--of-radius-md, 6px);
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  cursor: pointer;
  flex-shrink: 0;
}

.of-side-panel__close:hover {
  background: var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-side-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--of-spacing-4, 16px);
  min-height: 0;
}
</style>
