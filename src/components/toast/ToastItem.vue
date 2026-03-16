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
    icon: "var(--of-color-blue-500, #3b82f6)",
    border: "var(--of-color-blue-200, #bfdbfe)",
    borderLeft: "var(--of-color-blue-500, #3b82f6)",
    bg: "var(--of-color-blue-50, #eff6ff)",
  },
  success: {
    icon: "var(--of-color-green-500, #22c55e)",
    border: "var(--of-color-green-200, #bbf7d0)",
    borderLeft: "var(--of-color-green-500, #22c55e)",
    bg: "var(--of-color-green-50, #f0fdf4)",
  },
  warning: {
    icon: "var(--of-color-orange-500, #f97316)",
    border: "var(--of-color-orange-200, #fed7aa)",
    borderLeft: "var(--of-color-orange-500, #f97316)",
    bg: "var(--of-color-orange-50, #fff7ed)",
  },
  error: {
    icon: "var(--of-color-red-500, #ef4444)",
    border: "var(--of-color-red-200, #fecaca)",
    borderLeft: "var(--of-color-red-500, #ef4444)",
    bg: "var(--of-color-red-50, #fef2f2)",
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
  background: var(--of-color-bg-elevated, #ffffff);
  border: 1px solid;
  border-left-width: 4px;
  border-radius: var(--of-radius-md, 8px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
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
  color: var(--of-color-text-primary, #1a1a1a);
}

.of-toast__message {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: var(--of-color-text-secondary, #4b5563);
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
  color: var(--of-color-text-tertiary, #9ca3af);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  margin-top: -2px;
}

.of-toast__close:hover {
  background: var(--of-color-black-alpha-08);
  color: var(--of-color-text-primary, #1a1a1a);
}

.of-toast__close:active {
  background: var(--of-color-black-alpha-14);
}
</style>
