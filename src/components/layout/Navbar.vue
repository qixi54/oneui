<script setup lang="ts">
import { computed, inject, type ComputedRef } from "vue";
import { SearchIcon, BellIcon } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    username?: string;
    searchPlaceholder?: string;
    notifyCount?: number;
  }>(),
  {
    username: "U",
    searchPlaceholder: "⌘K 搜索...",
    notifyCount: 0,
  },
);
const emit = defineEmits<{
  (e: "search", value: string): void;
  (e: "notify-click"): void;
  (e: "avatar-click"): void;
}>();
const densityRef = inject<ComputedRef<string>>("density");
const density = computed(() => densityRef?.value ?? "comfortable");

const avatarInitial = computed(() =>
  props.username ? props.username.charAt(0).toUpperCase() : "U",
);

function handleSearch(event: Event) {
  emit("search", (event.target as HTMLInputElement).value);
}

function handleNotifyClick() {
  emit("notify-click");
}

function handleAvatarClick() {
  emit("avatar-click");
}
</script>

<template>
  <nav class="of-navbar" :class="{ 'of-navbar--compact': density === 'compact' }">
    <!-- 左侧 Logo 区域 -->
    <div class="of-navbar__left">
      <slot name="logo">
        <span class="of-navbar__logo-default">OneFlow</span>
      </slot>

      <div v-if="$slots['header-left']" class="of-navbar__header of-navbar__header--left">
        <slot name="header-left" />
      </div>
    </div>

    <!-- 中间搜索框 -->
    <div class="of-navbar__center">
      <div class="of-navbar__search">
        <SearchIcon class="of-navbar__search-icon" :size="14" />
        <input
          class="of-navbar__search-input"
          type="text"
          aria-label="搜索"
          :placeholder="searchPlaceholder"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 右侧操作区 -->
    <div class="of-navbar__right">
      <div v-if="$slots['header-right']" class="of-navbar__header of-navbar__header--right">
        <slot name="header-right" />
      </div>

      <!-- 通知按钮 -->
      <button class="of-navbar__notify-btn" @click="handleNotifyClick">
        <BellIcon class="of-navbar__notify-icon" :size="16" />
        <span v-if="notifyCount && notifyCount > 0" class="of-navbar__notify-badge">
          {{ notifyCount > 99 ? "99+" : notifyCount }}
        </span>
      </button>

      <!-- 头像 -->
      <button class="of-navbar__avatar" @click="handleAvatarClick">
        {{ avatarInitial }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.of-navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: var(--of-navbar-height);
  padding: 0 var(--of-spacing-5);
  gap: var(--of-spacing-4);
  background: var(--of-surface-card);
  border-bottom: 1px solid var(--of-border-workspace);
  box-sizing: border-box;
}

/* ── Left ── */
.of-navbar__left {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3);
  flex: 0 1 auto;
  min-width: 0;
}

.of-navbar__logo-default {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-lg);
  font-weight: var(--of-font-weight-bold);
  color: var(--of-accent-strong);
  letter-spacing: -0.02em;
}

/* ── Center ── */
.of-navbar__center {
  flex: 1 0 220px;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.of-navbar__search {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  width: 100%;
  max-width: 280px;
  min-width: 0;
  height: 36px;
  padding: 0 var(--of-spacing-3);
  background: var(--of-surface-panel);
  border: 1px solid var(--of-border-workspace);
  border-radius: var(--of-radius-lg);
  box-sizing: border-box;
  transition: var(--of-transition-fast);
}

.of-navbar__search:focus-within {
  border-color: var(--of-border-strong);
  background: var(--of-surface-card);
}

.of-navbar__search-icon {
  color: var(--of-text-tertiary);
  flex-shrink: 0;
}

.of-navbar__search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary);
  min-width: 0;
}

.of-navbar__search-input::placeholder {
  color: var(--of-text-placeholder);
}

/* ── Right ── */
.of-navbar__right {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3);
  flex: 0 1 auto;
  min-width: 0;
}

.of-navbar__header {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3);
  min-width: 0;
}

.of-navbar__notify-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--of-border-workspace);
  border-radius: var(--of-radius-lg);
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-navbar__notify-btn:hover {
  background: var(--of-surface-muted);
}

.of-navbar__notify-icon {
  color: var(--of-text-secondary);
}

.of-navbar__notify-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 14px;
  height: 14px;
  padding: 0 var(--of-spacing-0_75);
  background: var(--of-accent-strong);
  color: var(--of-text-inverse);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-2xs);
  font-weight: var(--of-font-weight-semibold);
  line-height: 14px;
  border-radius: var(--of-radius-full);
  text-align: center;
  box-sizing: border-box;
}

.of-navbar__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--of-accent-default);
  border: none;
  border-radius: var(--of-radius-full);
  cursor: pointer;
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-inverse);
  transition: var(--of-transition-fast);
  flex-shrink: 0;
}

.of-navbar__avatar:hover {
  background: var(--of-accent-strong);
}

/* ── Density: compact ── */
.of-navbar--compact {
  padding: var(--of-navbar-padding-compact);
}
</style>
