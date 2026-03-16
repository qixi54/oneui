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
  type: "source",
});

const PRESETS = {
  source: {
    color: "var(--of-badge-purple-text, #7C3AED)",
    bg: "var(--of-badge-purple-bg, #F9F0FF)",
    border: "var(--of-badge-purple-border, #E9D5FF)",
    avatarBg: "var(--of-badge-purple-border, #E9D5FF)",
    descColor: "var(--of-badge-purple-text, #6B21A8)",
    defaultAvatar: "A",
  },
  result: {
    color: "var(--of-color-success, #22C55E)",
    bg: "var(--of-color-success-light, #F6FFED)",
    border: "var(--of-color-success-border, #B7EB8F)",
    avatarBg: "var(--of-color-success-border, #B7EB8F)",
    descColor: "var(--of-color-success-dark, #165E26)",
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
  <div class="one-chain-item" :style="containerStyle">
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
  gap: 8px;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid;
  width: 100%;
  box-sizing: border-box;
}

.one-chain-item__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.one-chain-item__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.one-chain-item__title {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.one-chain-item__duration {
  margin-left: auto;
  font-size: 11px;
  color: var(--of-color-text-secondary, #6b7280);
  white-space: nowrap;
}

.one-chain-item__desc {
  font-size: 11px;
  font-family: var(--of-font-mono, "Roboto Mono", monospace);
  line-height: 1.4;
  word-break: break-all;
}
</style>
