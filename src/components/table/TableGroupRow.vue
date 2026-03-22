<script setup lang="ts">
import { computed } from "vue";
import type { ColorMap } from "../../types";
import { resolveBadge } from "../../composables/useBadge";

const props = withDefaults(
  defineProps<{
    groupKey: string;
    count: number;
    collapsed?: boolean;
    colorMap?: ColorMap;
    selectable?: boolean;
    /** Nesting level for multi-level grouping (0-based) */
    level?: number;
    /** Aggregation results to display inline */
    aggregations?: Record<string, number>;
  }>(),
  {
    collapsed: false,
    colorMap: undefined,
    selectable: true,
    level: 0,
    aggregations: undefined,
  },
);

const emit = defineEmits<{ toggle: [] }>();

const badge = computed(() => {
  if (!props.colorMap) return null;
  return resolveBadge(props.groupKey, props.colorMap);
});

const displayLabel = computed(() => props.groupKey || "(空)");
const indentPx = computed(() => props.level * 16);

const formattedAggregations = computed(() => {
  if (!props.aggregations) return [];
  return Object.entries(props.aggregations).map(([key, value]) => {
    const [, fn] = key.split(":");
    const label =
      fn === "sum"
        ? "总计"
        : fn === "avg"
          ? "平均"
          : fn === "min"
            ? "最小"
            : fn === "max"
              ? "最大"
              : "计数";
    const formatted =
      typeof value === "number" && !Number.isInteger(value) ? value.toFixed(2) : String(value);
    return { key, label, value: formatted };
  });
});

function handleToggleKeyDown(event: KeyboardEvent) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  emit("toggle");
}
</script>

<template>
  <div
    class="of-table-group-row"
    role="row"
    tabindex="0"
    :aria-expanded="!collapsed"
    :style="{ paddingLeft: `${12 + indentPx}px` }"
    @click="emit('toggle')"
    @keydown="handleToggleKeyDown"
  >
    <div class="of-table-group-row__cell" role="gridcell">
      <!-- Checkbox spacer (matches checkbox column width in TableDataRow) -->
      <div v-if="selectable" class="of-table-group-row__checkbox-spacer" />

      <!-- Chevron toggle indicator -->
      <span class="of-table-group-row__chevron" :class="{ 'of-table-group-row__chevron--collapsed': collapsed }">▼</span>

      <!-- Group label: badge if colorMap has a matching entry, plain text otherwise -->
      <span v-if="badge" class="of-table-group-row__badge" :style="badge.style">
        <span
          v-if="badge.dot"
          class="of-table-group-row__badge-dot"
          :style="{ background: badge.dot }"
        />
        {{ badge.label }}
      </span>
      <span v-else class="of-table-group-row__label">{{ displayLabel }}</span>

      <!-- Row count -->
      <span class="of-table-group-row__count">({{ count }})</span>

      <!-- Aggregation values -->
      <span v-for="agg in formattedAggregations" :key="agg.key" class="of-table-group-row__agg">
        {{ agg.label }}: {{ agg.value }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.of-table-group-row {
  --of-table-group-row-surface: var(--of-surface-panel, var(--of-color-gray-50));
  --of-table-group-row-hover-surface: var(--of-surface-muted, var(--of-color-gray-100));
  --of-table-group-row-border: var(--of-border-subtle, var(--of-color-gray-200));
  --of-table-group-row-focus-ring: var(--of-border-strong, var(--of-color-gray-300));
  --of-table-group-row-text-primary: var(--of-text-primary, var(--of-color-text-primary));
  --of-table-group-row-text-secondary: var(--of-text-secondary, var(--of-color-text-tertiary));
  --of-table-group-row-text-tertiary: var(--of-text-tertiary, var(--of-color-gray-400));
  --of-table-group-row-badge-surface: var(--of-surface-elevated, var(--of-color-bg-elevated));
  --of-table-group-row-badge-border: var(--of-border-subtle, var(--of-color-gray-200));
  display: flex;
  align-items: center;
  height: 36px;
  background: var(--of-table-group-row-surface);
  border-bottom: 1px solid var(--of-table-group-row-border);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--of-table-group-row-text-primary);
  box-sizing: border-box;
  user-select: none;
}

.of-table-group-row__cell {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 12px;
  gap: 8px;
  box-sizing: border-box;
}

.of-table-group-row:hover {
  background: var(--of-table-group-row-hover-surface);
}

.of-table-group-row:focus-visible {
  outline: 2px solid var(--of-table-group-row-focus-ring);
  outline-offset: -2px;
}

.of-table-group-row__checkbox-spacer {
  width: 44px;
  flex-shrink: 0;
}

.of-table-group-row__chevron {
  font-size: var(--of-font-size-xs);
  color: var(--of-table-group-row-text-tertiary);
  width: 14px;
  text-align: center;
  flex-shrink: 0;
  display: inline-block;
  transform: rotate(0deg);
  transition: transform 0.15s;
  line-height: 1;
}

.of-table-group-row__chevron--collapsed {
  transform: rotate(-90deg);
}

.of-table-group-row__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: 2px 8px;
  border-radius: var(--of-radius-xl);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
  background: var(--of-table-group-row-badge-surface);
  border: 1px solid var(--of-table-group-row-badge-border);
}

.of-table-group-row__badge-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: var(--of-radius-full);
  flex-shrink: 0;
}

.of-table-group-row__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--of-table-group-row-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-table-group-row__count {
  font-size: 12px;
  color: var(--of-table-group-row-text-secondary);
  font-weight: 400;
  white-space: nowrap;
}

.of-table-group-row__agg {
  font-size: 11px;
  color: var(--of-table-group-row-text-tertiary);
  font-weight: 400;
  white-space: nowrap;
  margin-left: 4px;
}
</style>
