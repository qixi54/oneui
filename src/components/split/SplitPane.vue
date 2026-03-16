<script setup lang="ts">
import { ref, onUnmounted } from "vue";

/**
 * SplitPane 组件 - 可拖拽分栏布局
 *
 * @example
 * <SplitPane direction="horizontal" :default-size="30">
 *   <template #first>左侧内容</template>
 *   <template #second>右侧内容</template>
 * </SplitPane>
 */

const props = defineProps<{
  /** 分割方向，horizontal 为左右分栏，vertical 为上下分栏 */
  direction?: "horizontal" | "vertical";
  /** 第一个面板的初始比例（0-100），默认 50 */
  defaultSize?: number;
  /** 最小尺寸百分比，默认 10 */
  minSize?: number;
  /** 最大尺寸百分比，默认 90 */
  maxSize?: number;
}>();

const size = ref(props.defaultSize ?? 50);
const isDragging = ref(false);
const containerRef = ref<HTMLElement | null>(null);

function onDividerMousedown(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  isDragging.value = true;
  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("mouseup", onMouseup);
  document.addEventListener("touchmove", onTouchmove, { passive: false });
  document.addEventListener("touchend", onMouseup);
}

function onMousemove(e: MouseEvent) {
  if (!isDragging.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const isHorizontal = (props.direction || "horizontal") === "horizontal";

  let newSize: number;
  if (isHorizontal) {
    newSize = ((e.clientX - rect.left) / rect.width) * 100;
  } else {
    newSize = ((e.clientY - rect.top) / rect.height) * 100;
  }

  const min = props.minSize ?? 10;
  const max = props.maxSize ?? 90;
  size.value = Math.min(max, Math.max(min, newSize));
}

function onTouchmove(e: TouchEvent) {
  if (!isDragging.value || !containerRef.value) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = containerRef.value.getBoundingClientRect();
  const isHorizontal = (props.direction || "horizontal") === "horizontal";

  let newSize: number;
  if (isHorizontal) {
    newSize = ((touch.clientX - rect.left) / rect.width) * 100;
  } else {
    newSize = ((touch.clientY - rect.top) / rect.height) * 100;
  }

  const min = props.minSize ?? 10;
  const max = props.maxSize ?? 90;
  size.value = Math.min(max, Math.max(min, newSize));
}

function onMouseup() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onMousemove);
  document.removeEventListener("mouseup", onMouseup);
  document.removeEventListener("touchmove", onTouchmove);
  document.removeEventListener("touchend", onMouseup);
}

onUnmounted(() => {
  document.removeEventListener("mousemove", onMousemove);
  document.removeEventListener("mouseup", onMouseup);
  document.removeEventListener("touchmove", onTouchmove);
  document.removeEventListener("touchend", onMouseup);
});
</script>

<template>
  <div
    ref="containerRef"
    class="of-split-pane"
    :class="[
      `of-split-pane--${direction || 'horizontal'}`,
      { 'of-split-pane--dragging': isDragging },
    ]"
  >
    <div
      class="of-split-pane__first"
      :style="
        (direction || 'horizontal') === 'vertical' ? { height: size + '%' } : { width: size + '%' }
      "
    >
      <slot name="first" />
    </div>
    <div
      class="of-split-pane__divider"
      @mousedown="onDividerMousedown"
      @touchstart.prevent="onDividerMousedown"
    >
      <div class="of-split-pane__divider-inner" />
    </div>
    <div class="of-split-pane__second">
      <slot name="second" />
    </div>
  </div>
</template>

<style scoped>
.of-split-pane {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* 水平方向：左右分栏 */
.of-split-pane--horizontal {
  flex-direction: row;
}

/* 垂直方向：上下分栏 */
.of-split-pane--vertical {
  flex-direction: column;
}

/* 第一个面板 */
.of-split-pane__first {
  flex-shrink: 0;
  flex-grow: 0;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
}

/* 第二个面板 */
.of-split-pane__second {
  flex: 1 1 0;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  min-width: 0;
  min-height: 0;
}

/* 分隔条容器 */
.of-split-pane__divider {
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
  background-color: var(--of-color-gray-200, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
  z-index: 10;
  touch-action: none;
}

/* 扩大移动端热区 */
.of-split-pane__divider::after {
  content: "";
  position: absolute;
  inset: -8px;
}

.of-split-pane--horizontal > .of-split-pane__divider {
  width: 5px;
  height: 100%;
  cursor: col-resize;
}

.of-split-pane--vertical > .of-split-pane__divider {
  width: 100%;
  height: 5px;
  cursor: row-resize;
}

.of-split-pane__divider:hover {
  background-color: var(--of-color-gray-400, #9ca3af);
}

/* 分隔条中间的指示线/点 */
.of-split-pane__divider-inner {
  background-color: var(--of-color-gray-400, #9ca3af);
  border-radius: var(--of-radius-full, 9999px);
  opacity: 0.6;
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;
  pointer-events: none;
}

.of-split-pane--horizontal > .of-split-pane__divider > .of-split-pane__divider-inner {
  width: 2px;
  height: 32px;
}

.of-split-pane--vertical > .of-split-pane__divider > .of-split-pane__divider-inner {
  width: 32px;
  height: 2px;
}

.of-split-pane__divider:hover > .of-split-pane__divider-inner {
  opacity: 1;
  background-color: var(--of-color-gray-600, #4b5563);
}

/* 拖拽中状态 */
.of-split-pane--dragging > .of-split-pane__divider {
  background-color: var(--of-color-primary, #6366f1);
}

.of-split-pane--dragging > .of-split-pane__divider > .of-split-pane__divider-inner {
  opacity: 1;
  background-color: var(--of-color-primary-foreground, #ffffff);
}

/* 拖拽时禁用文本选中 */
.of-split-pane--dragging * {
  user-select: none;
}
</style>

<style>
/* 拖拽时修改全局 body cursor */
body:has(.of-split-pane--horizontal.of-split-pane--dragging) {
  cursor: col-resize;
}

body:has(.of-split-pane--vertical.of-split-pane--dragging) {
  cursor: row-resize;
}
</style>
