<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";
import { resolveIcon } from "../../utils/icon";

defineOptions({ name: "RefTag" });

export interface RefTagProps {
  type?: "spec" | "wiki" | "task" | string;
  icon?: string;
  color?: string;
  bg?: string;
  href?: string;
}

interface Preset {
  icon: string;
  color: string;
  bg: string;
}

const PRESETS: Record<string, Preset> = {
  spec: {
    icon: "file-text",
    color: "var(--of-color-primary-700)",
    bg: "var(--of-color-primary-50)",
  },
  wiki: { icon: "book-open", color: "var(--of-color-green-600)", bg: "var(--of-color-green-50)" },
  task: { icon: "link", color: "var(--of-color-orange-600)", bg: "var(--of-color-orange-50)" },
};

const props = withDefaults(defineProps<RefTagProps>(), {
  type: "spec",
});

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
  >
    <component v-if="iconComponent" :is="iconComponent" class="one-ref-tag__icon" />
    <span class="one-ref-tag__text">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.one-ref-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--one-ref-tag-bg);
  color: var(--one-ref-tag-color);
  text-decoration: none;
  cursor: default;
  box-sizing: border-box;
  line-height: 1.2;
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
  font-size: 11px;
  font-weight: 500;
  font-family: "Inter", var(--of-font-sans), sans-serif;
  color: var(--one-ref-tag-color);
}
</style>
