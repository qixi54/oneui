<script setup lang="ts">
import { computed } from "vue";
import Drawer from "../overlay/Drawer.vue";
import Modal from "../overlay/Modal.vue";
import SidePanel from "../overlay/SidePanel.vue";
import DetailContent from "./DetailContent.vue";
import { normalizeDetailPresentation } from "./databaseViewUtils";
import type {
  DatabaseDetailWorkspaceModeOption,
  DatabaseDetailWorkspacePropertyItem,
  DatabaseViewDetailHostSlots,
  DatabaseViewDetailPresentation,
  DatabaseViewResolvedDetailPresentation,
} from "../../contracts/database";

interface Props {
  visible: boolean;
  title: string;
  rowId: string;
  recordId: string;
  viewType?: string;
  description?: string;
  presentation: Exclude<DatabaseViewDetailPresentation, "auto">;
  source?: string;
  sidePanelWidth?: number;
  drawerWidth?: number;
  canSwitchPresentation: boolean;
  workspaceModes: DatabaseDetailWorkspaceModeOption[];
  propertyItems: DatabaseDetailWorkspacePropertyItem[];
  readonly?: boolean;
  hasDraftChanges?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  viewType: "detail",
  description: "",
  source: undefined,
  sidePanelWidth: 400,
  drawerWidth: 600,
  readonly: false,
  hasDraftChanges: false,
});

const emit = defineEmits<{
  close: [];
  save: [];
  delete: [string];
  commit: [rowId: string, fieldId: string, value: unknown];
  "update:side-panel-width": [number];
  "update:drawer-width": [number];
  "update:presentation": [Exclude<DatabaseViewDetailPresentation, "auto">];
}>();

defineSlots<DatabaseViewDetailHostSlots>();

const normalizedPresentation = computed<DatabaseViewResolvedDetailPresentation>(() =>
  normalizeDetailPresentation(props.presentation),
);

const isSidePanel = computed(() => normalizedPresentation.value === "side-panel");
const isDialog = computed(() => normalizedPresentation.value === "drawer");
const isFullscreen = computed(() => normalizedPresentation.value === "fullscreen");

function handleClose(nextVisible: boolean) {
  if (!nextVisible) {
    emit("close");
  }
}

function handleCommit(rowId: string, fieldId: string, value: unknown) {
  emit("commit", rowId, fieldId, value);
}

function handleDelete(rowId: string) {
  emit("delete", rowId);
}

function handlePresentationUpdate(mode: Exclude<DatabaseViewDetailPresentation, "auto">) {
  emit("update:presentation", mode);
}
</script>

<template>
  <SidePanel
    v-if="visible && isSidePanel"
    :model-value="visible"
    :width="sidePanelWidth"
    :mode="'persistent'"
    :resizable="true"
    @update:model-value="handleClose"
    @update:width="emit('update:side-panel-width', $event)"
  >
    <DetailContent
      :title="title"
      :row-id="rowId"
      :record-id="recordId"
      :view-type="viewType"
      :description="description"
      :presentation="presentation"
      :source="source"
      :can-switch-presentation="canSwitchPresentation"
      :workspace-modes="workspaceModes"
      :property-items="propertyItems"
      :readonly="readonly"
      :has-draft-changes="hasDraftChanges"
      @close="emit('close')"
      @save="emit('save')"
      @delete="handleDelete"
      @commit="handleCommit"
      @update:presentation="handlePresentationUpdate"
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
    </DetailContent>
  </SidePanel>

  <Modal
    v-else-if="visible && isDialog"
    :model-value="visible"
    :width="`${drawerWidth}px`"
    :closable="false"
    :mask-closable="true"
    :body-paddingless="true"
    @update:model-value="handleClose"
  >
    <DetailContent
      :title="title"
      :row-id="rowId"
      :record-id="recordId"
      :view-type="viewType"
      :description="description"
      :presentation="presentation"
      :source="source"
      :can-switch-presentation="canSwitchPresentation"
      :workspace-modes="workspaceModes"
      :property-items="propertyItems"
      :readonly="readonly"
      :has-draft-changes="hasDraftChanges"
      @close="emit('close')"
      @save="emit('save')"
      @delete="handleDelete"
      @commit="handleCommit"
      @update:presentation="handlePresentationUpdate"
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
    </DetailContent>
  </Modal>

  <Drawer
    v-else-if="visible"
    :model-value="visible"
    :width="drawerWidth"
    :fullscreen="isFullscreen"
    :mask-closable="false"
    :resizable="!isFullscreen"
    @update:model-value="handleClose"
    @update:width="emit('update:drawer-width', $event)"
  >
    <DetailContent
      :title="title"
      :row-id="rowId"
      :record-id="recordId"
      :view-type="viewType"
      :description="description"
      :presentation="presentation"
      :source="source"
      :can-switch-presentation="canSwitchPresentation"
      :workspace-modes="workspaceModes"
      :property-items="propertyItems"
      :readonly="readonly"
      :has-draft-changes="hasDraftChanges"
      @close="emit('close')"
      @save="emit('save')"
      @delete="handleDelete"
      @commit="handleCommit"
      @update:presentation="handlePresentationUpdate"
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
    </DetailContent>
  </Drawer>
</template>
