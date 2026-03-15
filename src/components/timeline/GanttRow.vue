<script setup lang="ts">
import { computed, ref } from "vue";
import type { ColorMap } from "../../types";
import {
  DEFAULT_PRIORITY_MAP,
  DEFAULT_STATUS_MAP,
  resolveBadge,
  mergeColorMap,
} from "../../composables/useBadge";

interface GanttRowItem {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  startDate: string;
  endDate: string;
  barColor?: string;
}

const props = withDefaults(
  defineProps<{
    item: GanttRowItem;
    dayWidth: number;
    offsetDays: number;
    durationDays: number;
    totalDays: number;
    readonly?: boolean;
    priorityColorMap?: ColorMap;
    statusColorMap?: ColorMap;
  }>(),
  {
    readonly: false,
  },
);

const emit = defineEmits<{
  click: [item: GanttRowItem];
  change: [payload: { id: string; offsetDays: number; durationDays: number; startDate: string; endDate: string }];
}>();

const dragging = ref(false);
const dragMode = ref<"move" | "resize-end" | null>(null);
let dragStartX = 0;
let dragStartOffset = 0;
let dragStartDuration = 0;

const trackWidth = computed(() => props.totalDays * props.dayWidth);
const leftPx = computed(() => props.offsetDays * props.dayWidth);
const barWidthPx = computed(() => Math.max(props.durationDays, 1) * props.dayWidth);

const resolvedPriority = computed(() =>
  resolveBadge(props.item.priority || "", mergeColorMap(DEFAULT_PRIORITY_MAP, props.priorityColorMap)),
);

const priorityBarStyle = computed(() => {
  if (props.item.barColor) return { background: props.item.barColor, color: "var(--of-color-gray-800)" };
  return {
    background: resolvedPriority.value.style.background,
    color: resolvedPriority.value.style.color,
  };
});

const priorityBadgeStyle = computed(() => resolvedPriority.value.style);

const dotColor = computed(() => {
  const badge = resolveBadge(props.item.status || "", mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap));
  return badge.dot ?? badge.style.color;
});

const barDateLabel = computed(() => {
  const fmt = (d: string) => {
    const date = new Date(`${d}T00:00:00`);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  };
  return `${fmt(props.item.startDate)} - ${fmt(props.item.endDate)}`;
});

function beginDrag(evt: MouseEvent, mode: "move" | "resize-end") {
  if (props.readonly) return;
  evt.preventDefault();
  evt.stopPropagation();

  dragging.value = true;
  dragMode.value = mode;
  dragStartX = evt.clientX;
  dragStartOffset = props.offsetDays;
  dragStartDuration = props.durationDays;

  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", endDrag);
}

function onDragMove(evt: MouseEvent) {
  if (!dragging.value || !dragMode.value) return;
  const deltaDays = Math.round((evt.clientX - dragStartX) / props.dayWidth);

  if (dragMode.value === "move") {
    const offsetDays = Math.max(0, Math.min(dragStartOffset + deltaDays, props.totalDays - 1));
    emit("change", {
      id: props.item.id,
      offsetDays,
      durationDays: dragStartDuration,
      startDate: props.item.startDate,
      endDate: props.item.endDate,
    });
    return;
  }

  const durationDays = Math.max(1, dragStartDuration + deltaDays);
  const maxDuration = Math.max(1, props.totalDays - props.offsetDays);
  emit("change", {
    id: props.item.id,
    offsetDays: props.offsetDays,
    durationDays: Math.min(durationDays, maxDuration),
    startDate: props.item.startDate,
    endDate: props.item.endDate,
  });
}

function endDrag() {
  dragging.value = false;
  dragMode.value = null;
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", endDrag);
}
</script>

<template>
  <div class="gantt-row" @click="emit('click', item)">
    <div class="gantt-row__label">
      <span class="gantt-row__dot" :style="{ backgroundColor: dotColor }" />
      <span class="gantt-row__title">{{ item.title }}</span>
      <span class="gantt-row__priority" :style="priorityBadgeStyle">{{ item.priority }}</span>
    </div>

    <div class="gantt-row__chart" :style="{ width: `${trackWidth}px` }">
      <div
        class="gantt-row__bar"
        :class="{ 'gantt-row__bar--dragging': dragging }"
        :style="{
          left: `${leftPx}px`,
          width: `${barWidthPx}px`,
          backgroundColor: priorityBarStyle.background,
          color: priorityBarStyle.color,
        }"
        @mousedown="beginDrag($event, 'move')"
      >
        <span class="gantt-row__bar-label">{{ barDateLabel }}</span>
        <span class="gantt-row__handle" @mousedown="beginDrag($event, 'resize-end')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gantt-row {
  display: flex;
  align-items: center;
  width: fit-content;
  min-width: 100%;
  border-bottom: 1px solid var(--of-color-gray-100);
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.gantt-row:hover {
  background: var(--of-color-gray-50);
}

.gantt-row__label {
  width: 240px;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-right: 1px solid var(--of-color-gray-200);
  overflow: hidden;
  position: sticky;
  left: 0;
  background: var(--of-color-bg-elevated);
  z-index: 1;
}

.gantt-row__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.gantt-row__title {
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: var(--of-color-gray-800) !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.gantt-row__priority {
  font-family: var(--of-font-sans) !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  padding: 1px 5px;
  border-radius: var(--of-radius-sm);
  flex-shrink: 0;
}

.gantt-row__chart {
  height: 40px;
  padding: 8px 0;
  position: relative;
  overflow: hidden;
  background-image: repeating-linear-gradient(
    to right,
    transparent,
    transparent calc(var(--day-width) - 1px),
    var(--of-color-gray-100) calc(var(--day-width) - 1px),
    var(--of-color-gray-100) var(--day-width)
  );
}

.gantt-row__bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  border-radius: var(--of-radius-md);
  display: flex;
  align-items: center;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  min-width: 40px;
  transition: filter 0.15s ease;
  user-select: none;
}

.gantt-row__bar:hover {
  filter: brightness(0.95);
}

.gantt-row__bar--dragging {
  filter: brightness(0.93);
}

.gantt-row__bar-label {
  font-family: var(--of-font-sans) !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.gantt-row__handle {
  width: 8px;
  height: 100%;
  margin-left: auto;
  flex-shrink: 0;
  cursor: ew-resize;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
}
</style>
