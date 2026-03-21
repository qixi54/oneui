<script setup lang="ts">
import { computed } from "vue";
import Drawer from "../overlay/Drawer.vue";
import SidePanel from "../overlay/SidePanel.vue";
import DatabaseDetailWorkspace from "./DatabaseDetailWorkspace.vue";
import type { DatabaseViewResolvedDetailPresentation } from "../../contracts/database";
import type {
  DatabaseDetailPropertyItem,
  DatabaseWorkspaceModeOption,
} from "./databaseViewUtils";

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
  "update:width": [value: number];
  "update:presentation": [value: DatabaseViewResolvedDetailPresentation];
}>();

function handleCommit(rowId: string, fieldId: string, value: unknown) {
  emit("commit", rowId, fieldId, value);
}

const overlayComponent = computed(() =>
  props.presentation === "side-panel" ? SidePanel : Drawer,
);

const overlayProps = computed(() => {
  if (props.presentation === "side-panel") {
    return {
      modelValue: props.visible,
      title: props.title,
      width: props.sidePanelWidth,
      resizable: true,
      mode: "persistent" as const,
    };
  }

  return {
    modelValue: props.visible,
    title: props.title,
    width: props.drawerWidth,
    resizable: props.presentation !== "full-page",
    fullscreen: props.presentation === "full-page",
    maskClosable: true,
  };
});

defineOptions({ name: "DatabaseDetailPresenter" });
</script>

<template>
  <component
    :is="overlayComponent"
    v-if="props.visible"
    v-bind="overlayProps"
    @update:width="emit('update:width', $event)"
    @update:model-value="emit('close')"
  >
    <DatabaseDetailWorkspace
      :row-id="props.rowId"
      :record-id="props.recordId"
      :title="props.title"
      :description="props.description"
      :view-type="props.viewType"
      :presentation="props.presentation"
      :can-switch-presentation="props.canSwitchPresentation"
      :workspace-modes="props.workspaceModes"
      :property-items="props.propertyItems"
      :readonly="props.readonly"
      :has-draft-changes="props.hasDraftChanges"
      @commit="handleCommit"
      @save="emit('save')"
      @delete="emit('delete', $event)"
      @close="emit('close')"
      @update:presentation="emit('update:presentation', $event)"
    />
  </component>
</template>
