<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useSlots, watch, type Slots } from "vue";
import { X } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    width?: number;
    title?: string;
    showClose?: boolean;
    maskClosable?: boolean;
    zIndex?: number;
  }>(),
  {
    width: 390,
    showClose: true,
    maskClosable: true,
    zIndex: 1000,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const slots: Slots = useSlots();

const drawerStyle = computed(() => ({
  width: `${props.width}px`,
}));

function handleClose() {
  emit("update:modelValue", false);
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
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="of-drawer">
      <div
        v-if="modelValue"
        class="of-drawer-overlay"
        :style="{ zIndex }"
        @click="maskClosable && handleClose()"
      >
        <aside
          class="of-drawer"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :style="drawerStyle"
          @click.stop
        >
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
  background: rgba(0, 0, 0, 0.45);
}

.of-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  max-width: 100vw;
  background: var(--of-color-bg-elevated, #ffffff);
  border-left: 1px solid var(--of-color-gray-200, #e5e7eb);
  box-shadow:
    -12px 0 32px rgba(0, 0, 0, 0.12),
    -2px 0 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
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
  border-bottom: 1px solid var(--of-color-gray-200, #e5e7eb);
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
  color: var(--of-color-text, #111827);
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
  color: var(--of-color-text-secondary, #6b7280);
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
  transition: var(--of-transition-fast, all 0.15s ease);
}

.of-drawer__close:hover {
  background: var(--of-color-gray-100, #f3f4f6);
  color: var(--of-color-text, #111827);
}

.of-drawer__body {
  min-width: 0;
  flex: 1;
  overflow-y: auto;
  padding: var(--of-spacing-5, 20px);
}

.of-drawer-enter-active,
.of-drawer-leave-active {
  transition: background 0.22s ease, opacity 0.22s ease;
}

.of-drawer-enter-active .of-drawer,
.of-drawer-leave-active .of-drawer {
  transition: transform 0.22s ease;
}

.of-drawer-enter-from,
.of-drawer-leave-to {
  opacity: 0;
  background: rgba(0, 0, 0, 0);
}

.of-drawer-enter-from .of-drawer,
.of-drawer-leave-to .of-drawer {
  transform: translateX(100%);
}
</style>
