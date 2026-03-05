import { reactive } from "vue";

/**
 * Toast 通知类型
 */
export type ToastType = "info" | "success" | "warning" | "error";

/**
 * Toast 数据项接口
 */
export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  /** 持续时间（毫秒），0 表示不自动关闭 */
  duration?: number;
  title?: string;
}

/**
 * useToast 配置项
 */
export interface UseToastOptions {
  /** 持续时间（毫秒），默认 3000，0 表示不自动关闭 */
  duration?: number;
  title?: string;
}

// 全局单例 store
const toasts = reactive<ToastItem[]>([]);
let idCounter = 0;

/**
 * 添加一个 Toast
 */
function add(type: ToastType, message: string, options?: UseToastOptions): string {
  const id = `toast-${Date.now()}-${idCounter++}`;
  const toast: ToastItem = {
    id,
    type,
    message,
    title: options?.title,
    duration: options?.duration ?? 3000,
  };
  toasts.push(toast);

  if (toast.duration && toast.duration > 0) {
    setTimeout(() => remove(id), toast.duration);
  }

  return id;
}

/**
 * 移除指定 id 的 Toast
 */
function remove(id: string) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx !== -1) toasts.splice(idx, 1);
}

/**
 * useToast composable
 *
 * 全局单例模式，所有调用共享同一个 toast 列表。
 *
 * @example
 * ```ts
 * const toast = useToast()
 * toast.success('操作成功')
 * toast.error('操作失败', { title: '错误', duration: 5000 })
 * toast.info('提示信息', { duration: 0 }) // 不自动关闭
 * ```
 */
export function useToast() {
  return {
    /** 响应式 toast 列表 */
    toasts,
    /** 显示 info 类型通知 */
    info: (message: string, options?: UseToastOptions) => add("info", message, options),
    /** 显示 success 类型通知 */
    success: (message: string, options?: UseToastOptions) => add("success", message, options),
    /** 显示 warning 类型通知 */
    warning: (message: string, options?: UseToastOptions) => add("warning", message, options),
    /** 显示 error 类型通知 */
    error: (message: string, options?: UseToastOptions) => add("error", message, options),
    /** 移除指定 id 的 toast */
    remove,
    /** 清除所有 toast */
    clear: () => toasts.splice(0, toasts.length),
  };
}
