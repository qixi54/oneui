import { computed, ref, type ComputedRef, type Ref } from "vue";
import type {
  DatabaseViewDetailPresentation,
  DatabaseViewResolvedDetailPresentation,
  DatabaseViewViewTab,
} from "../contracts/database";
import {
  DEFAULT_DRAWER_WIDTH,
  DEFAULT_SIDE_PANEL_WIDTH,
  clampWorkspaceWidth,
  useDatabaseViewport,
  useDatabaseWorkspaceState,
} from "./useDatabaseWorkspace";
import type { DataRecord, TableSchema } from "../types";
import {
  buildDetailColumns,
  buildDetailFieldDefs,
  buildDetailPropertyItems,
  buildDetailWorkspaceDescription,
  buildDetailWorkspaceTitle,
  buildWorkspaceModes,
  partitionDetailColumns,
  resolveDetailPresentation,
  toDetailRow,
} from "./databaseDetailWorkspaceUtils";

interface DetailEmptyAction {
  label: string;
  onClick: () => void;
}

interface UseDatabaseDetailWorkspaceOptions {
  tableId: Readonly<Ref<string | undefined>>;
  activeViewId: Readonly<ComputedRef<string>>;
  currentViewId: Readonly<Ref<string>>;
  selectedRecordId: Readonly<Ref<string | null | undefined>>;
  selectedRecord: Readonly<ComputedRef<DataRecord | null>>;
  resolvedSchema: Readonly<ComputedRef<TableSchema | null | undefined>>;
  resolvedRecords: Readonly<ComputedRef<DataRecord[]>>;
  viewTabs: Readonly<ComputedRef<DatabaseViewViewTab[]>>;
  detailPresentation: Readonly<Ref<DatabaseViewDetailPresentation>>;
  initialSearchKeyword?: string;
  initialDetailPresentation?: DatabaseViewResolvedDetailPresentation | null;
  initialSidePanelWidth?: number;
  initialDrawerWidth?: number;
  initialWorkspaceActive?: boolean;
  onSelectRecord: (record: DataRecord | string | null) => void;
  onClearSelectedRecord: () => void;
  onSetRecords: (next: DataRecord[]) => void;
  onCellEdit: (payload: { rowId: string; fieldId: string; value: unknown }) => void;
  onSwitchView: (viewId: string) => void;
}

export function useDatabaseDetailWorkspace(
  options: UseDatabaseDetailWorkspaceOptions,
) {
  const { isMobileViewport } = useDatabaseViewport();
  const {
    preferredDetailPresentation,
    sidePanelWidth,
    drawerWidth,
    searchKeyword,
  } = useDatabaseWorkspaceState({
    tableId: options.tableId,
    activeViewId: options.activeViewId,
    initialSearchKeyword: options.initialSearchKeyword ?? "",
    initialDetailPresentation: options.initialDetailPresentation ?? null,
    initialSidePanelWidth: options.initialSidePanelWidth,
    initialDrawerWidth: options.initialDrawerWidth,
  });

  const detailDraftFields = ref<Record<string, unknown>>({});
  const detailWorkspaceActive = ref(Boolean(options.initialWorkspaceActive));

  const detailColumns = computed(() =>
    buildDetailColumns(options.resolvedSchema.value, options.resolvedRecords.value),
  );
  const detailFieldDefs = computed(() =>
    buildDetailFieldDefs(options.resolvedSchema.value, options.resolvedRecords.value),
  );
  const detailRow = computed(() => toDetailRow(options.selectedRecord.value));
  const detailWorkspaceRow = computed(() => ({
    ...detailRow.value,
    ...detailDraftFields.value,
  }));
  const detailWorkspaceTitle = computed(() =>
    buildDetailWorkspaceTitle(options.selectedRecord.value),
  );
  const detailColumnPartitions = computed(() =>
    partitionDetailColumns(detailColumns.value, detailFieldDefs.value),
  );
  const detailWorkspaceDescription = computed(() =>
    buildDetailWorkspaceDescription(
      detailColumnPartitions.value.contentColumns,
      detailWorkspaceRow.value,
    ),
  );
  const detailPropertyItems = computed(() =>
    buildDetailPropertyItems({
      columns: detailColumnPartitions.value.propertyColumns,
      fieldDefs: detailFieldDefs.value,
      row: detailWorkspaceRow.value,
    }),
  );
  const hasDetailDraftChanges = computed(
    () => Object.keys(detailDraftFields.value).length > 0,
  );
  const showDetailWorkspace = computed(
    () => detailWorkspaceActive.value && Boolean(options.selectedRecord.value),
  );
  const resolvedDetailPresentation = computed(() =>
    resolveDetailPresentation({
      requested: options.detailPresentation.value,
      preferred: preferredDetailPresentation.value,
      isMobileViewport: isMobileViewport.value,
    }),
  );
  const workspaceModes = computed(() =>
    buildWorkspaceModes(isMobileViewport.value),
  );
  const canSwitchDetailPresentation = computed(
    () => options.detailPresentation.value === "auto",
  );

  function resetDraftFields() {
    detailDraftFields.value = {};
  }

  function activateDetailWorkspace() {
    detailWorkspaceActive.value = true;
  }

  function openRecord(record: DataRecord | null) {
    if (!record) return;
    activateDetailWorkspace();
    resetDraftFields();
    options.onSelectRecord(record);
  }

  function findRecordById(recordId: string | undefined | null) {
    if (!recordId) return null;
    return (
      options.resolvedRecords.value.find((record) => record.id === recordId) ?? null
    );
  }

  const detailEmptyAction = computed<DetailEmptyAction | undefined>(() => {
    if (options.activeViewId.value !== "detail") return undefined;

    const firstRecord = options.resolvedRecords.value[0];
    if (firstRecord) {
      return {
        label: "打开第一条记录",
        onClick: () => openRecord(firstRecord),
      };
    }

    const fallbackViewId =
      options.viewTabs.value.find((tab) => tab.value !== "detail")?.value ?? null;
    if (!fallbackViewId) return undefined;
    return {
      label: "返回列表",
      onClick: () => options.onSwitchView(fallbackViewId),
    };
  });

  function setPreferredDetailPresentation(
    mode: DatabaseViewResolvedDetailPresentation,
  ) {
    if (!canSwitchDetailPresentation.value) return;
    preferredDetailPresentation.value = mode;
  }

  function handleRowSelect(record: DataRecord) {
    openRecord(record);
  }

  function handleCardClick(
    payload: { id?: string } | Record<string, unknown> | null | undefined,
  ) {
    openRecord(findRecordById((payload as { id?: string } | null | undefined)?.id));
  }

  function handleTimelineRowClick(payload: {
    id?: string;
    sourceRecordId?: string;
  }) {
    openRecord(findRecordById(payload.sourceRecordId ?? payload.id));
  }

  function handleDetailClose() {
    detailWorkspaceActive.value = false;
    resetDraftFields();
    options.onClearSelectedRecord();
  }

  function handleDetailDelete(rowId: string) {
    const next = options.resolvedRecords.value.filter((record) => record.id !== rowId);
    options.onSetRecords(next);
    handleDetailClose();
  }

  function handleDetailWorkspaceCommit(
    _rowId: string,
    fieldId: string,
    value: unknown,
  ) {
    detailDraftFields.value = {
      ...detailDraftFields.value,
      [fieldId]: value,
    };
  }

  function handleDetailWorkspaceSave() {
    const activeRecord = options.selectedRecord.value;
    if (!activeRecord) return;

    const fields = { ...detailDraftFields.value };
    for (const [fieldId, value] of Object.entries(fields)) {
      options.onCellEdit({ rowId: activeRecord.id, fieldId, value });
    }

    handleDetailClose();
  }

  function handleSidePanelWidthUpdate(width: number) {
    sidePanelWidth.value = clampWorkspaceWidth(width, DEFAULT_SIDE_PANEL_WIDTH);
  }

  function handleDrawerWidthUpdate(width: number) {
    drawerWidth.value = clampWorkspaceWidth(width, DEFAULT_DRAWER_WIDTH);
  }

  return {
    searchKeyword,
    sidePanelWidth,
    drawerWidth,
    detailWorkspaceRow,
    detailWorkspaceTitle,
    detailWorkspaceDescription,
    detailPropertyItems,
    hasDetailDraftChanges,
    showDetailWorkspace,
    resolvedDetailPresentation,
    workspaceModes,
    canSwitchDetailPresentation,
    detailEmptyAction,
    setPreferredDetailPresentation,
    activateDetailWorkspace,
    handleRowSelect,
    handleCardClick,
    handleTimelineRowClick,
    handleDetailClose,
    handleDetailDelete,
    handleDetailWorkspaceCommit,
    handleDetailWorkspaceSave,
    handleSidePanelWidthUpdate,
    handleDrawerWidthUpdate,
  };
}
