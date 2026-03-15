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
  spec: { icon: "file-text", color: "var(--of-color-primary-700)", bg: "var(--of-color-primary-50)" },
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
    <component
      v-if="iconComponent"
      :is="iconComponent"
      class="one-ref-tag__icon"
    />
    <span class="one-ref-tag__text">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.one-ref-tag {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 4px 10px !important;
  border-radius: 6px !important;
  background: var(--one-ref-tag-bg) !important;
  color: var(--one-ref-tag-color) !important;
  text-decoration: none !important;
  cursor: default !important;
  box-sizing: border-box !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}

a.one-ref-tag {
  cursor: pointer !important;
}

a.one-ref-tag:hover {
  opacity: 0.85 !important;
}

.one-ref-tag__icon {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0 !important;
  color: var(--one-ref-tag-color) !important;
}

.one-ref-tag__text {
  font-size: 11px !important;
  font-weight: 500 !important;
  font-family: "Inter", var(--of-font-sans), sans-serif !important;
  color: var(--one-ref-tag-color) !important;
}
</style>
