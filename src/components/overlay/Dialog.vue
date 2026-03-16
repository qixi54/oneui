<script setup lang="ts">
import { computed } from "vue";
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Loader2 } from "lucide-vue-next";
import type { Component } from "vue";
import Modal from "./Modal.vue";

/**
 * Dialog 组件 - 确认/提示对话框
 *
 * 基于 Modal 封装，提供带类型图标的确认/取消交互。
 * 支持 info / warning / danger / success 四种类型。
 *
 * @example
 * <Dialog
 *   v-model="showDialog"
 *   type="danger"
 *   title="删除确认"
 *   content="确定要删除这条记录吗？此操作不可撤销。"
 *   confirm-text="删除"
 *   @confirm="handleDelete"
 * />
 */

const props = withDefaults(
  defineProps<{
    /** v-model 控制显示/隐藏 */
    modelValue: boolean;
    /** 对话框标题，默认 '提示' */
    title?: string;
    /** 正文内容 */
    content?: string;
    /** 确认按钮文字，默认 '确认' */
    confirmText?: string;
    /** 取消按钮文字，默认 '取消' */
    cancelText?: string;
    /** 对话框类型，影响图标和确认按钮颜色 */
    type?: "info" | "warning" | "danger" | "success";
    /** 确认按钮加载状态 */
    loading?: boolean;
    /** 弹窗宽度，默认 '420px' */
    width?: string;
    /** 是否隐藏取消按钮 */
    hideCancel?: boolean;
  }>(),
  {
    title: "提示",
    confirmText: "确认",
    cancelText: "取消",
    type: "info",
    loading: false,
    width: "420px",
    hideCancel: false,
  },
);

const emit = defineEmits<{
  /** 关闭时触发，更新 v-model 绑定值 */
  "update:modelValue": [value: boolean];
  /** 点击确认按钮触发 */
  confirm: [];
  /** 点击取消按钮触发 */
  cancel: [];
}>();

/** 各类型对应的图标组件映射 */
const iconMap: Record<string, Component> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
};

/** 各类型对应的颜色 CSS 类 */
const typeColorClass = computed(() => `of-dialog__icon--${props.type}`);

/** 当前类型的图标组件 */
const currentIcon = computed(() => iconMap[props.type]);

/** 确认按钮的颜色类 */
const confirmBtnClass = computed(() =>
  props.type === "danger" ? "of-dialog__btn--danger" : "of-dialog__btn--primary",
);

function handleClose(val: boolean) {
  emit("update:modelValue", val);
}

function handleConfirm() {
  if (props.loading) return;
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
  emit("update:modelValue", false);
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    :width="width"
    :closable="false"
    :mask-closable="!loading"
    class="of-dialog-modal"
    @update:model-value="handleClose"
  >
    <div class="of-dialog">
      <!-- 图标 -->
      <div class="of-dialog__icon-wrap" :class="typeColorClass">
        <component :is="currentIcon" :size="28" />
      </div>

      <!-- 文本内容 -->
      <div class="of-dialog__content">
        <h3 class="of-dialog__title">{{ title }}</h3>
        <p v-if="content" class="of-dialog__text">{{ content }}</p>
        <!-- 自定义内容插槽 -->
        <slot />
      </div>
    </div>

    <!-- Footer 操作区 -->
    <template #footer>
      <button
        v-if="!hideCancel"
        class="of-dialog__btn of-dialog__btn--cancel"
        :disabled="loading"
        type="button"
        @click="handleCancel"
      >
        {{ cancelText }}
      </button>
      <button
        class="of-dialog__btn"
        :class="confirmBtnClass"
        :disabled="loading"
        type="button"
        @click="handleConfirm"
      >
        <Loader2 v-if="loading" :size="14" class="of-dialog__spinner" />
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
/* ── Dialog body layout ───────────────────────────────────── */
.of-dialog {
  display: flex;
  align-items: flex-start;
  gap: var(--of-spacing-4, 16px);
  padding: var(--of-spacing-2, 8px) 0;
}

/* ── Icon ─────────────────────────────────────────────────── */
.of-dialog__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.of-dialog__icon--info {
  background: var(--of-color-blue-50, #eff6ff);
  color: var(--of-color-blue-500, #3b82f6);
}

.of-dialog__icon--warning {
  background: var(--of-color-yellow-50, #fffbeb);
  color: var(--of-color-yellow-500, #f59e0b);
}

.of-dialog__icon--danger {
  background: var(--of-color-red-50, #fef2f2);
  color: var(--of-color-red-500, #ef4444);
}

.of-dialog__icon--success {
  background: var(--of-color-green-50, #f0fdf4);
  color: var(--of-color-green-500, #22c55e);
}

/* ── Content ──────────────────────────────────────────────── */
.of-dialog__content {
  flex: 1;
  min-width: 0;
}

.of-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--of-color-text, #111827);
  margin: 0 0 var(--of-spacing-2, 8px) 0;
  line-height: 1.4;
}

.of-dialog__text {
  font-size: 14px;
  color: var(--of-color-text-secondary, #6b7280);
  margin: 0;
  line-height: 1.6;
}

/* ── Buttons ──────────────────────────────────────────────── */
.of-dialog__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-2, 8px);
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--of-radius-md, 6px);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--of-transition-fast, all 0.15s ease);
  line-height: 1;
  white-space: nowrap;
}

.of-dialog__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 取消按钮 */
.of-dialog__btn--cancel {
  background: transparent;
  border-color: var(--of-color-gray-300, #d1d5db);
  color: var(--of-color-text-secondary, #6b7280);
}

.of-dialog__btn--cancel:hover:not(:disabled) {
  background: var(--of-color-gray-50, #f9fafb);
  border-color: var(--of-color-gray-400, #9ca3af);
  color: var(--of-color-text, #111827);
}

/* 确认按钮 - 主色 */
.of-dialog__btn--primary {
  background: var(--of-color-primary, #7c3aed);
  border-color: var(--of-color-primary, #7c3aed);
  color: var(--of-color-text-inverse);
}

.of-dialog__btn--primary:hover:not(:disabled) {
  background: var(--of-color-primary-hover, #6d28d9);
  border-color: var(--of-color-primary-hover, #6d28d9);
}

/* 确认按钮 - 危险红色 */
.of-dialog__btn--danger {
  background: var(--of-color-red-600, #dc2626);
  border-color: var(--of-color-red-600, #dc2626);
  color: var(--of-color-text-inverse);
}

.of-dialog__btn--danger:hover:not(:disabled) {
  background: var(--of-color-red-700, #b91c1c);
  border-color: var(--of-color-red-700, #b91c1c);
}

/* ── Spinner ──────────────────────────────────────────────── */
.of-dialog__spinner {
  animation: of-dialog-spin 0.8s linear infinite;
}

@keyframes of-dialog-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
