<script setup lang="ts">
import { computed } from "vue";
import { X, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-vue-next";
import type { ToastItem } from "../../composables/useToast";

/**
 * ToastItem - 单个 Toast 通知项组件
 *
 * @prop toast - Toast 数据对象
 * @emit close - 点击关闭按钮时触发
 */
const props = defineProps<{ toast: ToastItem }>();
const emit = defineEmits<{ close: [] }>();

/** 图标映射 */
const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

/** 颜色映射（CSS 自定义属性） */
const colorMap = {
  info: {
    icon: "var(--of-color-info, var(--of-accent-default, #334155))",
    border: "var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb))",
    borderLeft: "var(--of-color-info, var(--of-accent-default, #334155))",
    bg: "var(--of-surface-panel, var(--of-color-bg-elevated, #ffffff))",
  },
  success: {
    icon: "var(--of-color-success, var(--of-accent-default, #334155))",
    border: "var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb))",
    borderLeft: "var(--of-color-success, var(--of-accent-default, #334155))",
    bg: "var(--of-surface-panel, var(--of-color-bg-elevated, #ffffff))",
  },
  warning: {
    icon: "var(--of-color-warning, var(--of-accent-default, #334155))",
    border: "var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb))",
    borderLeft: "var(--of-color-warning, var(--of-accent-default, #334155))",
    bg: "var(--of-surface-panel, var(--of-color-bg-elevated, #ffffff))",
  },
  error: {
    icon: "var(--of-color-error, var(--of-accent-default, #334155))",
    border: "var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb))",
    borderLeft: "var(--of-color-error, var(--of-accent-default, #334155))",
    bg: "var(--of-surface-panel, var(--of-color-bg-elevated, #ffffff))",
  },
};

const currentIcon = computed(() => iconMap[props.toast.type]);
const currentColor = computed(() => colorMap[props.toast.type]);
const ariaRole = computed(() => (props.toast.type === "error" ? "alertdialog" : "alert"));
</script>

<template>
  <div
    class="of-toast"
    :class="`of-toast--${toast.type}`"
    :style="{
      borderColor: currentColor.border,
      borderLeftColor: currentColor.borderLeft,
      backgroundColor: currentColor.bg,
    }"
    :role="ariaRole"
    :aria-label="`${toast.type}: ${toast.message}`"
  >
    <!-- 图标 -->
    <div class="of-toast__icon">
      <component :is="currentIcon" :size="20" :color="currentColor.icon" aria-hidden="true" />
    </div>

    <!-- 内容区域 -->
    <div class="of-toast__content">
      <p v-if="toast.title" class="of-toast__title">{{ toast.title }}</p>
      <p class="of-toast__message">{{ toast.message }}</p>
    </div>

    <!-- 关闭按钮 -->
    <button class="of-toast__close" type="button" aria-label="关闭通知" @click="emit('close')">
      <X :size="16" />
    </button>
  </div>
</template>

<style scoped>
.of-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 360px;
  min-width: 280px;
  padding: 12px 16px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #ffffff));
  border: 1px solid;
  border-left-width: 4px;
  border-radius: var(--of-radius-lg, 8px);
  box-shadow: var(--of-shadow-toast);
  word-break: break-word;
}

.of-toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.of-toast__content {
  flex: 1;
  min-width: 0;
}

.of-toast__title {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--of-text-primary, var(--of-color-text-primary, #1a1a1a));
}

.of-toast__message {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #4b5563));
}

.of-toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--of-radius-sm, 4px);
  background: transparent;
  color: var(--of-text-tertiary, var(--of-color-text-tertiary, #9ca3af));
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  margin-top: -2px;
}

.of-toast__close:hover {
  background: var(--of-surface-muted, var(--of-color-black-alpha-08));
  color: var(--of-text-primary, var(--of-color-text-primary, #1a1a1a));
}

.of-toast__close:active {
  background: var(--of-surface-selected, var(--of-color-black-alpha-14));
}
</style>
