<script setup lang="ts">
import { computed, type Component, type CSSProperties, type VNode } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface RefTagProps {
  type?: "spec" | "wiki" | "task" | string;
  icon?: string | Component;
  color?: string;
  bg?: string;
  href?: string;
}

interface Preset {
  icon: string | Component;
  color: string;
  bg: string;
}

const props = withDefaults(defineProps<RefTagProps>(), {
  icon: undefined,
  color: undefined,
  bg: undefined,
  href: undefined,
  type: "spec",
});

const PRESETS: Record<string, Preset> = {
  spec: {
    icon: "file-text",
    color: "var(--of-text-strong)",
    bg: "var(--of-surface-selected)",
  },
  wiki: { icon: "book-open", color: "var(--of-text-secondary)", bg: "var(--of-surface-muted)" },
  task: { icon: "link", color: "var(--of-accent-strong)", bg: "var(--of-surface-panel)" },
};

defineOptions({ name: "RefTag", inheritAttrs: false });

defineSlots<{
  default?: () => VNode[];
}>();

const preset = computed(() => PRESETS[props.type ?? ""] ?? PRESETS.spec);

const iconComponent = computed(() => {
  const name = props.icon ?? preset.value.icon;
  return resolveIcon(name);
});

const tagStyle = computed<CSSProperties>(() => {
  return {
    "--one-ref-tag-color": props.color ?? preset.value.color,
    "--one-ref-tag-bg": props.bg ?? preset.value.bg,
  } as CSSProperties;
});
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    class="one-ref-tag"
    :style="tagStyle"
    :href="href ?? undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    v-bind="$attrs"
  >
    <component :is="iconComponent" v-if="iconComponent" class="one-ref-tag__icon" />
    <span class="one-ref-tag__text">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.one-ref-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: var(--of-spacing-1) var(--of-spacing-2_5);
  border-radius: var(--of-radius-md);
  background: var(--one-ref-tag-bg);
  color: var(--one-ref-tag-color);
  text-decoration: none;
  cursor: default;
  box-sizing: border-box;
  line-height: var(--of-line-height-tight);
  white-space: nowrap;
}

a.one-ref-tag {
  cursor: pointer;
}

a.one-ref-tag:hover {
  opacity: 0.85;
}

.one-ref-tag__icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: var(--one-ref-tag-color);
}

.one-ref-tag__text {
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  font-family: var(--of-font-sans), sans-serif;
  color: var(--one-ref-tag-color);
}
</style>
