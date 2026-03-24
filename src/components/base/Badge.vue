<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";

type LooseString<T extends string> = T | (string & {});
type BadgeColor = "default" | "blue" | "green" | "orange" | "red" | "purple" | "gray";
type BadgeVariant = "outlined" | "solid" | "subtle";
type BadgeToneKey = Exclude<BadgeColor, "default">;

export interface BadgeProps {
  color?: LooseString<BadgeColor>;
  priority?: "P0" | "P1" | "P2" | "P3";
  size?: "sm" | "md";
  variant?: BadgeVariant;
}

const props = withDefaults(defineProps<BadgeProps>(), {
  color: undefined,
  priority: undefined,
  size: "md",
  variant: "outlined",
});

defineOptions({ inheritAttrs: false });

defineSlots<{
  default?: () => VNode[];
}>();

const COLOR_TOKENS: Record<BadgeToneKey, { bg: string; text: string; border: string; solid: string }> = {
  blue: {
    bg: "var(--of-badge-blue-bg)",
    text: "var(--of-badge-blue-text)",
    border: "var(--of-badge-blue-border)",
    solid: "var(--of-color-blue-500)",
  },
  green: {
    bg: "var(--of-badge-green-bg)",
    text: "var(--of-badge-green-text)",
    border: "var(--of-badge-green-border)",
    solid: "var(--of-color-green-500)",
  },
  orange: {
    bg: "var(--of-badge-orange-bg)",
    text: "var(--of-badge-orange-text)",
    border: "var(--of-badge-orange-border)",
    solid: "var(--of-color-orange-500)",
  },
  red: {
    bg: "var(--of-badge-red-bg)",
    text: "var(--of-badge-red-text)",
    border: "var(--of-badge-red-border)",
    solid: "var(--of-color-red-500)",
  },
  purple: {
    bg: "var(--of-badge-purple-bg)",
    text: "var(--of-badge-purple-text)",
    border: "var(--of-badge-purple-border)",
    solid: "var(--of-color-purple-600)",
  },
  gray: {
    bg: "var(--of-badge-gray-bg)",
    text: "var(--of-badge-gray-text)",
    border: "var(--of-badge-gray-border)",
    solid: "var(--of-color-gray-500)",
  },
};

const PRIORITY_MAP: Record<NonNullable<BadgeProps["priority"]>, BadgeToneKey> = {
  P0: "red",
  P1: "orange",
  P2: "blue",
  P3: "green",
};

const resolvedColorKey = computed<BadgeToneKey>(() => {
  if (props.priority) {
    return PRIORITY_MAP[props.priority];
  }

  if (props.color) {
    if (props.color === "default") {
      return "gray";
    }

    return props.color in COLOR_TOKENS ? (props.color as BadgeToneKey) : "gray";
  }

  return "gray";
});

const badgeStyle = computed<CSSProperties>(() => {
  const tone = COLOR_TOKENS[resolvedColorKey.value];
  const variant = props.variant;
  return {
    "--one-badge-bg": variant === "solid" ? tone.solid : tone.bg,
    "--one-badge-color": variant === "solid" ? "var(--of-color-white)" : tone.text,
    "--one-badge-border": variant === "outlined" ? tone.border : "transparent",
    "--one-badge-border-width": variant === "outlined" ? "1px" : "0px",
  } as CSSProperties;
});
</script>

<template>
  <span
    class="one-badge"
    :class="[`one-badge--${size}`, `one-badge--${variant}`]"
    :style="badgeStyle"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>

<style scoped>
.one-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border: var(--one-badge-border-width) solid var(--one-badge-border);
  border-radius: var(--of-radius-md);
  background: var(--one-badge-bg);
  color: var(--one-badge-color);
  font-family: var(--of-font-sans);
  font-weight: var(--of-font-weight-medium);
  line-height: var(--of-line-height-tight);
  white-space: nowrap;
  box-sizing: border-box;
}

.one-badge--sm {
  font-size: var(--of-font-size-xs);
  padding: 1px var(--of-spacing-1_5);
}

.one-badge--md {
  font-size: var(--of-font-size-sm);
  padding: var(--of-spacing-0_5) var(--of-spacing-2);
}

.one-badge--solid,
.one-badge--subtle {
  border-width: 0;
}
</style>
