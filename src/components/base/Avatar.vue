<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

export interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  bg?: string;
  role?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
  color: undefined,
  bg: undefined,
  role: undefined,
  size: 28,
});

defineOptions({ name: "Avatar", inheritAttrs: false });

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  BE: { color: "var(--of-accent-strong)", bg: "var(--of-surface-selected)" },
  FE: { color: "var(--of-text-strong)", bg: "var(--of-surface-panel)" },
  PM: { color: "var(--of-text-primary)", bg: "var(--of-surface-muted)" },
  DBA: { color: "var(--of-accent-default)", bg: "var(--of-surface-elevated)" },
  ARCH: { color: "var(--of-text-secondary)", bg: "var(--of-surface-selected)" },
  OPM: { color: "var(--of-text-primary)", bg: "var(--of-surface-muted)" },
};

const PALETTE = [
  { color: "var(--of-accent-default)", bg: "var(--of-surface-muted)" },
  { color: "var(--of-accent-strong)", bg: "var(--of-surface-panel)" },
  { color: "var(--of-text-primary)", bg: "var(--of-surface-selected)" },
  { color: "var(--of-text-secondary)", bg: "var(--of-surface-elevated)" },
  { color: "var(--of-text-strong)", bg: "var(--of-surface-muted)" },
  { color: "var(--of-accent-default)", bg: "var(--of-surface-panel)" },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const resolvedColors = computed(() => {
  if (props.color && props.bg) {
    return { color: props.color, bg: props.bg };
  }

  const roleKey = props.role?.toUpperCase();
  if (roleKey && ROLE_COLORS[roleKey]) {
    return {
      color: props.color || ROLE_COLORS[roleKey].color,
      bg: props.bg || ROLE_COLORS[roleKey].bg,
    };
  }

  const idx = hashCode(props.name) % PALETTE.length;
  return {
    color: props.color || PALETTE[idx].color,
    bg: props.bg || PALETTE[idx].bg,
  };
});

const displayText = computed(() => {
  if (props.role) {
    return props.role.slice(0, 2).toUpperCase();
  }

  const name = props.name.trim();
  if (!name) return "";

  // Chinese character check: take first character
  if (/[\u4e00-\u9fff]/.test(name.charAt(0))) {
    return name.charAt(0);
  }

  // English: take first 2 uppercase letters
  const letters = name.replace(/[^a-zA-Z]/g, "");
  return letters.slice(0, 2).toUpperCase();
});

const avatarStyle = computed<CSSProperties>(() => {
  const s = props.size;
  const fontSize = Math.round(s * 0.36);
  return {
    "--one-avatar-size": `${s}px`,
    "--one-avatar-bg": resolvedColors.value.bg,
    "--one-avatar-color": resolvedColors.value.color,
    "--one-avatar-font-size": `${fontSize}px`,
  } as CSSProperties;
});
</script>

<template>
  <span class="one-avatar" :style="avatarStyle" v-bind="$attrs">
    {{ displayText }}
  </span>
</template>

<style scoped>
.one-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--one-avatar-size);
  height: var(--one-avatar-size);
  border-radius: 50%;
  background: var(--one-avatar-bg);
  color: var(--one-avatar-color);
  font-size: var(--one-avatar-font-size);
  font-weight: 600;
  font-family: var(--of-font-sans);
  line-height: 1;
  white-space: nowrap;
  box-sizing: border-box;
  user-select: none;
  flex-shrink: 0;
}
</style>
