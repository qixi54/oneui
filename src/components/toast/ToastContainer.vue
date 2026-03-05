<script setup lang="ts">
import { useToast } from "../../composables/useToast";
import ToastItem from "./ToastItem.vue";

/**
 * ToastContainer - Toast 容器组件
 *
 * 通过 Teleport 挂载到 body，固定在右上角。
 * 在应用根组件中挂载一次即可：
 *
 * @example
 * ```vue
 * <ToastContainer />
 * ```
 */

const { toasts, remove } = useToast();
</script>

<template>
  <Teleport to="body">
    <div class="of-toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="of-toast" tag="div" class="of-toast-list">
        <ToastItem
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @close="remove(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
/* 注意：不使用 scoped，因为 Teleport 后 scoped 属性不会跟随 */
.of-toast-container {
  position: fixed !important;
  top: 16px !important;
  right: 16px !important;
  z-index: 9999 !important;
  pointer-events: none !important;
}

.of-toast-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  align-items: flex-end !important;
}

/* 进入动画 */
.of-toast-enter-active {
  transition: all 0.3s ease !important;
}

/* 离开动画 */
.of-toast-leave-active {
  transition: all 0.25s ease !important;
  position: absolute !important;
}

.of-toast-enter-from {
  opacity: 0 !important;
  transform: translateX(100%) !important;
}

.of-toast-leave-to {
  opacity: 0 !important;
  transform: translateX(100%) !important;
}

/* 列表移动动画 */
.of-toast-move {
  transition: transform 0.3s ease !important;
}
</style>
