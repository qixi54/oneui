<script setup lang="ts">
import { computed } from "vue";
import type { ColorMap } from "../../types";
import { resolveBadge } from "../../composables/useBadge";

defineOptions({ name: "TableGroupRow" });

const props = withDefaults(
  defineProps<{
    groupKey: string;
    count: number;
    collapsed?: boolean;
    colorMap?: ColorMap;
    selectable?: boolean;
  }>(),
  { collapsed: false, selectable: true },
);

const emit = defineEmits<{ toggle: [] }>();

const badge = computed(() => {
  if (!props.colorMap) return null;
  const resolved = resolveBadge(props.groupKey, props.colorMap);
  // resolveBadge returns { style: { color, background }, label, dot }
  return resolved;
});

const displayLabel = computed(() => props.groupKey || "(空)");
</script>

<template>
  <div class="of-table-group-row" @click="emit('toggle')">
    <!-- Checkbox spacer (matches checkbox column width in TableDataRow) -->
    <div v-if="selectable" class="of-table-group-row__checkbox-spacer" />

    <!-- Chevron toggle indicator -->
    <span
      class="of-table-group-row__chevron"
      :class="{ 'of-table-group-row__chevron--collapsed': collapsed }"
    >▼</span>

    <!-- Group label: badge if colorMap has a matching entry, plain text otherwise -->
    <span
      v-if="badge"
      class="of-table-group-row__badge"
      :style="badge.style"
    >
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
  </div>
</template>

<style scoped>
.of-table-group-row {
  display: flex !important;
  align-items: center !important;
  height: 36px !important;
  padding: 0 12px !important;
  gap: 8px !important;
  background: var(--of-color-gray-50) !important;
  border-bottom: 1px solid var(--of-color-gray-200) !important;
  cursor: pointer !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--of-color-text-primary) !important;
  box-sizing: border-box !important;
  user-select: none !important;
}

.of-table-group-row:hover {
  background: var(--of-color-gray-100) !important;
}

.of-table-group-row__checkbox-spacer {
  width: 44px !important;
  flex-shrink: 0 !important;
}

.of-table-group-row__chevron {
  font-size: var(--of-font-size-xs) !important;
  color: var(--of-color-text-tertiary) !important;
  width: 14px !important;
  text-align: center !important;
  flex-shrink: 0 !important;
  display: inline-block !important;
  transform: rotate(0deg) !important;
  transition: transform 0.15s !important;
  line-height: 1 !important;
}

.of-table-group-row__chevron--collapsed {
  transform: rotate(-90deg) !important;
}

.of-table-group-row__badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: var(--of-spacing-1) !important;
  padding: 2px 8px !important;
  border-radius: var(--of-radius-xl) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  line-height: 1.4 !important;
}

.of-table-group-row__badge-dot {
  display: inline-block !important;
  width: 6px !important;
  height: 6px !important;
  border-radius: var(--of-radius-full) !important;
  flex-shrink: 0 !important;
}

.of-table-group-row__label {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--of-color-text-primary) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.of-table-group-row__count {
  font-size: 12px !important;
  color: var(--of-color-text-tertiary) !important;
  font-weight: 400 !important;
  white-space: nowrap !important;
}
</style>
