<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

export interface ChainItemProps {
  type?: "source" | "result";
  title: string;
  description?: string;
  avatar?: string;
  duration?: string;
  color?: string;
  bg?: string;
  borderColor?: string;
}

const props = withDefaults(defineProps<ChainItemProps>(), {
  description: undefined,
  avatar: undefined,
  duration: undefined,
  color: undefined,
  bg: undefined,
  borderColor: undefined,
  type: "source",
});

defineOptions({ inheritAttrs: false });

const PRESETS = {
  source: {
    color: "var(--of-accent-strong)",
    bg: "var(--of-surface-panel)",
    border: "var(--of-border-subtle)",
    avatarBg: "var(--of-surface-selected)",
    descColor: "var(--of-text-secondary)",
    defaultAvatar: "A",
  },
  result: {
    color: "var(--of-accent-default)",
    bg: "var(--of-surface-muted)",
    border: "var(--of-border-subtle)",
    avatarBg: "var(--of-surface-selected)",
    descColor: "var(--of-text-primary)",
    defaultAvatar: "✓",
  },
};

const preset = computed(() => PRESETS[props.type || "source"]);

const resolvedColor = computed(() => props.color || preset.value.color);
const resolvedBg = computed(() => props.bg || preset.value.bg);
const resolvedBorder = computed(() => props.borderColor || preset.value.border);
const descColor = computed(() => preset.value.descColor);
const displayAvatar = computed(() => props.avatar || preset.value.defaultAvatar);

const containerStyle = computed<CSSProperties>(() => ({
  background: resolvedBg.value,
  borderColor: resolvedBorder.value,
}));

const avatarStyle = computed<CSSProperties>(() => ({
  backgroundColor: preset.value.avatarBg,
  color: resolvedColor.value,
}));
</script>

<template>
  <div class="one-chain-item" :style="containerStyle" v-bind="$attrs">
    <div class="one-chain-item__header">
      <span class="one-chain-item__avatar" :style="avatarStyle">{{ displayAvatar }}</span>
      <span class="one-chain-item__title" :style="{ color: resolvedColor }">{{ title }}</span>
      <span v-if="duration" class="one-chain-item__duration">{{ duration }}</span>
    </div>
    <div v-if="description" class="one-chain-item__desc" :style="{ color: descColor }">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.one-chain-item {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
  border-radius: var(--of-radius-lg);
  padding: var(--of-spacing-3);
  border: 1px solid;
  width: 100%;
  box-sizing: border-box;
}

.one-chain-item__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--of-spacing-2);
}

.one-chain-item__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-semibold);
  flex-shrink: 0;
}

.one-chain-item__title {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-semibold);
  line-height: var(--of-line-height-tight);
}

.one-chain-item__duration {
  margin-left: auto;
  font-size: var(--of-font-size-xs);
  color: var(--of-color-text-secondary, #6b7280);
  white-space: nowrap;
}

.one-chain-item__desc {
  font-size: var(--of-font-size-xs);
  font-family: var(--of-font-mono, "Roboto Mono", monospace);
  line-height: 1.4;
  word-break: break-all;
}
</style>
