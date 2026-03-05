<script setup lang="ts">
// AppLayout — 整体三层应用布局
// slots: #navbar, #sidebar, #default (主内容), #statusbar
</script>

<template>
  <div class="of-app-layout">
    <!-- 顶部导航栏 -->
    <header class="of-app-layout__navbar">
      <slot name="navbar" />
    </header>

    <!-- 中间内容区：侧边栏 + 主内容 -->
    <div class="of-app-layout__body">
      <aside class="of-app-layout__sidebar">
        <slot name="sidebar" />
      </aside>
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
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  overflow: hidden !important;
  background: var(--of-color-bg-canvas) !important;
}

.of-app-layout__navbar {
  height: var(--of-navbar-height) !important;
  flex-shrink: 0 !important;
}

.of-app-layout__body {
  display: flex !important;
  flex-direction: row !important;
  flex: 1 !important;
  min-height: 0 !important;
  height: calc(100vh - var(--of-navbar-height) - var(--of-statusbar-height)) !important;
  overflow: hidden !important;
}

.of-app-layout__sidebar {
  flex-shrink: 0 !important;
  height: 100% !important;
  overflow: hidden !important;
}

.of-app-layout__main {
  flex: 1 !important;
  min-width: 0 !important;
  height: 100% !important;
  overflow: auto !important;
}

.of-app-layout__statusbar {
  height: var(--of-statusbar-height) !important;
  flex-shrink: 0 !important;
}
</style>
