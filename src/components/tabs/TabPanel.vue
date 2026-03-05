<script setup lang="ts">
import { inject, computed } from "vue";
import type { Ref } from "vue";

/**
 * TabPanel 组件 - Tab 内容面板
 *
 * 必须嵌套在 Tabs 组件内部使用，通过 inject 获取当前激活的 tab。
 *
 * @example
 * <Tabs v-model="active" :tabs="tabs">
 *   <TabPanel name="tab1">面板1的内容</TabPanel>
 *   <TabPanel name="tab2" :keep-alive="true">面板2（保留DOM）</TabPanel>
 * </Tabs>
 */

const props = defineProps<{
  /** 对应 TabItem.key，用于匹配激活状态 */
  name: string;
  /**
   * 是否保留 DOM
   * - false（默认）：切换时销毁组件，节省内存
   * - true：保留 DOM，切换时仅隐藏，适合有状态组件
   */
  keepAlive?: boolean;
}>();

// inject 来自父级 Tabs 的激活状态
const activeTab = inject<Ref<string>>("of-tabs-active");

const isActive = computed<boolean>(() => activeTab?.value === props.name);
</script>

<template>
  <!--
    keepAlive=false: 不激活时完全不渲染（v-if 控制）
    keepAlive=true:  始终渲染，但不激活时通过 v-show 隐藏
  -->
  <div
    v-if="keepAlive ? true : isActive"
    v-show="keepAlive ? isActive : true"
    class="of-tab-panel"
    role="tabpanel"
    :id="`of-panel-${name}`"
    :aria-labelledby="`of-tab-${name}`"
    :hidden="keepAlive && !isActive ? true : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.of-tab-panel {
  width: 100% !important;
  box-sizing: border-box !important;
}
</style>
