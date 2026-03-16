<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

export interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  bg?: string;
  role?: string;
}

defineOptions({ name: "Avatar" });

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 28,
});

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  BE: { color: "var(--of-role-be-text, #4F46E5)", bg: "var(--of-role-be-bg, #EEF2FF)" },
  FE: { color: "var(--of-role-fe-text, #059669)", bg: "var(--of-role-fe-bg, #ECFDF5)" },
  PM: { color: "var(--of-role-pm-text, #db2777)", bg: "var(--of-role-pm-bg, #fce7f3)" },
  DBA: { color: "var(--of-role-dba-text, #c2410c)", bg: "var(--of-role-dba-bg, #fff7ed)" },
  ARCH: { color: "var(--of-role-arch-text, #7C3AED)", bg: "var(--of-role-arch-bg, #F5F3FF)" },
  OPM: { color: "var(--of-role-pm-text, #db2777)", bg: "var(--of-role-pm-bg, #fce7f3)" },
};

const PALETTE = [
  { color: "var(--of-role-be-text, #4F46E5)", bg: "var(--of-role-be-bg, #EEF2FF)" },
  { color: "var(--of-role-fe-text, #059669)", bg: "var(--of-role-fe-bg, #ECFDF5)" },
  { color: "var(--of-role-pm-text, #db2777)", bg: "var(--of-role-pm-bg, #fce7f3)" },
  { color: "var(--of-role-dba-text, #c2410c)", bg: "var(--of-role-dba-bg, #fff7ed)" },
  { color: "var(--of-role-arch-text, #7C3AED)", bg: "var(--of-role-arch-bg, #F5F3FF)" },
  { color: "var(--of-role-pm-text, #db2777)", bg: "var(--of-role-pm-bg, #fce7f3)" },
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
  <span class="one-avatar" :style="avatarStyle">
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
