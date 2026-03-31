<script setup lang="ts">
import { computed, useSlots } from "vue";
import DataTable from "../table/DataTable.vue";
import KanbanBoard from "../kanban/KanbanBoard.vue";
import GalleryView from "../gallery/GalleryView.vue";
import GanttTimeline from "../timeline/GanttTimeline.vue";
import { taskToDataRecord } from "../../types";
import type { DataRecord, TableColumn, TableSchema, ViewConfig, KanbanColumnData, ColorMap, Task } from "../../types";
import type {
  DatabaseViewKanbanAppearance,
  DatabaseViewKanbanCardMoveEvent,
  DatabaseViewKanbanCardSlotContext,
  DatabaseViewKanbanColumnHeaderSlotContext,
  DatabaseViewKanbanQuickAddEvent,
  DatabaseViewKanbanSlots,
} from "../../contracts/database";

const props = withDefaults(
  defineProps<{
    viewType: ViewConfig["viewType"];
    records: DataRecord[];
    schema?: TableSchema | null;
    view: ViewConfig;
    columns: TableColumn[];
    priorityColorMap?: ColorMap;
    statusColorMap?: ColorMap;
    groupColorMap?: ColorMap;
    kanbanAppearance?: DatabaseViewKanbanAppearance;
    readonly?: boolean;
    enableFieldManagement?: boolean;
  }>(),
  {
    schema: null,
    priorityColorMap: undefined,
    statusColorMap: undefined,
    groupColorMap: undefined,
    kanbanAppearance: undefined,
    readonly: false,
    enableFieldManagement: false,
  },
);

const emit = defineEmits<{
  "cell-edit": [payload: { rowId: string; fieldId: string; value: unknown }];
  "schema-add-field": [fieldType: string];
  "schema-rename-field": [payload: { fieldId: string; newName: string }];
  "schema-change-field-type": [payload: { fieldId: string; newType: string }];
  "schema-hide-field": [fieldId: string];
  "schema-delete-field": [fieldId: string];
  "schema-duplicate-field": [fieldId: string];
  "row-click": [payload: unknown];
  "row-click-record": [record: DataRecord];
  "card-click": [payload: unknown];
  add: [];
  "add-column": [];
  "update:columns": [columns: KanbanColumnData[]];
  "record-change": [payload: { recordId: string; startDate?: string; endDate?: string }];
  "update:records": [records: DataRecord[]];
  "kanban-quick-add": [payload: DatabaseViewKanbanQuickAddEvent];
  "kanban-card-move": [payload: DatabaseViewKanbanCardMoveEvent];
}>();

defineSlots<DatabaseViewKanbanSlots>();
defineOptions({ name: "DatabaseViewContent" });

const slots = useSlots();
const recordMap = computed(() => new Map(props.records.map((record) => [record.id, record])));

function resolveRecord(task: Task): DataRecord {
  return recordMap.value.get(task.id) ?? taskToDataRecord(task);
}

function buildCardSlotContext(
  slotProps: Omit<DatabaseViewKanbanCardSlotContext, "record" | "fields">,
): DatabaseViewKanbanCardSlotContext {
  const record = resolveRecord(slotProps.task);
  return {
    ...slotProps,
    record,
    fields: record.fields,
  };
}

function buildColumnHeaderSlotContext(
  slotProps: Omit<DatabaseViewKanbanColumnHeaderSlotContext, "tasks" | "records">,
): DatabaseViewKanbanColumnHeaderSlotContext {
  const tasks = slotProps.column.tasks;
  return {
    ...slotProps,
    tasks,
    records: tasks.map((task) => resolveRecord(task)),
  };
}

function handleKanbanQuickAdd(
  payload: Omit<DatabaseViewKanbanQuickAddEvent, "record" | "fields">,
) {
  const record = resolveRecord(payload.task);
  emit("kanban-quick-add", {
    ...payload,
    record,
    fields: record.fields,
  });
}

function handleKanbanCardMove(
  payload: Omit<DatabaseViewKanbanCardMoveEvent, "record" | "fields" | "recordId">,
) {
  const record = resolveRecord(payload.task);
  emit("kanban-card-move", {
    ...payload,
    recordId: record.id,
    record,
    fields: record.fields,
  });
}
</script>

<template>
  <div class="of-database-view__content" :data-view="props.viewType">
    <DataTable
      v-if="props.viewType === 'table'"
      class="of-database-view__view of-database-view__view--table"
      :records="props.records"
      :schema="props.schema ?? undefined"
      :view="props.view"
      :columns="props.columns"
      :group-color-map="props.groupColorMap"
      :priority-color-map="props.priorityColorMap"
      :status-color-map="props.statusColorMap"
      :readonly="props.readonly"
      :enable-field-management="props.enableFieldManagement"
      @cell-edit="emit('cell-edit', $event)"
      @schema-add-field="emit('schema-add-field', $event)"
      @schema-rename-field="emit('schema-rename-field', $event)"
      @schema-change-field-type="emit('schema-change-field-type', $event)"
      @schema-hide-field="emit('schema-hide-field', $event)"
      @schema-delete-field="emit('schema-delete-field', $event)"
      @schema-duplicate-field="emit('schema-duplicate-field', $event)"
      @row-click="emit('row-click', $event)"
      @row-click-record="emit('row-click-record', $event)"
    />

    <KanbanBoard
      v-else-if="props.viewType === 'kanban'"
      class="of-database-view__view of-database-view__view--kanban"
      :records="props.records"
      :schema="props.schema ?? undefined"
      :view="props.view"
      :priority-color-map="props.priorityColorMap"
      :status-color-map="props.statusColorMap"
      :kanban-appearance="props.kanbanAppearance"
      @card-click="emit('card-click', $event)"
      @update:columns="emit('update:columns', $event)"
      @add-column="emit('add-column')"
      @quick-add="handleKanbanQuickAdd"
      @card-move="handleKanbanCardMove"
    >
      <template v-if="slots['kanban-column-header']" #column-header="slotProps">
        <slot name="kanban-column-header" v-bind="buildColumnHeaderSlotContext(slotProps)" />
      </template>
      <template v-if="slots['kanban-card']" #card="slotProps">
        <slot name="kanban-card" v-bind="buildCardSlotContext(slotProps)" />
      </template>
      <template v-if="slots['kanban-card-title']" #card-title="slotProps">
        <slot name="kanban-card-title" v-bind="buildCardSlotContext(slotProps)" />
      </template>
      <template v-if="slots['kanban-card-meta']" #meta="slotProps">
        <slot name="kanban-card-meta" v-bind="buildCardSlotContext(slotProps)" />
      </template>
      <template v-if="slots['kanban-card-tags']" #tags="slotProps">
        <slot name="kanban-card-tags" v-bind="buildCardSlotContext(slotProps)" />
      </template>
    </KanbanBoard>

    <GalleryView
      v-else-if="props.viewType === 'gallery'"
      class="of-database-view__view of-database-view__view--gallery"
      :records="props.records"
      :schema="props.schema ?? undefined"
      :view="props.view"
      :priority-color-map="props.priorityColorMap"
      :status-color-map="props.statusColorMap"
      @card-click="emit('card-click', $event)"
      @add="emit('add')"
    />

    <GanttTimeline
      v-else-if="props.viewType === 'timeline'"
      class="of-database-view__view of-database-view__view--timeline"
      :records="props.records"
      :schema="props.schema ?? undefined"
      :view-config="props.view"
      :priority-color-map="props.priorityColorMap"
      :status-color-map="props.statusColorMap"
      @row-click="emit('row-click', $event)"
      @record-change="emit('record-change', $event)"
      @update:records="emit('update:records', $event)"
    />

    <div v-else class="of-database-view__detail-anchor" />
  </div>
</template>
