<script setup lang="ts">
import { watch, onBeforeUnmount } from "vue";
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
      document.addEventListener("keydown", onKeydown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
    }
  },
);

onBeforeUnmount(() => {
  if (typeof document === "undefined") return; // SSR 守卫
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKeydown);
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
  position: fixed !important;
  inset: 0 !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: var(--of-spacing-8, 32px) var(--of-spacing-4, 16px) !important;
  background: rgba(0, 0, 0, 0.5) !important;
  overflow-y: auto !important;
}

/* ── Modal container ──────────────────────────────────────── */
.of-modal {
  position: relative !important;
  background: var(--of-color-bg-elevated, #ffffff) !important;
  border-radius: var(--of-radius-lg, 12px) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.16),
    0 2px 8px rgba(0, 0, 0, 0.08) !important;
  max-height: 85vh !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
}

.of-modal--centered {
  margin: auto !important;
}

/* ── Header ───────────────────────────────────────────────── */
.of-modal__header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: var(--of-spacing-4, 16px) var(--of-spacing-6, 24px) !important;
  border-bottom: 1px solid var(--of-color-gray-200, #e5e7eb) !important;
  flex-shrink: 0 !important;
  gap: var(--of-spacing-3, 12px) !important;
}

.of-modal__title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: var(--of-color-text, #111827) !important;
  margin: 0 !important;
  line-height: 1.4 !important;
  flex: 1 !important;
}

.of-modal__title-placeholder {
  flex: 1 !important;
}

.of-modal__close {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: var(--of-radius-md, 6px) !important;
  color: var(--of-color-text-secondary, #6b7280) !important;
  cursor: pointer !important;
  transition: var(--of-transition-fast, all 0.15s ease) !important;
  flex-shrink: 0 !important;
}

.of-modal__close:hover {
  background: var(--of-color-gray-100, #f3f4f6) !important;
  color: var(--of-color-text, #111827) !important;
}

.of-modal__close:active {
  background: var(--of-color-gray-200, #e5e7eb) !important;
}

/* ── Body ─────────────────────────────────────────────────── */
.of-modal__body {
  padding: var(--of-spacing-6, 24px) !important;
  flex: 1 !important;
  overflow-y: auto !important;
  color: var(--of-color-text, #111827) !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

/* ── Footer ───────────────────────────────────────────────── */
.of-modal__footer {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: var(--of-spacing-3, 12px) !important;
  padding: var(--of-spacing-4, 16px) var(--of-spacing-6, 24px) !important;
  border-top: 1px solid var(--of-color-gray-200, #e5e7eb) !important;
  flex-shrink: 0 !important;
}

/* ── Transitions ──────────────────────────────────────────── */
.of-modal-enter-active,
.of-modal-leave-active {
  transition: opacity 0.2s ease !important;
}

.of-modal-enter-active .of-modal,
.of-modal-leave-active .of-modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease !important;
}

.of-modal-enter-from,
.of-modal-leave-to {
  opacity: 0 !important;
}

.of-modal-enter-from .of-modal,
.of-modal-leave-to .of-modal {
  transform: scale(0.95) !important;
  opacity: 0 !important;
}
</style>
