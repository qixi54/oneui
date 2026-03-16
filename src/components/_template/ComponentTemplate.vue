<!--
 * OneUI 组件模板 — 新建组件时从此文件复制并重命名
 *
 * 强制规范（来自历史 issue 修复经验）：
 * ① attrs 透传：defineOptions({ inheritAttrs: false }) + 根元素 v-bind="$attrs"
 * ② optional bool prop 必须用 withDefaults，不能漏默认值
 * ③ icon 必须接受 Component 类型，不能接受 string
 * ④ 色值必须用 var(--of-color-*)，禁止 rgba()/rgb()/#hex 字面量
 * ⑤ 交互元素必须有 ARIA 属性（role / aria-label / aria-expanded 等）
-->
<script setup lang="ts">
// @ts-ignore -- 模板文件，Component 类型供复制后使用
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Component } from "vue"
// import { resolveIcon } from "../../utils/icon"  // 如需渲染图标取消注释

// ① 禁止 Vue 自动合并 attrs，由组件显式控制落点
defineOptions({ inheritAttrs: false })

// ② 所有 optional prop 必须用 withDefaults —— 不允许裸 defineProps
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    // --- 示例 props（根据组件需求替换）---
    // visible?: boolean        // ← 布尔 prop 必须给默认值
    // icon?: string | Component // ← 图标接受 Component 对象或 lucide icon 名
    // size?: "sm" | "md" | "lg"
  }>(),
  {
    // visible: true,           // ← 对应上方每个 optional prop
    // size: "md",
  },
)

// const emit = defineEmits<{
//   (e: "change", value: string): void
//   (e: "update:modelValue", value: boolean): void
// }>()
</script>

<template>
  <!--
    ① 根元素必须 v-bind="$attrs"（透传 class/style/data-*/aria-*）
    ⑤ 根元素或关键子元素添加语义 ARIA：role / aria-label / aria-expanded 等
  -->
  <div
    class="of-component-name"
    v-bind="$attrs"
    role="region"
    aria-label="组件名称"
  >
    <!-- 组件内容 -->
  </div>
</template>

<style scoped>
/*
 * ④ 色值规范：
 *   ✅ color: var(--of-color-text);
 *   ✅ background: var(--of-color-bg-canvas);
 *   ❌ color: #1f2937;           禁止 hex 字面量
 *   ❌ background: rgba(0,0,0,0.5); 禁止 rgba 字面量 → 用 var(--of-color-black-alpha-50)
 */
.of-component-name {
  color: var(--of-color-text);
}
</style>
