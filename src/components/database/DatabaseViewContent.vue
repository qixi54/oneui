<script setup lang="ts">
import DataTable from "../table/DataTable.vue";
import KanbanBoard from "../kanban/KanbanBoard.vue";
import GalleryView from "../gallery/GalleryView.vue";
import GanttTimeline from "../timeline/GanttTimeline.vue";
import type { DataRecord, TableColumn, TableSchema, ViewConfig } from "../../types";

const props = withDefaults(
  defineProps<{
    viewType: ViewConfig["viewType"];
    records: DataRecord[];
    schema?: TableSchema | null;
    view: ViewConfig;
    columns: TableColumn[];
    readonly?: boolean;
    enableFieldManagement?: boolean;
  }>(),
  {
    schema: null,
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
  "record-change": [payload: { recordId: string; startDate?: string; endDate?: string }];
  "update:records": [records: DataRecord[]];
}>();

defineOptions({ name: "DatabaseViewContent" });
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
      @card-click="emit('card-click', $event)"
      @update:columns="() => undefined"
      @add-column="emit('add-column')"
    />

    <GalleryView
      v-else-if="props.viewType === 'gallery'"
      class="of-database-view__view of-database-view__view--gallery"
      :records="props.records"
      :schema="props.schema ?? undefined"
      :view="props.view"
      @card-click="emit('card-click', $event)"
      @add="emit('add')"
    />

    <GanttTimeline
      v-else-if="props.viewType === 'timeline'"
      class="of-database-view__view of-database-view__view--timeline"
      :records="props.records"
      :schema="props.schema ?? undefined"
      :view-config="props.view"
      @row-click="emit('row-click', $event)"
      @record-change="emit('record-change', $event)"
      @update:records="emit('update:records', $event)"
    />

    <div v-else class="of-database-view__detail-anchor" />
  </div>
</template>
