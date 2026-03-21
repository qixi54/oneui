<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn, ColorMap } from "../../types";
import { resolveBadge, mergeColorMap, DEFAULT_STATUS_MAP } from "../../composables/useBadge";

type TableRow = Record<string, unknown> & { id: string };

const props = withDefaults(
  defineProps<{
    rows: TableRow[];
    columns: TableColumn[];
    selectable?: boolean;
    addable?: boolean;
    statusColorMap?: ColorMap;
    readonly?: boolean;
  }>(),
  {
    selectable: false,
    addable: true,
    statusColorMap: undefined,
    readonly: false,
  },
);

const emit = defineEmits<{
  "row-click": [row: TableRow];
  "add-row": [];
}>();

const mergedStatusMap = computed(() => mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap));

// Primary field = first column, secondary = next 2-3 columns
const primaryCol = computed(() => props.columns[0]);
const secondaryCols = computed(() => props.columns.slice(1, 4));

function getCellValue(row: TableRow, col: TableColumn): string {
  const val = row[col.key];
  return val != null ? String(val) : "";
}

function getStatusBadge(value: string) {
  return resolveBadge(value, mergedStatusMap.value);
}

// Swipe support
let touchStartX = 0;
let touchStartY = 0;
const swipingRowId = ref<string | null>(null);
const swipeOffset = ref(0);

function onTouchStart(e: TouchEvent, rowId: string) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  swipingRowId.value = rowId;
  swipeOffset.value = 0;
}

function onTouchMove(e: TouchEvent) {
  if (!swipingRowId.value) return;
  const dx = e.touches[0].clientX - touchStartX;
  const dy = e.touches[0].clientY - touchStartY;
  // Only handle horizontal swipe
  if (Math.abs(dy) > Math.abs(dx)) {
    swipingRowId.value = null;
    return;
  }
  swipeOffset.value = Math.max(-80, Math.min(0, dx));
}

function onTouchEnd() {
  if (swipeOffset.value < -40) {
    // Swipe left threshold reached - show delete action
    swipeOffset.value = -80;
  } else {
    swipeOffset.value = 0;
    swipingRowId.value = null;
  }
}

function handleCardKeyDown(event: KeyboardEvent, row: TableRow) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  emit("row-click", row);
}
</script>

<template>
  <div class="of-mobile-list">
    <div v-for="row in rows" :key="row.id" class="of-mobile-card-wrapper">
      <div
        class="of-mobile-card"
        role="button"
        tabindex="0"
        :style="{ transform: swipingRowId === row.id ? `translateX(${swipeOffset}px)` : '' }"
        @click="emit('row-click', row)"
        @keydown="handleCardKeyDown($event, row)"
        @touchstart="onTouchStart($event, row.id)"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Primary field (title) -->
        <div v-if="primaryCol" class="of-mobile-card__title">
          <slot name="cell" :row="row" :col="primaryCol">
            {{ getCellValue(row, primaryCol) || "—" }}
          </slot>
        </div>

        <!-- Secondary fields as badges/tags -->
        <div v-if="secondaryCols.length > 0" class="of-mobile-card__meta">
          <template v-for="col in secondaryCols" :key="col.key">
            <slot name="cell" :row="row" :col="col">
              <span
                v-if="col.key === 'status' && getCellValue(row, col)"
                class="of-mobile-card__badge"
                :style="getStatusBadge(getCellValue(row, col)).style"
              >
                {{ getStatusBadge(getCellValue(row, col)).label }}
              </span>
              <span v-else-if="getCellValue(row, col)" class="of-mobile-card__tag">
                {{ col.label }}: {{ getCellValue(row, col) }}
              </span>
            </slot>
          </template>
        </div>
      </div>

      <!-- Swipe-left delete action -->
      <div
        v-if="swipingRowId === row.id && swipeOffset < -40"
        class="of-mobile-card__action-delete"
      >
        删除
      </div>
    </div>

    <!-- Add row button -->
    <button
      v-if="addable && !readonly"
      type="button"
      class="of-mobile-add-btn"
      @click="emit('add-row')"
    >
      + 新增记录
    </button>
  </div>
</template>

<style scoped>
.of-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.of-mobile-card-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: var(--of-radius-lg, 8px);
}

.of-mobile-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #fff));
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  border-radius: var(--of-radius-lg, 8px);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s;
  position: relative;
  z-index: 1;
}

.of-mobile-card:active {
  background: var(--of-surface-muted, var(--of-color-gray-50, #f9fafb));
}

.of-mobile-card:focus-visible {
  outline: 2px solid var(--of-border-strong, var(--of-color-gray-300));
  outline-offset: -2px;
}

.of-mobile-card__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--of-text-primary, var(--of-color-text-primary, #1a1a1a));
  line-height: 1.4;
}

.of-mobile-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.of-mobile-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.of-mobile-card__tag {
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
  white-space: nowrap;
}

.of-mobile-card__action-delete {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--of-color-error, #dc2626);
  color: var(--of-color-white, #fff);
  font-size: 14px;
  font-weight: 500;
  border-radius: 0 var(--of-radius-lg, 8px) var(--of-radius-lg, 8px) 0;
}

.of-mobile-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 1px dashed var(--of-border-subtle, var(--of-color-gray-300, #d1d5db));
  border-radius: var(--of-radius-lg, 8px);
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
  font-size: 14px;
  cursor: pointer;
  min-height: 44px;
}

.of-mobile-add-btn:active {
  background: var(--of-surface-muted, var(--of-color-gray-50, #f9fafb));
}
</style>
