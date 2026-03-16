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

type PersonaPalette = {
  accent: string;
  bg: string;
  border: string;
  tagBg: string;
};

const PALETTES: PersonaPalette[] = [
  {
    accent: "var(--of-color-warning)",
    bg: "var(--of-color-warning-light)",
    border: "var(--of-badge-orange-border)",
    tagBg: "var(--of-badge-orange-bg)",
  },
  {
    accent: "var(--of-color-primary-500)",
    bg: "var(--of-color-primary-50)",
    border: "var(--of-color-primary-200)",
    tagBg: "var(--of-color-primary-100)",
  },
  {
    accent: "var(--of-role-pm-text)",
    bg: "var(--of-role-pm-bg)",
    border: "var(--of-badge-red-border)",
    tagBg: "var(--of-badge-red-bg)",
  },
  {
    accent: "var(--of-color-success)",
    bg: "var(--of-color-success-light)",
    border: "var(--of-badge-green-border)",
    tagBg: "var(--of-badge-green-bg)",
  },
  {
    accent: "var(--of-color-info)",
    bg: "var(--of-color-info-light)",
    border: "var(--of-badge-blue-border)",
    tagBg: "var(--of-badge-blue-bg)",
  },
  {
    accent: "var(--of-role-arch-text)",
    bg: "var(--of-role-arch-bg)",
    border: "var(--of-badge-purple-border)",
    tagBg: "var(--of-badge-purple-bg)",
  },
  {
    accent: "var(--of-color-error)",
    bg: "var(--of-color-error-light)",
    border: "var(--of-badge-red-border)",
    tagBg: "var(--of-badge-red-bg)",
  },
  {
    accent: "var(--of-role-fe-text)",
    bg: "var(--of-role-fe-bg)",
    border: "var(--of-badge-green-border)",
    tagBg: "var(--of-badge-green-bg)",
  },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const accentPalette = computed<PersonaPalette>(() => {
  if (props.color) {
    return {
      accent: props.color,
      bg: `color-mix(in srgb, ${props.color} 14%, transparent)`,
      border: `color-mix(in srgb, ${props.color} 32%, transparent)`,
      tagBg: `color-mix(in srgb, ${props.color} 10%, transparent)`,
    };
  }
  return PALETTES[hashCode(props.name) % PALETTES.length];
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
  "--pc-accent": accentPalette.value.accent,
  "--pc-accent-bg": accentPalette.value.bg,
  "--pc-accent-border": accentPalette.value.border,
  "--pc-accent-tag-bg": accentPalette.value.tagBg,
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
  display: flex;
  flex-direction: column;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-border-color);
  border-radius: 10px;
  padding: 12px 14px;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.of-persona-card:hover:not(.of-persona-card--disabled) {
  border-color: var(--of-color-gray-300);
  box-shadow: var(--of-shadow-card);
}

/* ── Size modifier ───────────────────────────────────────── */
.of-persona-card--sm {
  padding: 8px 10px;
  border-radius: 8px;
}

/* ── Active state ────────────────────────────────────────── */
.of-persona-card--active {
  border-color: var(--pc-accent);
  animation: of-persona-pulse 2s ease-in-out infinite;
}

@keyframes of-persona-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    box-shadow: 0 0 0 3px var(--pc-accent-border);
  }
}

/* ── Done state ──────────────────────────────────────────── */
.of-persona-card--done {
  border-color: var(--of-badge-green-border);
}

/* ── Disabled state ──────────────────────────────────────── */
.of-persona-card--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Expanded state ──────────────────────────────────────── */
.of-persona-card--expanded {
  border-color: var(--pc-accent);
}

/* ── Header row ──────────────────────────────────────────── */
.of-persona-card__header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

/* ── Avatar ──────────────────────────────────────────────── */
.of-persona-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--pc-accent-bg);
  border: 1.5px solid var(--pc-accent-border);
  font-weight: 600;
  line-height: 1;
  box-sizing: border-box;
}

/* ── Body ────────────────────────────────────────────────── */
.of-persona-card__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.of-persona-card__name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.of-persona-card__name {
  font-weight: 600;
  color: var(--of-color-text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.of-persona-card__title-badge {
  display: inline-block;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 500;
  color: var(--pc-accent);
  background: var(--pc-accent-bg);
  border: 1px solid var(--pc-accent-border);
  border-radius: 999px;
  padding: 1px 6px;
  line-height: 1.4;
  white-space: nowrap;
}

.of-persona-card__subtitle {
  color: var(--pc-accent);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Tags ────────────────────────────────────────────────── */
.of-persona-card__tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 1px;
}

.of-persona-card__tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 500;
  color: var(--pc-accent);
  background: var(--pc-accent-tag-bg);
  border-radius: 999px;
  padding: 1px 6px;
  line-height: 1.4;
  white-space: nowrap;
}

/* ── Right side ──────────────────────────────────────────── */
.of-persona-card__right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
}

.of-persona-card__done-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--of-color-success-light);
  color: var(--of-badge-green-text);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.of-persona-card__chevron {
  font-size: 9px;
  color: var(--of-color-text-tertiary);
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.2s;
}

.of-persona-card--active .of-persona-card__chevron,
.of-persona-card--expanded .of-persona-card__chevron {
  color: var(--pc-accent);
}

/* ── Expanded detail ─────────────────────────────────────── */
.of-persona-card__detail {
  border-top: 1px solid var(--of-color-border-light);
  margin-top: 10px;
  padding-top: 10px;
}
</style>
