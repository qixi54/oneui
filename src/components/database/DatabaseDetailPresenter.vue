<script setup lang="ts">
import { computed } from "vue";
import Drawer from "../overlay/Drawer.vue";
import SidePanel from "../overlay/SidePanel.vue";
import DatabaseDetailWorkspace from "./DatabaseDetailWorkspace.vue";
import {
  normalizeDetailPresentation,
  resolveDetailPresenter,
} from "./databaseViewUtils";
import type {
  DatabaseDetailWorkspaceModeOption,
  DatabaseDetailWorkspacePropertyItem,
  DatabaseDetailPresenterSlots,
  DatabaseDetailPresenterResolution,
  DatabaseViewDetailPresentation,
} from "../../contracts/database";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title: string;
    rowId: string;
    recordId?: string;
    viewType: string;
    description: string;
    presentation: Exclude<DatabaseViewDetailPresentation, "auto">;
    source?: string;
    sidePanelWidth: number;
    drawerWidth: number;
    canSwitchPresentation?: boolean;
    workspaceModes?: DatabaseDetailWorkspaceModeOption[];
    propertyItems?: DatabaseDetailWorkspacePropertyItem[];
    readonly?: boolean;
    hasDraftChanges?: boolean;
  }>(),
  {
    recordId: "",
    source: undefined,
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
  "update:presentation": [value: Exclude<DatabaseViewDetailPresentation, "auto">];
}>();

defineSlots<DatabaseDetailPresenterSlots>();

type PresenterComponent = typeof SidePanel | typeof Drawer;

function handleCommit(rowId: string, fieldId: string, value: unknown) {
  emit("commit", rowId, fieldId, value);
}

const presenter = computed<DatabaseDetailPresenterResolution>(() =>
  resolveDetailPresenter({ presentation: normalizeDetailPresentation(props.presentation) }),
);

const overlayComponent = computed<PresenterComponent>(() =>
  presenter.value.shell === "side-panel" ? SidePanel : Drawer,
);

const overlayProps = computed(() => {
  if (presenter.value.shell === "side-panel") {
    return {
      modelValue: props.visible,
      title: props.title,
      width: props.sidePanelWidth,
      resizable: presenter.value.resizable,
      mode: presenter.value.mode,
      maskClosable: presenter.value.maskClosable,
    };
  }

  return {
    modelValue: props.visible,
    title: props.title,
    width: props.drawerWidth,
    resizable: presenter.value.resizable,
    fullscreen: presenter.value.fullscreen,
    maskClosable: presenter.value.maskClosable,
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
      :source="props.source"
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
    >
      <template v-if="$slots.header" #header="slotProps">
        <slot name="header" v-bind="slotProps" />
      </template>
      <template v-if="$slots.actions" #actions="slotProps">
        <slot name="actions" v-bind="slotProps" />
      </template>
      <template v-if="$slots.preview" #preview="slotProps">
        <slot name="preview" v-bind="slotProps" />
      </template>
      <template v-if="$slots.activity" #activity="slotProps">
        <slot name="activity" v-bind="slotProps" />
      </template>
      <template v-if="$slots.footer" #footer="slotProps">
        <slot name="footer" v-bind="slotProps" />
      </template>
    </DatabaseDetailWorkspace>
  </component>
</template>
