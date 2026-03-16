<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type VNode,
} from "vue";
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

// ── Focus Trap ────────────────────────────────────────────────
const sidePanelRef = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

function getFocusableElements(): HTMLElement[] {
  if (!sidePanelRef.value) return [];
  return Array.from(
    sidePanelRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]',
    ),
  ).filter((el) => !el.closest('[aria-hidden="true"]'));
}

function trapFocus(e: KeyboardEvent) {
  if (e.key !== "Tab") return;
  const focusable = getFocusableElements();
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
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
      previousFocus = document.activeElement as HTMLElement;
      nextTick(() => {
        const focusable = getFocusableElements();
        if (focusable.length) focusable[0].focus();
        document.addEventListener("keydown", trapFocus);
      });
    } else {
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
      previousFocus = null;
    }
  },
);

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("keydown", trapFocus);
  document.body.style.overflow = "";
});

function close() {
  emit("update:modelValue", false);
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
  background: var(--of-color-bg-elevated, #ffffff);
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.13);
  overflow: hidden;
  max-width: 100vw;
}

.of-side-panel__header {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3, 12px);
  padding: var(--of-spacing-4, 16px);
  border-bottom: 1px solid var(--of-color-gray-200, #f0f0f0);
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
  color: var(--of-color-text, #111827);
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
  color: var(--of-color-text-secondary, #6b7280);
  cursor: pointer;
  flex-shrink: 0;
}

.of-side-panel__close:hover {
  background: var(--of-color-gray-100, #f3f4f6);
  color: var(--of-color-text, #111827);
}

.of-side-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--of-spacing-4, 16px);
  min-height: 0;
}
</style>
