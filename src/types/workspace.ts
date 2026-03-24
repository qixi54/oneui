export type WorkspaceDetailPresentation = "auto" | "side-panel" | "sheet" | "full-page";

export interface WorkspaceMetaItem {
  key: string;
  label: string;
  value: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "accent";
}

export interface WorkspaceFilterItem {
  id: string;
  label: string;
  value?: string;
  active?: boolean;
  removable?: boolean;
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "accent";
}

export interface WorkspaceToolbarAction {
  id: string;
  label: string;
  icon?: string;
  tone?: "default" | "ghost" | "primary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
}

export type WorkspaceDetailActionItem = WorkspaceToolbarAction;

export interface WorkspacePreviewItem {
  id: string;
  label: string;
  value: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "accent";
  icon?: string;
  description?: string;
}

export interface WorkspaceActivityItem {
  id: string;
  author: string;
  content: string;
  time: string;
  action?: string;
  authorInitial?: string;
  avatarColor?: string;
}

export interface WorkspacePersistenceSnapshot {
  activeViewId?: string;
  activeRecordId?: string | null;
  activeFilterId?: string | null;
  activeTabId?: string;
  searchKeyword?: string;
  detailPresentation?: WorkspaceDetailPresentation;
  sidePanelWidth?: number;
  drawerWidth?: number;
}

export interface WorkspaceSlotProps<
  TRecord = unknown,
  TMeta extends WorkspaceMetaItem = WorkspaceMetaItem,
> {
  record: TRecord | null;
  recordId: string | null;
  title: string;
  subtitle?: string;
  description?: string;
  meta: TMeta[];
  filters: WorkspaceFilterItem[];
  actions: WorkspaceToolbarAction[];
  activeViewId: string;
  detailPresentation: WorkspaceDetailPresentation;
  readonly: boolean;
}

export interface WorkspaceAdapter<
  TRecord = unknown,
  TMeta extends WorkspaceMetaItem = WorkspaceMetaItem,
> {
  getRecordId: (record: TRecord) => string;
  getTitle: (record: TRecord) => string;
  getSubtitle?: (record: TRecord) => string | undefined;
  getDescription?: (record: TRecord) => string | undefined;
  getMeta?: (record: TRecord) => TMeta[];
  getSearchText?: (record: TRecord) => string;
}
