<script setup lang="ts">
import { computed, ref, watch } from "vue";
import GanttRow from "./GanttRow.vue";
import type { DataRecord, GanttItem, TableSchema, Task, ViewConfig } from "../../types";
import { taskToDataRecord } from "../../types";

interface TimelineRow {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  startDate: string;
  endDate: string;
  barColor?: string;
  sourceRecordId?: string;
}

const props = withDefaults(
  defineProps<{
    records?: DataRecord[];
    schema?: TableSchema;
    viewConfig?: ViewConfig;
    startFieldId?: string;
    endFieldId?: string;
    labelFieldId?: string;
    // 兼容旧接口
    items?: GanttItem[];
    data?: Task[];
    startDate?: string;
    days?: number;
  }>(),
  {
    startFieldId: "startDate",
    endFieldId: "endDate",
    labelFieldId: "title",
    days: 30,
  },
);

const emit = defineEmits<{
  "row-click": [item: TimelineRow];
  "record-change": [payload: { recordId: string; startDate: string; endDate: string }];
  "update:records": [records: DataRecord[]];
}>();

const DAY_WIDTH = 40;

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(from: string, to: string): number {
  return Math.round((parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) / 86400000);
}

function addDays(base: string, offsetDays: number): string {
  const baseDate = parseDateOnly(base);
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + offsetDays);
  return formatDateOnly(date);
}

function normalizeDateValue(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function getDefaultStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

const normalizedRecords = computed<DataRecord[]>(() => {
  if (props.records?.length) return props.records;
  if (props.data?.length) return props.data.map(taskToDataRecord);
  return [];
});

const timelineRows = computed<TimelineRow[]>(() => {
  if (props.records?.length || props.data?.length) {
    const rows: TimelineRow[] = [];
    for (const record of normalizedRecords.value) {
      const startDate = normalizeDateValue(record.fields[props.startFieldId]);
      const endDate = normalizeDateValue(record.fields[props.endFieldId]);
      const title = record.fields[props.labelFieldId];
      if (!startDate || !endDate) continue;
      rows.push({
        id: record.id,
        sourceRecordId: record.id,
        title: typeof title === "string" && title ? title : record.id,
        status: typeof record.fields.status === "string" ? record.fields.status : "",
        priority: typeof record.fields.priority === "string" ? record.fields.priority : "",
        startDate,
        endDate,
      });
    }
    return rows;
  }

  return (props.items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    priority: item.priority,
    startDate: item.startDate,
    endDate: item.endDate,
    barColor: item.barColor,
  }));
});

const minStartDate = computed(() => {
  if (!timelineRows.value.length) return props.startDate || getDefaultStart();
  const minTs = Math.min(
    ...timelineRows.value.map((row) => parseDateOnly(row.startDate).getTime()),
  );
  const d = new Date(minTs);
  d.setDate(d.getDate() - 1);
  return formatDateOnly(d);
});

const maxEndDate = computed(() => {
  if (!timelineRows.value.length) {
    return addDays(props.startDate || getDefaultStart(), props.days - 1);
  }
  const maxTs = Math.max(...timelineRows.value.map((row) => parseDateOnly(row.endDate).getTime()));
  const d = new Date(maxTs);
  d.setDate(d.getDate() + 1);
  return formatDateOnly(d);
});

const resolvedStart = computed(() => props.startDate || minStartDate.value);
const totalDays = computed(() => {
  if (props.startDate) return props.days;
  return Math.max(props.days, daysBetween(resolvedStart.value, maxEndDate.value) + 1);
});

const dateHeaders = computed(() => {
  const dates: string[] = [];
  for (let i = 0; i < totalDays.value; i++) {
    dates.push(addDays(resolvedStart.value, i));
  }
  return dates;
});

const internalRows = ref<TimelineRow[]>([]);
watch(
  timelineRows,
  (rows) => {
    internalRows.value = rows.map((row) => ({ ...row }));
  },
  { immediate: true },
);

const rowLayout = computed(() => {
  const start = resolvedStart.value;
  const total = totalDays.value;
  return internalRows.value.map((row) => {
    const offsetDays = Math.max(0, daysBetween(start, row.startDate));
    const endOffset = Math.max(offsetDays, daysBetween(start, row.endDate));
    const durationDays = Math.max(1, endOffset - offsetDays + 1);
    return { row, offsetDays: Math.min(offsetDays, total - 1), durationDays };
  });
});

const todayStr = formatDateOnly(new Date());
function isTodayColumn(dateStr: string): boolean {
  return dateStr === todayStr;
}

function formatHeader(dateStr: string): string {
  const d = parseDateOnly(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

const todayLineLeft = computed(() => {
  const diff = daysBetween(resolvedStart.value, todayStr);
  if (diff < 0 || diff > totalDays.value - 1) return null;
  return diff * DAY_WIDTH + DAY_WIDTH / 2;
});

function handleRowChange(payload: {
  id: string;
  offsetDays: number;
  durationDays: number;
  startDate: string;
  endDate: string;
}) {
  const idx = internalRows.value.findIndex((row) => row.id === payload.id);
  if (idx === -1) return;

  const nextStart = addDays(resolvedStart.value, payload.offsetDays);
  const nextEnd = addDays(nextStart, payload.durationDays - 1);
  internalRows.value[idx] = {
    ...internalRows.value[idx],
    startDate: nextStart,
    endDate: nextEnd,
  };

  const sourceRecordId = internalRows.value[idx].sourceRecordId;
  if (!sourceRecordId) return;

  emit("record-change", {
    recordId: sourceRecordId,
    startDate: nextStart,
    endDate: nextEnd,
  });

  const nextRecords = normalizedRecords.value.map((record) => {
    if (record.id !== sourceRecordId) return record;
    return {
      ...record,
      fields: {
        ...record.fields,
        [props.startFieldId]: nextStart,
        [props.endFieldId]: nextEnd,
      },
    } satisfies DataRecord;
  });
  emit("update:records", nextRecords);
}
</script>

<template>
  <div class="gantt-timeline" :style="{ '--day-width': `${DAY_WIDTH}px` }">
    <div class="gantt-timeline__header">
      <div class="gantt-timeline__header-label">任务</div>

      <div class="gantt-timeline__header-dates" :style="{ width: `${totalDays * DAY_WIDTH}px` }">
        <div
          v-for="date in dateHeaders"
          :key="date"
          class="gantt-timeline__header-cell"
          :class="{ 'gantt-timeline__header-cell--today': isTodayColumn(date) }"
          :style="{ width: `${DAY_WIDTH}px` }"
        >
          {{ formatHeader(date) }}
        </div>

        <div
          v-if="todayLineLeft !== null"
          class="gantt-timeline__today-line"
          :style="{ left: `${todayLineLeft}px` }"
        />
      </div>
    </div>

    <div class="gantt-timeline__rows">
      <GanttRow
        v-for="entry in rowLayout"
        :key="entry.row.id"
        :item="entry.row"
        :offset-days="entry.offsetDays"
        :duration-days="entry.durationDays"
        :day-width="DAY_WIDTH"
        :total-days="totalDays"
        @change="handleRowChange"
        @click="emit('row-click', entry.row)"
      />

      <div v-if="rowLayout.length === 0" class="gantt-timeline__empty">暂无任务数据</div>
    </div>
  </div>
</template>

<style scoped>
.gantt-timeline {
  overflow: auto;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-lg);
  background: var(--of-color-bg-elevated);
  width: 100%;
}

.gantt-timeline__header {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--of-color-gray-200);
  background: var(--of-color-gray-50);
  position: sticky;
  top: 0;
  z-index: 2;
  width: fit-content;
  min-width: 100%;
}

.gantt-timeline__header-label {
  width: 240px;
  min-width: 240px;
  border-right: 1px solid var(--of-color-gray-200);
  padding: 8px 12px;
  font-family: var(--of-font-sans);
  font-size: 11px;
  color: var(--of-color-gray-500);
  display: flex;
  align-items: center;
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--of-color-gray-50);
}

.gantt-timeline__header-dates {
  display: flex;
  position: relative;
}

.gantt-timeline__header-cell {
  text-align: center;
  padding: 6px 2px;
  font-family: var(--of-font-sans);
  font-size: 10px;
  color: var(--of-color-gray-400);
  border-right: 1px solid var(--of-color-gray-100);
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
}

.gantt-timeline__header-cell--today {
  color: var(--of-color-primary-600);
  font-weight: 700;
  background: var(--of-color-primary-50);
}

.gantt-timeline__today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--of-color-primary-400);
  opacity: 0.6;
  pointer-events: none;
  transform: translateX(-50%);
  z-index: 1;
}

.gantt-timeline__rows {
  display: flex;
  flex-direction: column;
  width: fit-content;
  min-width: 100%;
}

.gantt-timeline__empty {
  padding: 40px;
  text-align: center;
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-color-gray-400);
}
</style>
