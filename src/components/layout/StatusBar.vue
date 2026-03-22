<script setup lang="ts">
import { CircleCheckIcon, CircleAlertIcon } from "lucide-vue-next";

withDefaults(
  defineProps<{
    synced?: boolean;
    shortcuts?: string;
    version?: string;
  }>(),
  {
    synced: true,
    shortcuts: "",
    version: "v1.0.0",
  },
);
</script>

<template>
  <div class="of-statusbar">
    <!-- 左：同步状态 -->
    <div class="of-statusbar__left">
      <CircleCheckIcon
        v-if="synced"
        class="of-statusbar__sync-icon of-statusbar__sync-icon--ok"
        :size="13"
      />
      <CircleAlertIcon
        v-else
        class="of-statusbar__sync-icon of-statusbar__sync-icon--warn"
        :size="13"
      />
      <span class="of-statusbar__sync-text">
        {{ synced ? "所有更改已同步" : "同步中..." }}
      </span>
    </div>

    <!-- 中：弹性空白 -->
    <div class="of-statusbar__spacer" />

    <!-- 右：快捷键提示 + 版本号 -->
    <div class="of-statusbar__right">
      <span v-if="shortcuts" class="of-statusbar__shortcuts">{{ shortcuts }}</span>
      <span class="of-statusbar__version">{{ version }}</span>
    </div>
  </div>
</template>

<style scoped>
.of-statusbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: var(--of-statusbar-height);
  padding: 0 var(--of-spacing-4);
  gap: var(--of-spacing-4);
  background: var(--of-surface-workspace, var(--of-surface-card));
  border-top: 1px solid var(--of-workspace-border, var(--of-border-workspace));
  box-sizing: border-box;
}

.of-statusbar__left {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.of-statusbar__sync-icon--ok {
  color: var(--of-row-action-text, var(--of-accent-default));
}

.of-statusbar__sync-icon--warn {
  color: var(--of-text-secondary, var(--of-text-tertiary));
}

.of-statusbar__sync-text {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-text-tertiary));
  line-height: 1;
}

.of-statusbar__spacer {
  flex: 1;
}

.of-statusbar__right {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-4);
  flex-shrink: 0;
}

.of-statusbar__shortcuts {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-text-tertiary));
  line-height: 1;
}

.of-statusbar__version {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-text-tertiary));
  line-height: 1;
}
</style>
