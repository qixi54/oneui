<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

export interface ChainItemProps {
  type?: 'source' | 'result';
  title: string;
  description?: string;
  avatar?: string;
  duration?: string;
  color?: string;
  bg?: string;
  borderColor?: string;
}

const props = withDefaults(defineProps<ChainItemProps>(), {
  type: 'source',
});

const PRESETS = {
  source: { color: 'var(--of-badge-purple-text, #7C3AED)', bg: 'var(--of-badge-purple-bg, #F9F0FF)', border: 'var(--of-badge-purple-border, #E9D5FF)', avatarBg: 'var(--of-badge-purple-border, #E9D5FF)', descColor: 'var(--of-badge-purple-text, #6B21A8)', defaultAvatar: 'A' },
  result: { color: 'var(--of-color-success, #22C55E)', bg: 'var(--of-color-success-light, #F6FFED)', border: 'var(--of-color-success-border, #B7EB8F)', avatarBg: 'var(--of-color-success-border, #B7EB8F)', descColor: 'var(--of-color-success-dark, #165E26)', defaultAvatar: '✓' },
};

const preset = computed(() => PRESETS[props.type || 'source']);

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
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  border-radius: 8px !important;
  padding: 12px !important;
  border: 1px solid !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.one-chain-item__header {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
}

.one-chain-item__avatar {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  flex-shrink: 0 !important;
}

.one-chain-item__title {
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
}

.one-chain-item__duration {
  margin-left: auto !important;
  font-size: 11px !important;
  color: var(--of-color-text-secondary, #6B7280) !important;
  white-space: nowrap !important;
}

.one-chain-item__desc {
  font-size: 11px !important;
  font-family: var(--of-font-mono, 'Roboto Mono', monospace) !important;
  line-height: 1.4 !important;
  word-break: break-all !important;
}
</style>
