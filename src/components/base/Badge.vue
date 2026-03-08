<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";

type LooseString<T extends string> = T | (string & {});

export interface BadgeProps {
  color?: LooseString<"default" | "blue" | "green" | "orange" | "red" | "purple" | "gray">;
  priority?: "P0" | "P1" | "P2" | "P3";
  size?: "sm" | "md";
}

interface BadgeTone {
  background: string;
  text: string;
  border: string;
}

const props = withDefaults(defineProps<BadgeProps>(), {
  size: "md",
});

defineSlots<{
  default?: () => VNode[];
}>();

const COLOR_MAP: Record<string, BadgeTone> = {
  default: {
    background: "#fafafa",
    text: "#595959",
    border: "#d9d9d9",
  },
  blue: {
    background: "#e6f4ff",
    text: "#1677ff",
    border: "#91caff",
  },
  green: {
    background: "#f6ffed",
    text: "#389e0d",
    border: "#b7eb8f",
  },
  orange: {
    background: "#fff7e6",
    text: "#d46b08",
    border: "#ffd591",
  },
  red: {
    background: "#fff1f0",
    text: "#cf1322",
    border: "#ffa39e",
  },
  purple: {
    background: "#f9f0ff",
    text: "#722ed1",
    border: "#d3adf7",
  },
  gray: {
    background: "#f5f5f5",
    text: "#666666",
    border: "#e0e0e0",
  },
};

const PRIORITY_MAP: Record<NonNullable<BadgeProps["priority"]>, keyof typeof COLOR_MAP> = {
  P0: "red",
  P1: "orange",
  P2: "blue",
  P3: "green",
};

const resolvedColorKey = computed<keyof typeof COLOR_MAP>(() => {
  if (props.priority) {
    return PRIORITY_MAP[props.priority];
  }

  if (props.color) {
    return props.color in COLOR_MAP ? (props.color as keyof typeof COLOR_MAP) : "default";
  }

  return "gray";
});

const badgeStyle = computed<CSSProperties>(() => {
  const tone = COLOR_MAP[resolvedColorKey.value];
  return {
    "--one-badge-bg": tone.background,
    "--one-badge-color": tone.text,
    "--one-badge-border": tone.border,
  } as CSSProperties;
});
</script>

<template>
  <span class="one-badge" :class="`one-badge--${size}`" :style="badgeStyle">
    <slot />
  </span>
</template>

<style scoped>
.one-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: fit-content !important;
  border: 1px solid var(--one-badge-border) !important;
  border-radius: 3px !important;
  background: var(--one-badge-bg) !important;
  color: var(--one-badge-color) !important;
  font-family: var(--of-font-sans) !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
}

.one-badge--sm {
  font-size: 11px !important;
  padding: 1px 6px !important;
}

.one-badge--md {
  font-size: 12px !important;
  padding: 2px 8px !important;
}
</style>
