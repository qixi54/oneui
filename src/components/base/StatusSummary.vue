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

const props = withDefaults(defineProps<StatusSummaryProps>(), {
  size: "md",
  separator: false,
});

defineSlots<{
  extra?: () => VNode[];
}>();

defineOptions({ name: "StatusSummary", inheritAttrs: false });

const dotSize = computed(() => (props.size === "sm" ? "6px" : "7px"));
const fontSize = computed(() => (props.size === "sm" ? "10px" : "11px"));

function dotColor(item: StatusSummaryItem): string {
  return item.color ?? "var(--of-border-workspace)";
}

function countColor(item: StatusSummaryItem): string {
  return item.highlight ? "var(--of-accent-strong)" : "var(--of-text-primary)";
}
</script>

<template>
  <div class="of-status-summary" :class="`of-status-summary--${size}`" v-bind="$attrs">
    <template v-for="(item, index) in items" :key="item.key">
      <span v-if="separator && index > 0" class="of-status-summary__sep" aria-hidden="true" />
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
          >
            {{ item.count }}
          </span>
      </span>
    </template>

    <span v-if="$slots.extra" class="of-status-summary__extra">
      <slot name="extra" />
    </span>
  </div>
</template>

<style scoped>
.of-status-summary {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  gap: var(--of-spacing-3_5);
  padding: var(--of-spacing-1_25) 13px;
  background: var(--of-surface-card);
  border-bottom: 1px solid var(--of-border-workspace);
  box-sizing: border-box;
  min-height: 0;
}

.of-status-summary__item {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1);
  white-space: nowrap;
  flex-shrink: 0;
}

.of-status-summary__dot {
  display: inline-block;
  border-radius: var(--of-radius-full);
  flex-shrink: 0;
}

.of-status-summary__label {
  color: var(--of-text-tertiary);
  line-height: 1.4;
  font-family: var(--of-font-sans, sans-serif);
}

.of-status-summary__count {
  line-height: 1.4;
  font-family: var(--of-font-sans, sans-serif);
}

.of-status-summary__sep {
  display: inline-block;
  width: 1px;
  height: 12px;
  background: var(--of-border-workspace);
  flex-shrink: 0;
  align-self: center;
}

.of-status-summary__extra {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}
</style>
