<script setup lang="ts">
// AppLayout — 整体三层应用布局
// slots: #navbar, #sidebar, #default (主内容), #statusbar
import { ref, provide } from "vue";
import { useBreakpoint } from "@/composables/useBreakpoint";
import type { Density } from "@/types";

const props = withDefaults(
  defineProps<{
    /** 布局密度：comfortable（默认）| compact（紧凑） */
    density?: Density;
  }>(),
  {
    density: "comfortable",
  },
);

const { isMobile, isTablet } = useBreakpoint();

// 向子组件注入移动端状态，Sidebar / Navbar 等可通过 inject("isMobile") 感知
provide("isMobile", isMobile);
provide("isTablet", isTablet);
// 向子组件注入 density，Navbar / Sidebar 可通过 inject("density") 感知
provide("density", props.density);

// 移动端 Drawer 展开状态
const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<template>
  <div class="of-app-layout" :class="{ 'of-density-compact': density === 'compact' }">
    <!-- 顶部导航栏 -->
    <header class="of-app-layout__navbar">
      <!-- 移动端 hamburger 按钮 -->
      <button
        v-if="isMobile"
        class="of-app-layout__hamburger"
        aria-label="Toggle sidebar"
        @click="toggleSidebar"
      >
        &#9776;
      </button>
      <slot name="navbar" />
    </header>

    <!-- 中间内容区：侧边栏 + 主内容 -->
    <div class="of-app-layout__body">
      <!-- 桌面端：正常侧边栏 -->
      <aside v-if="!isMobile" class="of-app-layout__sidebar">
        <slot name="sidebar" />
      </aside>

      <!-- 移动端：Drawer 模式 -->
      <template v-if="isMobile">
        <!-- 遮罩层 -->
        <div v-if="sidebarOpen" class="of-drawer-overlay" @click="closeSidebar" />
        <!-- Drawer 侧边栏 -->
        <aside class="of-drawer-sidebar" :class="{ 'of-drawer-sidebar--open': sidebarOpen }">
          <slot name="sidebar" />
        </aside>
      </template>

      <main class="of-app-layout__main">
        <slot />
      </main>
    </div>

    <!-- 底部状态栏 -->
    <footer class="of-app-layout__statusbar">
      <slot name="statusbar" />
    </footer>
  </div>
</template>

<style scoped>
.of-app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--of-color-bg-canvas);
}

.of-app-layout__navbar {
  height: var(--of-navbar-height);
  flex-shrink: 0;
}

.of-app-layout__body {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  height: calc(100vh - var(--of-navbar-height) - var(--of-statusbar-height));
  overflow: hidden;
}

.of-app-layout__sidebar {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}

.of-app-layout__main {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: auto;
}

.of-app-layout__statusbar {
  height: var(--of-statusbar-height);
  flex-shrink: 0;
}

/* 移动端 hamburger 按钮 */
.of-app-layout__hamburger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--of-radius-md);
  cursor: pointer;
  font-size: 18px;
  color: var(--of-color-gray-600);
  flex-shrink: 0;
  transition: var(--of-transition-fast);
}
.of-app-layout__hamburger:hover {
  background: var(--of-color-gray-100);
}

/* 移动端 Drawer 侧边栏 */
.of-drawer-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.of-drawer-sidebar.of-drawer-sidebar--open {
  transform: translateX(0);
}

/* 移动端 Drawer 遮罩层 */
.of-drawer-overlay {
  position: fixed;
  inset: 0;
  background: var(--of-color-black-alpha-50, rgba(0, 0, 0, 0.5));
  z-index: 199;
}

/* ── Density: compact ── */
.of-density-compact {
  --of-navbar-height: var(--of-navbar-height-compact);
  --of-sidebar-width: var(--of-sidebar-width-compact);
}
</style>
