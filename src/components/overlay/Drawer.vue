<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useSlots, watch, type Slots } from "vue";
import { X } from "lucide-vue-next";
import { useFocusTrap } from "../../composables/useFocusTrap";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    width?: number;
    title?: string;
    showClose?: boolean;
    maskClosable?: boolean;
    zIndex?: number;
    fullscreen?: boolean;
    resizable?: boolean;
    minWidth?: number;
    maxWidth?: number;
  }>(),
  {
    width: 390,
    title: undefined,
    showClose: true,
    maskClosable: true,
    zIndex: 1000,
    fullscreen: false,
    resizable: false,
    minWidth: 360,
    maxWidth: 1320,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:width": [value: number];
}>();

const slots: Slots = useSlots();

const drawerStyle = computed(() => ({
  "--of-drawer-width": `${props.width}px`,
}));

// ── Focus Trap ────────────────────────────────────────────────
const {
  containerRef: drawerRef,
  activate: activateTrap,
  deactivate: deactivateTrap,
} = useFocusTrap();
// ─────────────────────────────────────────────────────────────

function handleClose() {
  emit("update:modelValue", false);
}

function clampWidth(width: number): number {
  return Math.max(props.minWidth, Math.min(props.maxWidth, width));
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.modelValue) handleClose();
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

function handleResizeStart(event: PointerEvent) {
  if (!props.resizable || props.fullscreen || typeof window === "undefined") return;
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
    <Transition name="of-drawer">
      <div
        v-if="modelValue"
        class="of-drawer-overlay"
        :style="{ zIndex }"
      >
        <button
          v-if="maskClosable"
          type="button"
          class="of-drawer-overlay__hitarea"
          aria-label="关闭抽屉"
          @click="handleClose"
        />
        <aside
          ref="drawerRef"
        class="of-drawer"
        :class="{ 'of-drawer--fullscreen': fullscreen }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :style="drawerStyle"
          @click.stop
        >
          <button
            v-if="resizable && !fullscreen"
            type="button"
            class="of-drawer__resize-handle"
            aria-label="调整抽屉宽度"
            @pointerdown="handleResizeStart"
          />
          <div class="of-drawer__inner">
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.of-drawer-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.32);
}

.of-drawer-overlay__hitarea {
  position: absolute;
  inset: 0;
  border: none;
  background: transparent;
  cursor: default;
}

.of-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(var(--of-drawer-width, 390px), 100vw);
  max-width: 100vw;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #ffffff));
  border-left: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  box-shadow: var(--of-shadow-drawer);
  overflow: hidden;
}

.of-drawer__resize-handle {
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

.of-drawer--fullscreen {
  width: 100vw;
  border-left: none;
}

.of-drawer__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.of-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: var(--of-spacing-4, 16px) var(--of-spacing-5, 20px);
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  flex-shrink: 0;
}

.of-drawer__title {
  flex: 1;
  min-width: 0;
}

.of-drawer__title-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-drawer__close {
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
  line-height: 1;
  transition: var(--of-transition-fast, all 0.15s ease);
}

.of-drawer__close:hover {
  background: var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-drawer__body {
  min-width: 0;
  flex: 1;
  overflow-y: auto;
  padding: var(--of-spacing-5, 20px);
}

.of-drawer-enter-active,
.of-drawer-leave-active {
  transition:
    background 0.22s ease,
    opacity 0.22s ease;
}

.of-drawer-enter-active .of-drawer,
.of-drawer-leave-active .of-drawer {
  transition: transform 0.22s ease;
}

.of-drawer-enter-from,
.of-drawer-leave-to {
  opacity: 0;
  background: transparent;
}

.of-drawer-enter-from .of-drawer,
.of-drawer-leave-to .of-drawer {
  transform: translateX(100%);
}
</style>
