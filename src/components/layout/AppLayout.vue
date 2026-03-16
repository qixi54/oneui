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
</style>
