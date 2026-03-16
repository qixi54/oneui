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

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BadgeProps>(), {
  size: "md",
});

defineSlots<{
  default?: () => VNode[];
}>();

const COLOR_MAP: Record<string, BadgeTone> = {
  default: {
    background: "var(--of-badge-gray-bg)",
    text: "var(--of-badge-gray-text)",
    border: "var(--of-badge-gray-border)",
  },
  blue: {
    background: "var(--of-badge-blue-bg)",
    text: "var(--of-badge-blue-text)",
    border: "var(--of-badge-blue-border)",
  },
  green: {
    background: "var(--of-badge-green-bg)",
    text: "var(--of-badge-green-text)",
    border: "var(--of-badge-green-border)",
  },
  orange: {
    background: "var(--of-badge-orange-bg)",
    text: "var(--of-badge-orange-text)",
    border: "var(--of-badge-orange-border)",
  },
  red: {
    background: "var(--of-badge-red-bg)",
    text: "var(--of-badge-red-text)",
    border: "var(--of-badge-red-border)",
  },
  purple: {
    background: "var(--of-badge-purple-bg)",
    text: "var(--of-badge-purple-text)",
    border: "var(--of-badge-purple-border)",
  },
  gray: {
    background: "var(--of-badge-gray-bg)",
    text: "var(--of-badge-gray-text)",
    border: "var(--of-badge-gray-border)",
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
  <span class="one-badge" :class="`one-badge--${size}`" :style="badgeStyle" v-bind="$attrs">
    <slot />
  </span>
</template>

<style scoped>
.one-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border: 1px solid var(--one-badge-border);
  border-radius: 3px;
  background: var(--one-badge-bg);
  color: var(--one-badge-color);
  font-family: var(--of-font-sans);
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  box-sizing: border-box;
}

.one-badge--sm {
  font-size: 11px;
  padding: 1px 6px;
}

.one-badge--md {
  font-size: 12px;
  padding: 2px 8px;
}
</style>
