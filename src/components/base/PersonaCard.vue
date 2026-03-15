<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

export interface PersonaCardProps {
  name: string;
  title?: string;
  icon?: string;
  color?: string;
  subtitle?: string;
  tags?: string[];
  expanded?: boolean;
  active?: boolean;
  done?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
}

defineOptions({ name: "PersonaCard" });

const props = withDefaults(defineProps<PersonaCardProps>(), {
  size: "md",
  expanded: false,
  active: false,
  done: false,
  disabled: false,
});

const emit = defineEmits<{
  "update:expanded": [value: boolean];
  click: [];
}>();

const COLORS = [
  "#f59e0b",
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const accentColor = computed(() => {
  if (props.color) return props.color;
  return COLORS[hashCode(props.name) % COLORS.length];
});

const avatarSize = computed(() => (props.size === "sm" ? 24 : 32));
const avatarFontSize = computed(() => (props.size === "sm" ? 12 : 16));
const nameFontSize = computed(() => (props.size === "sm" ? 12 : 13));
const subtitleFontSize = computed(() => (props.size === "sm" ? 11 : 12));

const displayIcon = computed(() => {
  if (props.icon) return props.icon;
  const n = props.name.trim();
  if (!n) return "?";
  return n.charAt(0);
});

const containerClass = computed(() => [
  "of-persona-card",
  `of-persona-card--${props.size}`,
  {
    "of-persona-card--active": props.active,
    "of-persona-card--done": props.done,
    "of-persona-card--disabled": props.disabled,
    "of-persona-card--expanded": props.expanded,
  },
]);

const containerStyle = computed<CSSProperties>(() => ({
  "--pc-accent": accentColor.value,
  "--pc-accent-bg": accentColor.value + "22",
  "--pc-accent-border": accentColor.value + "55",
  "--pc-accent-tag-bg": accentColor.value + "15",
}));

const avatarStyle = computed<CSSProperties>(() => ({
  width: `${avatarSize.value}px`,
  height: `${avatarSize.value}px`,
  fontSize: `${avatarFontSize.value}px`,
}));

function handleHeaderClick() {
  if (props.disabled) return;
  emit("update:expanded", !props.expanded);
  emit("click");
}
</script>

<template>
  <div :class="containerClass" :style="containerStyle">
    <!-- Header row -->
    <div class="of-persona-card__header" @click="handleHeaderClick">
      <!-- Avatar -->
      <span class="of-persona-card__avatar" :style="avatarStyle">
        {{ displayIcon }}
      </span>

      <!-- Main content -->
      <div class="of-persona-card__body">
        <div class="of-persona-card__name-row">
          <span
            class="of-persona-card__name"
            :style="{ fontSize: `${nameFontSize}px` }"
          >{{ name }}</span>
          <!-- badge slot -->
          <slot name="badge" />
          <span v-if="title" class="of-persona-card__title-badge">
            {{ title }}
          </span>
        </div>

        <span
          v-if="subtitle"
          class="of-persona-card__subtitle"
          :style="{ fontSize: `${subtitleFontSize}px` }"
        >{{ subtitle }}</span>

        <div v-if="tags && tags.length > 0" class="of-persona-card__tags">
          <span
            v-for="tag in tags"
            :key="tag"
            class="of-persona-card__tag"
          >{{ tag }}</span>
        </div>
      </div>

      <!-- Right controls -->
      <div class="of-persona-card__right">
        <!-- actions slot -->
        <slot name="actions" />

        <!-- done indicator -->
        <span v-if="done" class="of-persona-card__done-mark">✓</span>

        <!-- expand chevron (only when default slot is used or always togglable) -->
        <span class="of-persona-card__chevron">
          {{ expanded ? "▲" : "▼" }}
        </span>
      </div>
    </div>

    <!-- Expanded detail area -->
    <div v-if="expanded" class="of-persona-card__detail">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* ── Container ───────────────────────────────────────────── */
.of-persona-card {
  display: flex !important;
  flex-direction: column !important;
  background: var(--of-color-bg-primary, #fff) !important;
  border: 1px solid var(--of-color-border, #e5e7eb) !important;
  border-radius: 10px !important;
  padding: 12px 14px !important;
  box-sizing: border-box !important;
  transition:
    border-color 0.2s,
    box-shadow 0.2s !important;
  cursor: pointer !important;
  user-select: none !important;
  position: relative !important;
}

.of-persona-card:hover:not(.of-persona-card--disabled) {
  border-color: var(--of-color-border-hover, #d1d5db) !important;
  box-shadow: var(--of-shadow-card) !important;
}

/* ── Size modifier ───────────────────────────────────────── */
.of-persona-card--sm {
  padding: 8px 10px !important;
  border-radius: 8px !important;
}

/* ── Active state ────────────────────────────────────────── */
.of-persona-card--active {
  border-color: var(--pc-accent) !important;
  animation: of-persona-pulse 2s ease-in-out infinite !important;
}

@keyframes of-persona-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent !important;
  }
  50% {
    box-shadow: 0 0 0 3px var(--pc-accent-border) !important;
  }
}

/* ── Done state ──────────────────────────────────────────── */
.of-persona-card--done {
  border-color: var(--of-badge-green-border) !important;
}

/* ── Disabled state ──────────────────────────────────────── */
.of-persona-card--disabled {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

/* ── Expanded state ──────────────────────────────────────── */
.of-persona-card--expanded {
  border-color: var(--pc-accent) !important;
}

/* ── Header row ──────────────────────────────────────────── */
.of-persona-card__header {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 10px !important;
  width: 100% !important;
  min-width: 0 !important;
}

/* ── Avatar ──────────────────────────────────────────────── */
.of-persona-card__avatar {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  border-radius: 8px !important;
  background: var(--pc-accent-bg) !important;
  border: 1.5px solid var(--pc-accent-border) !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
}

/* ── Body ────────────────────────────────────────────────── */
.of-persona-card__body {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  flex: 1 !important;
  min-width: 0 !important;
}

.of-persona-card__name-row {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 5px !important;
  min-width: 0 !important;
}

.of-persona-card__name {
  font-weight: 600 !important;
  color: var(--of-color-text-primary) !important;
  line-height: 1.3 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  flex-shrink: 1 !important;
  min-width: 0 !important;
}

.of-persona-card__title-badge {
  display: inline-block !important;
  flex-shrink: 0 !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  color: var(--pc-accent) !important;
  background: var(--pc-accent-bg) !important;
  border: 1px solid var(--pc-accent-border) !important;
  border-radius: 999px !important;
  padding: 1px 6px !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
}

.of-persona-card__subtitle {
  color: var(--pc-accent) !important;
  line-height: 1.3 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* ── Tags ────────────────────────────────────────────────── */
.of-persona-card__tags {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  gap: 3px !important;
  margin-top: 1px !important;
}

.of-persona-card__tag {
  display: inline-block !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  color: var(--pc-accent) !important;
  background: var(--pc-accent-tag-bg) !important;
  border-radius: 999px !important;
  padding: 1px 6px !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
}

/* ── Right side ──────────────────────────────────────────── */
.of-persona-card__right {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 4px !important;
  flex-shrink: 0 !important;
  margin-left: auto !important;
}

.of-persona-card__done-mark {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 18px !important;
  height: 18px !important;
  border-radius: 50% !important;
  background: var(--of-color-success-light, #dcfce7) !important;
  color: var(--of-badge-green-text) !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  flex-shrink: 0 !important;
}

.of-persona-card__chevron {
  font-size: 9px !important;
  color: var(--of-color-text-tertiary) !important;
  flex-shrink: 0 !important;
  line-height: 1 !important;
  transition: color 0.2s !important;
}

.of-persona-card--active .of-persona-card__chevron,
.of-persona-card--expanded .of-persona-card__chevron {
  color: var(--pc-accent) !important;
}

/* ── Expanded detail ─────────────────────────────────────── */
.of-persona-card__detail {
  border-top: 1px solid var(--of-color-border-light) !important;
  margin-top: 10px !important;
  padding-top: 10px !important;
}
</style>
