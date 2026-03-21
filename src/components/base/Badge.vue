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
  color: undefined,
  priority: undefined,
  size: "md",
});

defineOptions({ inheritAttrs: false });

defineSlots<{
  default?: () => VNode[];
}>();

const COLOR_MAP: Record<string, BadgeTone> = {
  default: {
    background: "var(--of-surface-muted)",
    text: "var(--of-text-secondary)",
    border: "var(--of-border-subtle)",
  },
  blue: {
    background: "var(--of-surface-selected)",
    text: "var(--of-accent-strong)",
    border: "var(--of-border-subtle)",
  },
  green: {
    background: "var(--of-surface-panel)",
    text: "var(--of-text-strong)",
    border: "var(--of-border-subtle)",
  },
  orange: {
    background: "var(--of-surface-muted)",
    text: "var(--of-text-primary)",
    border: "var(--of-border-strong)",
  },
  red: {
    background: "var(--of-surface-selected)",
    text: "var(--of-text-strong)",
    border: "var(--of-border-strong)",
  },
  purple: {
    background: "var(--of-surface-panel)",
    text: "var(--of-text-secondary)",
    border: "var(--of-border-subtle)",
  },
  gray: {
    background: "var(--of-surface-muted)",
    text: "var(--of-text-secondary)",
    border: "var(--of-border-subtle)",
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
  border-radius: 6px;
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
