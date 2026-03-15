<script setup lang="ts">
import { computed, type VNode } from "vue";

export interface StatusSummaryItem {
  key: string;
  label: string;
  count: number;
  color?: string;
  highlight?: boolean;
}

export interface StatusSummaryProps {
  items: StatusSummaryItem[];
  size?: "sm" | "md";
  separator?: boolean;
}

defineOptions({ name: "StatusSummary" });

defineSlots<{
  extra?: () => VNode[];
}>();

const props = withDefaults(defineProps<StatusSummaryProps>(), {
  size: "md",
  separator: false,
});

const dotSize = computed(() => (props.size === "sm" ? "6px" : "7px"));
const fontSize = computed(() => (props.size === "sm" ? "10px" : "11px"));

function dotColor(item: StatusSummaryItem): string {
  return item.color ?? "var(--of-color-gray-300)";
}

function countColor(item: StatusSummaryItem): string {
  return item.highlight ? dotColor(item) : "var(--of-color-text-primary)";
}
</script>

<template>
  <div class="of-status-summary" :class="`of-status-summary--${size}`">
    <template v-for="(item, index) in items" :key="item.key">
      <span
        v-if="separator && index > 0"
        class="of-status-summary__sep"
        aria-hidden="true"
      />
      <span class="of-status-summary__item">
        <span
          class="of-status-summary__dot"
          :style="{
            width: dotSize,
            height: dotSize,
            backgroundColor: dotColor(item),
          }"
        />
        <span class="of-status-summary__label" :style="{ fontSize }">{{ item.label }}</span>
        <span
          class="of-status-summary__count"
          :style="{
            fontSize,
            color: countColor(item),
            fontWeight: item.highlight ? '700' : '600',
          }"
        >{{ item.count }}</span>
      </span>
    </template>

    <span v-if="$slots.extra" class="of-status-summary__extra">
      <slot name="extra" />
    </span>
  </div>
</template>

<style scoped>
.of-status-summary {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
  gap: 14px !important;
  padding: 5px 13px !important;
  background: var(--of-color-gray-50) !important;
  border-bottom: 1px solid var(--of-border-color) !important;
  box-sizing: border-box !important;
  min-height: 0 !important;
}

.of-status-summary__item {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

.of-status-summary__dot {
  display: inline-block !important;
  border-radius: var(--of-radius-full) !important;
  flex-shrink: 0 !important;
}

.of-status-summary__label {
  color: var(--of-color-text-tertiary) !important;
  line-height: 1.4 !important;
  font-family: var(--of-font-sans, sans-serif) !important;
}

.of-status-summary__count {
  line-height: 1.4 !important;
  font-family: var(--of-font-sans, sans-serif) !important;
}

.of-status-summary__sep {
  display: inline-block !important;
  width: 1px !important;
  height: 12px !important;
  background: var(--of-border-color) !important;
  flex-shrink: 0 !important;
  align-self: center !important;
}

.of-status-summary__extra {
  display: inline-flex !important;
  align-items: center !important;
  margin-left: auto !important;
  flex-shrink: 0 !important;
}
</style>
