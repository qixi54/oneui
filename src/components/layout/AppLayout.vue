<script setup lang="ts">
// AppLayout — 整体三层应用布局
// slots: #navbar, #sidebar, #default (主内容), #statusbar
import { ref, computed, provide, onBeforeUnmount } from "vue";
import { useBreakpoint } from "@/composables/useBreakpoint";
import { useFocusTrap } from "@/composables/useFocusTrap";
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
provide(
  "density",
  computed(() => props.density),
);

// 移动端 Drawer 展开状态
const sidebarOpen = ref(false);

// ── Focus Trap（移动端导航抽屉）─────────────────────────────
const {
  containerRef: drawerNavRef,
  activate: activateNavTrap,
  deactivate: deactivateNavTrap,
} = useFocusTrap();
// ─────────────────────────────────────────────────────────────

function toggleSidebar() {
  const opening = !sidebarOpen.value;
  sidebarOpen.value = opening;
  if (opening) {
    activateNavTrap();
    document.addEventListener("keydown", onNavEscape);
  } else {
    deactivateNavTrap();
    document.removeEventListener("keydown", onNavEscape);
  }
}

function closeSidebar() {
  sidebarOpen.value = false;
  deactivateNavTrap();
  document.removeEventListener("keydown", onNavEscape);
}

function onNavEscape(e: KeyboardEvent) {
  if (e.key === "Escape") closeSidebar();
}

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onNavEscape);
});
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
        :aria-expanded="sidebarOpen"
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
        <div
          v-if="sidebarOpen"
          class="of-drawer-overlay"
          aria-hidden="true"
          @click="closeSidebar"
        />
        <!-- Drawer 侧边栏 -->
        <aside
          ref="drawerNavRef"
          class="of-drawer-sidebar"
          :class="{ 'of-drawer-sidebar--open': sidebarOpen }"
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
        >
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
  background: var(--of-surface-canvas);
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
  font-size: var(--of-font-size-xl);
  color: var(--of-text-secondary);
  flex-shrink: 0;
  transition: var(--of-transition-fast);
}
.of-app-layout__hamburger:hover {
  background: var(--of-surface-muted);
}

.of-app-layout__hamburger:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

/* 移动端 Drawer 侧边栏 */
.of-drawer-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--of-z-navbar);
  transform: translateX(-100%);
  transition: var(--of-transition-slow);
}
.of-drawer-sidebar.of-drawer-sidebar--open {
  transform: translateX(0);
}

/* 移动端 Drawer 遮罩层 */
.of-drawer-overlay {
  position: fixed;
  inset: 0;
  background: var(--of-surface-overlay);
  z-index: var(--of-z-sidebar);
}

/* ── Density: compact ── */
.of-density-compact {
  --of-navbar-height: var(--of-navbar-height-compact);
  --of-sidebar-width: var(--of-sidebar-width-compact);
}
</style>
