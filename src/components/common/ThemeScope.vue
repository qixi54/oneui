<script setup lang="ts">
type ThemeScopeTheme = "neutral" | "ops-console";

const props = withDefaults(
  defineProps<{
    theme: ThemeScopeTheme;
    tag?: string;
  }>(),
  {
    tag: "div",
  },
);

defineOptions({ name: "ThemeScope" });
</script>

<template>
  <component
    :is="props.tag"
    :data-of-theme="props.theme"
    :data-of-theme-scope="props.theme"
  >
    <slot />
  </component>
</template>
