<script setup lang="ts">
import type { CSSProperties } from "vue";
import MobileListView from "./MobileListView.vue";
import DetailSheet from "./DetailSheet.vue";
import type { FieldDef as CellFieldDef } from "./FieldCell.vue";
import type { ColorMap, TableColumn } from "../../types";

type TableRowRecord = Record<string, unknown> & { id: string };

const props = withDefaults(
  defineProps<{
    rows: TableRowRecord[];
    columns: TableColumn[];
    fieldDefs?: CellFieldDef[];
    selectable?: boolean;
    addable?: boolean;
    statusColorMap?: ColorMap;
    readonly?: boolean;
    densityClass?: string;
    densityStyle?: CSSProperties;
    detailVisible?: boolean;
    detailRow?: TableRowRecord | null;
  }>(),
  {
    fieldDefs: () => [],
    selectable: true,
    addable: true,
    statusColorMap: undefined,
    readonly: false,
    densityClass: "",
    densityStyle: undefined,
    detailVisible: false,
    detailRow: null,
  },
);

const emit = defineEmits<{
  "row-click": [row: TableRowRecord];
  "add-row": [];
  "close-detail": [];
  "detail-save": [payload: { rowId: string; fields: Record<string, unknown> }];
  "row-delete": [rowId: string];
  "cell-edit": [payload: { rowId: string; fieldId: string; value: unknown }];
}>();
</script>

<template>
  <div :class="props.densityClass" :style="props.densityStyle">
    <MobileListView
      :rows="props.rows"
      :columns="props.columns"
      :selectable="props.selectable"
      :addable="props.addable"
      :status-color-map="props.statusColorMap"
      :readonly="props.readonly"
      @row-click="(row) => emit('row-click', row as TableRowRecord)"
      @add-row="emit('add-row')"
    >
      <template v-if="$slots.cell" #cell="cellProps">
        <slot name="cell" v-bind="cellProps" />
      </template>
    </MobileListView>

    <DetailSheet
      v-if="props.detailRow"
      :row="props.detailRow"
      :columns="props.columns"
      :field-defs="props.fieldDefs"
      :visible="props.detailVisible"
      @close="emit('close-detail')"
      @save="(payload) => emit('detail-save', payload)"
      @delete="(id) => emit('row-delete', id)"
      @cell-edit="(payload) => emit('cell-edit', payload)"
    />
  </div>
</template>
