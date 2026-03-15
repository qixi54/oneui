<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface SelectBadgeProps {
  color?: string;
  dot?: boolean;
  dotColor?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<SelectBadgeProps>(), {
  dot: false,
  clickable: true,
});

defineSlots<{
  default?: () => VNode[];
}>();

const emit = defineEmits<{
  click: [e: MouseEvent];
}>();

const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  red:    { text: 'var(--of-badge-red-text)',    bg: 'var(--of-badge-red-bg)',    border: 'var(--of-badge-red-border)' },
  orange: { text: 'var(--of-badge-orange-text)', bg: 'var(--of-badge-orange-bg)', border: 'var(--of-badge-orange-border)' },
  green:  { text: 'var(--of-badge-green-text)',  bg: 'var(--of-badge-green-bg)',  border: 'var(--of-badge-green-border)' },
  blue:   { text: 'var(--of-badge-blue-text)',   bg: 'var(--of-badge-blue-bg)',   border: 'var(--of-badge-blue-border)' },
  purple: { text: 'var(--of-badge-purple-text)', bg: 'var(--of-badge-purple-bg)', border: 'var(--of-badge-purple-border)' },
  gray:   { text: 'var(--of-badge-gray-text)',   bg: 'var(--of-badge-gray-bg)',   border: 'var(--of-badge-gray-border)' },
};

const resolvedTextColor = computed(() => {
  if (props.textColor) return props.textColor;
  if (props.color && COLOR_MAP[props.color]) return COLOR_MAP[props.color].text;
  return COLOR_MAP.gray.text;
});

const resolvedBgColor = computed(() => {
  if (props.bgColor) return props.bgColor;
  if (props.color && COLOR_MAP[props.color]) return COLOR_MAP[props.color].bg;
  return COLOR_MAP.gray.bg;
});

const resolvedBorderColor = computed(() => {
  if (props.borderColor) return props.borderColor;
  if (props.color && COLOR_MAP[props.color]) return COLOR_MAP[props.color].border;
  return COLOR_MAP.gray.border;
});

const containerStyle = computed<CSSProperties>(() => ({
  '--one-sb-text': resolvedTextColor.value,
  '--one-sb-bg': resolvedBgColor.value,
  '--one-sb-border': resolvedBorderColor.value,
} as CSSProperties));

const dotStyle = computed<CSSProperties>(() => ({
  backgroundColor: props.dotColor || resolvedTextColor.value,
}));

const ChevronDown = resolveIcon('chevron-down');

function handleClick(e: MouseEvent) {
  emit('click', e);
}
</script>

<template>
  <span
    class="one-select-badge"
    :class="{ 'one-select-badge--clickable': clickable }"
    :style="containerStyle"
    @click="handleClick"
  >
    <span v-if="dot" class="one-select-badge__dot" :style="dotStyle" />
    <span class="one-select-badge__text">
      <slot />
    </span>
    <component
      v-if="clickable && ChevronDown"
      :is="ChevronDown"
      class="one-select-badge__arrow"
    />
  </span>
</template>

<style scoped>
.one-select-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  border-radius: 8px !important;
  padding: 3px 10px !important;
  border: 1px solid var(--one-sb-border) !important;
  background: var(--one-sb-bg) !important;
  color: var(--one-sb-text) !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
  user-select: none !important;
}

.one-select-badge--clickable {
  cursor: pointer !important;
}

.one-select-badge__dot {
  display: inline-block !important;
  width: 6px !important;
  height: 6px !important;
  border-radius: 50% !important;
  flex-shrink: 0 !important;
}

.one-select-badge__text {
  color: inherit !important;
  font-size: inherit !important;
  font-weight: inherit !important;
}

.one-select-badge__arrow {
  width: 10px !important;
  height: 10px !important;
  flex-shrink: 0 !important;
  color: inherit !important;
}
</style>
