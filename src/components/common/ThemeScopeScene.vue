<script setup lang="ts">
import ThemeScope from "./ThemeScope.vue";

type ThemeScopeTheme = "neutral" | "ops-console";

const props = withDefaults(
  defineProps<{
    theme: ThemeScopeTheme;
    title: string;
    description?: string;
    eyebrow?: string;
    tag?: string;
  }>(),
  {
    description: "",
    eyebrow: "",
    tag: "section",
  },
);

defineOptions({ name: "ThemeScopeScene" });
</script>

<template>
  <ThemeScope :theme="props.theme" :tag="props.tag" class="of-theme-scope-scene">
    <header class="of-theme-scope-scene__header">
      <div class="of-theme-scope-scene__heading">
        <p v-if="props.eyebrow" class="of-theme-scope-scene__eyebrow">
          {{ props.eyebrow }}
        </p>
        <h3 class="of-theme-scope-scene__title">{{ props.title }}</h3>
        <p v-if="props.description" class="of-theme-scope-scene__description">
          {{ props.description }}
        </p>
      </div>

      <div v-if="$slots.meta" class="of-theme-scope-scene__meta">
        <slot name="meta" />
      </div>
    </header>

    <div class="of-theme-scope-scene__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="of-theme-scope-scene__footer">
      <slot name="footer" />
    </footer>
  </ThemeScope>
</template>

<style scoped>
.of-theme-scope-scene {
  display: grid;
  gap: var(--of-spacing-4);
  padding: var(--of-spacing-5);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, color-mix(in oklab, var(--of-accent-soft) 55%, transparent), transparent 44%),
    linear-gradient(180deg, var(--of-surface-elevated, var(--of-color-bg-elevated)), var(--of-surface-muted, var(--of-color-bg-hover)));
  box-shadow: var(--of-elevation-card, var(--of-shadow-card));
}

.of-theme-scope-scene__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--of-spacing-4);
  flex-wrap: wrap;
}

.of-theme-scope-scene__heading {
  display: grid;
  gap: var(--of-spacing-1);
  min-width: 0;
}

.of-theme-scope-scene__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
}

.of-theme-scope-scene__title {
  margin: 0;
  color: var(--of-text-primary, var(--of-color-text-primary));
  font-size: 20px;
  line-height: 1.2;
}

.of-theme-scope-scene__description {
  margin: 0;
  max-width: 72ch;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
  line-height: 1.6;
}

.of-theme-scope-scene__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--of-spacing-2);
}

.of-theme-scope-scene__body {
  display: grid;
  gap: var(--of-spacing-3);
}

.of-theme-scope-scene__footer {
  padding-top: var(--of-spacing-3);
  border-top: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
}
</style>
