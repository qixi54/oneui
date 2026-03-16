<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from "vue";
import { X } from "lucide-vue-next";

// Teleport 根节点无法自动继承 attrs（如 class），关闭自动继承
defineOptions({ inheritAttrs: false });

/**
 * Modal 组件 - 通用弹窗
 *
 * 支持自定义宽度、标题、关闭按钮、遮罩关闭、垂直居中、z-index 等配置。
 * 使用 Teleport 将弹窗挂载到 body，避免层叠上下文问题。
 *
 * @example
 * <Modal v-model="showModal" title="标题" width="600px">
 *   <p>内容</p>
 *   <template #footer>
 *     <button @click="showModal = false">关闭</button>
 *   </template>
 * </Modal>
 */

const props = withDefaults(
  defineProps<{
    /** v-model 控制显示/隐藏（必填） */
    modelValue: boolean;
    /** 弹窗宽度，默认 '500px' */
    width?: string;
    /** 弹窗标题（可选） */
    title?: string;
    /** 是否显示右上角关闭按钮，默认 true */
    closable?: boolean;
    /** 点击遮罩是否关闭，默认 true */
    maskClosable?: boolean;
    /** 是否垂直居中，默认 true */
    centered?: boolean;
    /** z-index，默认 1000 */
    zIndex?: number;
  }>(),
  {
    width: "500px",
    closable: true,
    maskClosable: true,
    centered: true,
    zIndex: 1000,
  },
);

const emit = defineEmits<{
  /** 关闭时触发，更新 v-model 绑定值 */
  "update:modelValue": [value: boolean];
}>();

// ── Focus Trap ────────────────────────────────────────────────
const modalRef = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) return [];
  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]'
    )
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

function close() {
  emit("update:modelValue", false);
}

function onMaskClick() {
  if (props.maskClosable) close();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.modelValue) close();
}

watch(
  () => props.modelValue,
  (val) => {
    if (typeof document === "undefined") return; // SSR 守卫
    if (val) {
      document.body.style.overflow = "hidden";
      previousFocus = document.activeElement as HTMLElement;
      document.addEventListener("keydown", onKeydown);
      nextTick(() => {
        const focusable = getFocusableElements();
        if (focusable.length) focusable[0].focus();
        document.addEventListener("keydown", trapFocus);
      });
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
      previousFocus = null;
    }
  },
);

onUnmounted(() => {
  if (typeof document === "undefined") return; // SSR 守卫
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("keydown", trapFocus);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="of-modal">
      <div
        v-if="modelValue"
        class="of-modal-backdrop"
        :style="{ zIndex: zIndex }"
        @click.self="onMaskClick"
      >
        <div
          ref="modalRef"
          class="of-modal"
          :class="{ 'of-modal--centered': centered }"
          :style="{ width: width, maxWidth: '90vw' }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <!-- Header -->
          <div v-if="$slots.header || title || closable" class="of-modal__header">
            <slot name="header">
              <h3 v-if="title" class="of-modal__title">{{ title }}</h3>
              <div v-else class="of-modal__title-placeholder" />
            </slot>
            <button
              v-if="closable"
              class="of-modal__close"
              @click="close"
              aria-label="关闭"
              type="button"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Body -->
          <div class="of-modal__body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="of-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────── */
.of-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--of-spacing-8, 32px) var(--of-spacing-4, 16px);
  background: rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

/* ── Modal container ──────────────────────────────────────── */
.of-modal {
  position: relative;
  background: var(--of-color-bg-elevated, #ffffff);
  border-radius: var(--of-radius-lg, 12px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.16),
    0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.of-modal--centered {
  margin: auto;
}

/* ── Header ───────────────────────────────────────────────── */
.of-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--of-spacing-4, 16px) var(--of-spacing-6, 24px);
  border-bottom: 1px solid var(--of-color-gray-200, #e5e7eb);
  flex-shrink: 0;
  gap: var(--of-spacing-3, 12px);
}

.of-modal__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--of-color-text, #111827);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.of-modal__title-placeholder {
  flex: 1;
}

.of-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--of-radius-md, 6px);
  color: var(--of-color-text-secondary, #6b7280);
  cursor: pointer;
  transition: var(--of-transition-fast, all 0.15s ease);
  flex-shrink: 0;
}

.of-modal__close:hover {
  background: var(--of-color-gray-100, #f3f4f6);
  color: var(--of-color-text, #111827);
}

.of-modal__close:active {
  background: var(--of-color-gray-200, #e5e7eb);
}

/* ── Body ─────────────────────────────────────────────────── */
.of-modal__body {
  padding: var(--of-spacing-6, 24px);
  flex: 1;
  overflow-y: auto;
  color: var(--of-color-text, #111827);
  font-size: 14px;
  line-height: 1.6;
}

/* ── Footer ───────────────────────────────────────────────── */
.of-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--of-spacing-3, 12px);
  padding: var(--of-spacing-4, 16px) var(--of-spacing-6, 24px);
  border-top: 1px solid var(--of-color-gray-200, #e5e7eb);
  flex-shrink: 0;
}

/* ── Transitions ──────────────────────────────────────────── */
.of-modal-enter-active,
.of-modal-leave-active {
  transition: opacity 0.2s ease;
}

.of-modal-enter-active .of-modal,
.of-modal-leave-active .of-modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.of-modal-enter-from,
.of-modal-leave-to {
  opacity: 0;
}

.of-modal-enter-from .of-modal,
.of-modal-leave-to .of-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
