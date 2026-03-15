<script setup lang="ts">
import { computed } from "vue";
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
  <nav class="of-navbar">
    <!-- 左侧 Logo 区域 -->
    <div class="of-navbar__left">
      <slot name="logo">
        <span class="of-navbar__logo-default">OneFlow</span>
      </slot>
    </div>

    <!-- 中间搜索框 -->
    <div class="of-navbar__center">
      <div class="of-navbar__search">
        <SearchIcon class="of-navbar__search-icon" :size="14" />
        <input
          class="of-navbar__search-input"
          type="text"
          :placeholder="searchPlaceholder"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 右侧操作区 -->
    <div class="of-navbar__right">
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
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  height: var(--of-navbar-height) !important;
  padding: 0 var(--of-spacing-5) !important;
  gap: var(--of-spacing-4) !important;
  background: var(--of-color-bg-elevated) !important;
  border-bottom: var(--of-border) !important;
  box-sizing: border-box !important;
}

/* ── Left ── */
.of-navbar__left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.of-navbar__logo-default {
  font-family: var(--of-font-sans) !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: var(--of-color-primary-600) !important;
  letter-spacing: -0.02em;
}

/* ── Center ── */
.of-navbar__center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.of-navbar__search {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  width: 280px;
  height: 36px;
  padding: 0 var(--of-spacing-3);
  background: var(--of-color-gray-50);
  border: var(--of-border);
  border-radius: var(--of-radius-lg);
  box-sizing: border-box;
  transition: var(--of-transition-fast);
}

.of-navbar__search:focus-within {
  border-color: var(--of-color-primary-300);
  background: var(--of-color-bg-elevated);
}

.of-navbar__search-icon {
  color: var(--of-color-gray-400) !important;
  flex-shrink: 0;
}

.of-navbar__search-input {
  flex: 1;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  color: var(--of-color-gray-700) !important;
  min-width: 0;
}

.of-navbar__search-input::placeholder {
  color: var(--of-color-gray-400) !important;
}

/* ── Right ── */
.of-navbar__right {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  flex-shrink: 0;
}

.of-navbar__notify-btn {
  position: relative;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 36px !important;
  height: 36px !important;
  background: transparent !important;
  border: var(--of-border) !important;
  border-radius: var(--of-radius-lg) !important;
  cursor: pointer !important;
  transition: var(--of-transition-fast) !important;
}

.of-navbar__notify-btn:hover {
  background: var(--of-color-gray-50) !important;
}

.of-navbar__notify-icon {
  color: var(--of-color-gray-500) !important;
}

.of-navbar__notify-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  background: var(--of-color-error);
  color: var(--of-color-text-inverse);
  font-family: var(--of-font-sans);
  font-size: 9px;
  font-weight: 600;
  line-height: 14px;
  border-radius: var(--of-radius-full);
  text-align: center;
  box-sizing: border-box;
}

.of-navbar__avatar {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  background: var(--of-color-primary-500) !important;
  border: none !important;
  border-radius: var(--of-radius-full) !important;
  cursor: pointer !important;
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--of-color-text-inverse) !important;
  transition: var(--of-transition-fast) !important;
  flex-shrink: 0;
}

.of-navbar__avatar:hover {
  background: var(--of-color-primary-600) !important;
}
</style>
