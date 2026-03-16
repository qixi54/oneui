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
      >▼</span
    >

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
  </div>
</template>

<style scoped>
.of-table-group-row {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  gap: 8px;
  background: var(--of-color-gray-50);
  border-bottom: 1px solid var(--of-color-gray-200);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--of-color-text-primary);
  box-sizing: border-box;
  user-select: none;
}

.of-table-group-row:hover {
  background: var(--of-color-gray-100);
}

.of-table-group-row__checkbox-spacer {
  width: 44px;
  flex-shrink: 0;
}

.of-table-group-row__chevron {
  font-size: var(--of-font-size-xs);
  color: var(--of-color-text-tertiary);
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
  color: var(--of-color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-table-group-row__count {
  font-size: 12px;
  color: var(--of-color-text-tertiary);
  font-weight: 400;
  white-space: nowrap;
}
</style>
