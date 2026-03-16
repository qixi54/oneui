<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";

/**
 * MermaidChart 组件 - Mermaid 图表渲染
 *
 * 注意：需要在页面中引入 mermaid.js 或安装 mermaid 依赖
 * CDN: <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"><\/script>
 * NPM: npm install mermaid
 *
 * @example
 * <MermaidChart
 *   :code="'graph TD\n  A --> B'"
 *   theme="default"
 *   width="100%"
 * />
 */

const props = defineProps<{
  /** Mermaid 图表代码 */
  code: string;
  /** 图表主题，默认 'default' */
  theme?: "default" | "dark" | "neutral" | "forest";
  /** 容器宽度，默认 '100%' */
  width?: string;
}>();

// 全局唯一 id 计数器，避免同页面多实例冲突
let globalCounter = 0;
const chartId = `of-mermaid-${Date.now()}-${globalCounter++}`;

const containerRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const errorMsg = ref("");

async function renderChart() {
  if (!props.code?.trim()) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMsg.value = "";

  try {
    // 优先用全局 window.mermaid（CDN），否则动态 import（npm 安装方式）
    let mermaid: any = (window as any).mermaid;
    if (!mermaid) {
      const mod = await import("mermaid");
      mermaid = mod.default;
    }

    mermaid.initialize({
      startOnLoad: false,
      theme: props.theme || "default",
      securityLevel: "loose",
    });

    await nextTick();

    const { svg } = await mermaid.render(chartId, props.code);

    if (containerRef.value) {
      containerRef.value.innerHTML = svg;
    }
  } catch (e: any) {
    errorMsg.value = e?.message || "图表渲染失败，请检查 Mermaid 语法";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => renderChart());
watch(
  () => [props.code, props.theme],
  () => renderChart(),
);
</script>

<template>
  <div class="of-mermaid" :style="{ width: props.width || '100%' }">
    <!-- 加载中状态 -->
    <div v-if="isLoading" class="of-mermaid__loading">
      <slot name="loading">
        <span class="of-mermaid__spinner" aria-hidden="true" />
        <span class="of-mermaid__loading-text">图表加载中...</span>
      </slot>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="of-mermaid__error">
      <slot name="error" :message="errorMsg">
        <span class="of-mermaid__error-icon" aria-hidden="true">!</span>
        <span class="of-mermaid__error-text">{{ errorMsg }}</span>
      </slot>
    </div>

    <!-- 图表容器（正常渲染时） -->
    <div v-else ref="containerRef" class="of-mermaid__container" />
  </div>
</template>

<style scoped>
/* 根容器 */
.of-mermaid {
  box-sizing: border-box;
  display: block;
  font-family: inherit;
}

/* 图表内容区域 */
.of-mermaid__container {
  width: 100%;
  overflow-x: auto;
  padding: var(--of-spacing-4, 16px);
  background: var(--of-color-bg-canvas, #ffffff);
  border: 1px solid var(--of-color-gray-100, #f0f0f0);
  border-radius: var(--of-radius-lg, 8px);
  box-sizing: border-box;
  min-height: 60px;
  text-align: center;
}

/* 让 mermaid 生成的 svg 自适应宽度 */
.of-mermaid__container :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* 加载状态 */
.of-mermaid__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--of-spacing-2, 8px);
  padding: var(--of-spacing-4, 16px);
  background: var(--of-color-bg-canvas, #ffffff);
  border: 1px solid var(--of-color-gray-100, #f0f0f0);
  border-radius: var(--of-radius-lg, 8px);
  min-height: 60px;
  box-sizing: border-box;
}

.of-mermaid__loading-text {
  font-size: 13px;
  color: var(--of-color-text-secondary, #8c8c8c);
}

/* Spinner 动画 */
.of-mermaid__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--of-color-gray-200, #e8e8e8);
  border-top-color: var(--of-color-primary, #6366f1);
  border-radius: 50%;
  animation: of-mermaid-spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes of-mermaid-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.of-mermaid__error {
  display: flex;
  align-items: flex-start;
  gap: var(--of-spacing-2, 8px);
  padding: var(--of-spacing-3, 12px) var(--of-spacing-4, 16px);
  background: var(--of-color-red-50, #fff2f0);
  border: 1px solid var(--of-color-red-200, #ffccc7);
  border-radius: var(--of-radius-lg, 8px);
  box-sizing: border-box;
  min-height: 60px;
}

.of-mermaid__error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--of-color-red-500, #dc2626);
  color: var(--of-color-text-inverse);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.of-mermaid__error-text {
  font-size: 13px;
  color: var(--of-color-red-600, #dc2626);
  line-height: 1.5;
  word-break: break-all;
}
</style>
