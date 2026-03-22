<script setup lang="ts">
import DatabaseDetailPresenter from "./DatabaseDetailPresenter.vue";
import type { DatabaseViewResolvedDetailPresentation } from "../../contracts/database";
import type { DatabaseDetailPropertyItem, DatabaseWorkspaceModeOption } from "./databaseViewUtils";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title: string;
    rowId: string;
    recordId?: string;
    viewType: string;
    description: string;
    presentation: DatabaseViewResolvedDetailPresentation;
    sidePanelWidth: number;
    drawerWidth: number;
    canSwitchPresentation?: boolean;
    workspaceModes?: DatabaseWorkspaceModeOption[];
    propertyItems?: DatabaseDetailPropertyItem[];
    readonly?: boolean;
    hasDraftChanges?: boolean;
  }>(),
  {
    recordId: "",
    canSwitchPresentation: false,
    workspaceModes: () => [],
    propertyItems: () => [],
    readonly: false,
    hasDraftChanges: false,
  },
);

const emit = defineEmits<{
  commit: [rowId: string, fieldId: string, value: unknown];
  save: [];
  delete: [rowId: string];
  close: [];
  "update:side-panel-width": [width: number];
  "update:drawer-width": [width: number];
  "update:presentation": [value: DatabaseViewResolvedDetailPresentation];
}>();

defineOptions({ name: "DatabaseViewDetailHost" });

function handleWidthUpdate(width: number) {
  if (props.presentation === "side-panel") {
    emit("update:side-panel-width", width);
    return;
  }
  emit("update:drawer-width", width);
}
</script>

<template>
  <DatabaseDetailPresenter
    v-if="props.visible"
    :visible="props.visible"
    :title="props.title"
    :row-id="props.rowId"
    :record-id="props.recordId"
    :view-type="props.viewType"
    :description="props.description"
    :presentation="props.presentation"
    :side-panel-width="props.sidePanelWidth"
    :drawer-width="props.drawerWidth"
    :can-switch-presentation="props.canSwitchPresentation"
    :workspace-modes="props.workspaceModes"
    :property-items="props.propertyItems"
    :readonly="props.readonly"
    :has-draft-changes="props.hasDraftChanges"
    @commit="(rowId, fieldId, value) => emit('commit', rowId, fieldId, value)"
    @save="emit('save')"
    @delete="emit('delete', $event)"
    @close="emit('close')"
    @update:width="handleWidthUpdate"
    @update:presentation="emit('update:presentation', $event)"
  />
</template>
