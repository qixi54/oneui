import type { FieldDef as CellFieldDef } from "../table/FieldCell.vue";
import type {
  DatabaseViewDetailPresentation,
  DatabaseViewResolvedDetailPresentation,
  DatabaseViewViewTab,
} from "../../contracts/database";
import type { FilterCondition as ToolbarFilterCondition, FilterLogic } from "../../composables/useTableFilter";
import type {
  CellValue,
  DataRecord,
  FieldDef as SchemaFieldDef,
  TableColumn,
  TableSchema,
  ViewConfig,
} from "../../types";

type SchemaFilterCondition = NonNullable<ViewConfig["filters"]>[number];

export interface DatabaseViewListItem {
  id: string;
  name: string;
  type: ViewConfig["viewType"];
}

export interface DatabaseViewCurrentSort {
  field: string | null;
  order: "asc" | "desc" | null;
}

export interface DatabaseWorkspaceModeOption {
  value: DatabaseViewResolvedDetailPresentation;
  label: string;
}

export interface DatabaseDetailPropertyItem {
  key: string;
  label: string;
  field: CellFieldDef | null;
  value: CellValue | undefined;
  fallbackText: string;
}

export function cloneView(view: ViewConfig): ViewConfig {
  return {
    ...view,
    visibleFields: [...view.visibleFields],
    sorts: view.sorts?.map((item) => ({ ...item })),
    groups: view.groups?.map((item) => ({ ...item })),
    filters: view.filters?.map((item) => ({ ...item })),
    aggregations: view.aggregations?.map((item) => ({ ...item })),
    fixedColumns: view.fixedColumns ? [...view.fixedColumns] : undefined,
    galleryCardFields: view.galleryCardFields ? [...view.galleryCardFields] : undefined,
  };
}

export function inferFieldIdsFromRecords(records: DataRecord[]): string[] {
  const first = records[0];
  return first ? Object.keys(first.fields) : [];
}

export function getViewTypeIcon(viewType: ViewConfig["viewType"]): string {
  switch (viewType) {
    case "kanban":
      return "columns-3";
    case "gallery":
      return "image";
    case "timeline":
      return "calendar-range";
    case "detail":
      return "file-text";
    case "table":
    default:
      return "table-2";
  }
}

export function buildDatabaseViewTabs(options: {
  providedTabs?: DatabaseViewViewTab[];
  viewList: DatabaseViewListItem[];
  detailViewId: string;
}): DatabaseViewViewTab[] {
  const sourceTabs =
    options.providedTabs && options.providedTabs.length > 0
      ? options.providedTabs.map((tab) => ({ ...tab }))
      : options.viewList.map((view) => ({
          value: view.id,
          label: view.name,
          icon: getViewTypeIcon(view.type),
        }));

  const tabs: DatabaseViewViewTab[] = [];
  const seen = new Set<string>();
  for (const tab of sourceTabs) {
    if (seen.has(tab.value)) continue;
    seen.add(tab.value);
    tabs.push(tab);
  }

  if (!seen.has(options.detailViewId)) {
    tabs.push({ value: options.detailViewId, label: "详情", icon: getViewTypeIcon("detail") });
  }

  return tabs;
}

export function getVisibleFieldIds(schema?: TableSchema | null, records: DataRecord[] = []): string[] {
  const schemaFieldIds = schema?.fields?.filter((field) => !field.hidden).map((field) => field.id);
  if (schemaFieldIds?.length) return schemaFieldIds;
  return inferFieldIdsFromRecords(records);
}

export function buildFallbackView(schema?: TableSchema | null, records: DataRecord[] = []): ViewConfig {
  const visibleFields = getVisibleFieldIds(schema, records);

  return {
    viewId: "table",
    viewType: "table",
    name: schema?.name || "表格",
    visibleFields,
    sorts: [],
    groups: [],
    filters: [],
    fixedColumns: [],
  };
}

export function buildVirtualDetailView(
  detailViewId: string,
  schema?: TableSchema | null,
  records: DataRecord[] = [],
): ViewConfig {
  const visibleFields = getVisibleFieldIds(schema, records);

  return {
    viewId: detailViewId,
    viewType: "detail",
    name: "详情",
    visibleFields,
    sorts: [],
    groups: [],
    filters: [],
    fixedColumns: [],
  };
}

export function getFieldLabel(fieldId: string, schema?: TableSchema | null): string {
  return schema?.fields.find((field) => field.id === fieldId)?.name ?? fieldId;
}

export function resolveColumnType(field?: SchemaFieldDef): TableColumn["type"] {
  switch (field?.type) {
    case "number":
    case "currency":
    case "progress":
      return "number";
    case "date":
    case "datetime":
      return "date";
    case "select":
    case "multi_select":
      return "status";
    default:
      return "string";
  }
}

export function resolveCellFieldType(field?: SchemaFieldDef): CellFieldDef["type"] {
  switch (field?.type) {
    case "number":
      return "number";
    case "select":
      return "select";
    case "multi_select":
      return "multiselect";
    case "date":
      return "date";
    case "datetime":
      return "datetime";
    case "checkbox":
      return "checkbox";
    case "url":
      return "url";
    case "email":
      return "email";
    case "phone":
      return "phone";
    case "rating":
      return "rating";
    case "attachment":
      return "attachment";
    case "relation":
      return "relation";
    case "formula":
      return "text";
    case "currency":
      return "currency";
    case "richtext":
      return "richtext";
    case "auto_number":
      return "auto_number";
    case "creator":
      return "creator";
    case "progress":
      return "progress";
    case "text":
    default:
      return "text";
  }
}

export function buildTableColumns(view: ViewConfig, schema?: TableSchema | null, records: DataRecord[] = []) {
  const orderedFieldIds =
    (view.visibleFields?.length ?? 0) > 0 ? view.visibleFields : getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      key: fieldId,
      label: getFieldLabel(fieldId, schema),
      type: resolveColumnType(field),
      hidden: field?.hidden ?? false,
      width: field?.width,
    } satisfies TableColumn;
  });
}

export function buildDetailColumns(schema?: TableSchema | null, records: DataRecord[] = []) {
  const orderedFieldIds = getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      key: fieldId,
      label: getFieldLabel(fieldId, schema),
      type: resolveColumnType(field),
      hidden: field?.hidden ?? false,
      width: field?.width,
    } satisfies TableColumn;
  });
}

export function buildDetailFieldDefs(schema?: TableSchema | null, records: DataRecord[] = []) {
  const orderedFieldIds = getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      id: fieldId,
      type: resolveCellFieldType(field),
      label: getFieldLabel(fieldId, schema),
    } satisfies CellFieldDef;
  });
}

export function normalizeCellValue(value: CellValue | undefined): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  return String(value);
}

export function compareCellValues(a: CellValue | undefined, b: CellValue | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  const aNumber = Number(a);
  const bNumber = Number(b);
  const aNumeric = Number.isFinite(aNumber) && `${a}`.trim() !== "";
  const bNumeric = Number.isFinite(bNumber) && `${b}`.trim() !== "";
  if (aNumeric && bNumeric) return aNumber - bNumber;

  const aTime = Date.parse(String(a));
  const bTime = Date.parse(String(b));
  if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime;

  return normalizeCellValue(a).localeCompare(normalizeCellValue(b), "zh-Hans-CN");
}

export function evaluateFilterCondition(value: CellValue | undefined, condition: ToolbarFilterCondition): boolean {
  const rawValue = normalizeCellValue(value).trim();
  const expected = (condition.value ?? "").trim();
  const lowerValue = rawValue.toLowerCase();
  const lowerExpected = expected.toLowerCase();

  switch (condition.operator) {
    case "equals":
      return lowerValue === lowerExpected;
    case "not_equals":
      return lowerValue !== lowerExpected;
    case "contains":
      return lowerValue.includes(lowerExpected);
    case "not_contains":
      return !lowerValue.includes(lowerExpected);
    case "starts_with":
      return lowerValue.startsWith(lowerExpected);
    case "ends_with":
      return lowerValue.endsWith(lowerExpected);
    case "gt":
      return compareCellValues(value, expected) > 0;
    case "gte":
      return compareCellValues(value, expected) >= 0;
    case "lt":
      return compareCellValues(value, expected) < 0;
    case "lte":
      return compareCellValues(value, expected) <= 0;
    case "is_empty":
      return rawValue === "";
    case "is_not_empty":
      return rawValue !== "";
    default:
      return true;
  }
}

export function buildEmptyFilter(fieldId: string): ToolbarFilterCondition {
  return {
    id: `f_${Math.random().toString(36).slice(2, 8)}`,
    field: fieldId,
    operator: "contains",
    value: "",
  };
}

export function convertViewFiltersToToolbarFilters(filters: ViewConfig["filters"] = []): ToolbarFilterCondition[] {
  return filters.map((filter, index) => ({
    id: `f_${filter.fieldId}_${index}`,
    field: filter.fieldId,
    operator: (() => {
      switch (filter.operator) {
        case "eq":
          return "equals";
        case "neq":
          return "not_equals";
        case "gt":
          return "gt";
        case "lt":
          return "lt";
        case "is_empty":
          return "is_empty";
        case "is_not_empty":
          return "is_not_empty";
        case "contains":
        default:
          return "contains";
      }
    })(),
    value: filter.value == null ? "" : String(filter.value),
  }));
}

export function convertToolbarFiltersToViewFilters(
  filters: ToolbarFilterCondition[],
): NonNullable<ViewConfig["filters"]> {
  return filters
    .filter((filter) => filter.field)
    .map((filter): SchemaFilterCondition => {
      let operator: SchemaFilterCondition["operator"];
      switch (filter.operator) {
        case "equals":
          operator = "eq";
          break;
        case "not_equals":
          operator = "neq";
          break;
        case "gt":
        case "gte":
          operator = "gt";
          break;
        case "lt":
        case "lte":
          operator = "lt";
          break;
        case "is_empty":
          operator = "is_empty";
          break;
        case "is_not_empty":
          operator = "is_not_empty";
          break;
        case "contains":
        case "not_contains":
        case "starts_with":
        case "ends_with":
        default:
          operator = "contains";
          break;
      }

      return {
        fieldId: filter.field,
        operator,
        value: filter.value == null ? "" : filter.value,
      };
    });
}

export function toDetailRow(record: DataRecord | null): Record<string, unknown> & { id: string } {
  if (!record) {
    return { id: "__detail-empty__" };
  }

  return {
    id: record.id,
    ...record.fields,
  };
}

export function buildRenderedRecords(options: {
  records: DataRecord[];
  searchKeyword: string;
  visibleFieldIds: string[];
  filterConditions: ToolbarFilterCondition[];
  filterLogic: FilterLogic;
  sort: DatabaseViewCurrentSort;
}): DataRecord[] {
  let rows = [...options.records];

  if (options.searchKeyword.trim()) {
    const keyword = options.searchKeyword.trim().toLowerCase();
    rows = rows.filter((record) =>
      options.visibleFieldIds.some((fieldId) =>
        normalizeCellValue(record.fields[fieldId as keyof DataRecord["fields"]]).toLowerCase().includes(keyword),
      ),
    );
  }

  if (options.filterConditions.length > 0) {
    rows = rows.filter((record) => {
      const results = options.filterConditions.map((condition) => {
        const value = record.fields[condition.field as keyof DataRecord["fields"]];
        return evaluateFilterCondition(value as CellValue | undefined, condition);
      });

      return options.filterLogic === "and" ? results.every(Boolean) : results.some(Boolean);
    });
  }

  if (options.sort.field && options.sort.order) {
    rows.sort((a, b) => {
      const cmp = compareCellValues(
        a.fields[options.sort.field as keyof DataRecord["fields"]] as CellValue | undefined,
        b.fields[options.sort.field as keyof DataRecord["fields"]] as CellValue | undefined,
      );
      return options.sort.order === "desc" ? -cmp : cmp;
    });
  }

  return rows;
}

export function buildDetailWorkspaceTitle(record: DataRecord | null): string {
  const fields = record?.fields as Record<string, CellValue | undefined> | undefined;
  return (
    normalizeCellValue(fields?.title ?? fields?.name ?? fields?.subject ?? record?.id ?? "记录详情") || "记录详情"
  );
}

export function partitionDetailColumns(columns: TableColumn[], fieldDefs: CellFieldDef[]) {
  const contentFieldIds = new Set(fieldDefs.filter((field) => field.type === "richtext").map((field) => field.id));

  return {
    propertyColumns: columns.filter((column) => !contentFieldIds.has(column.key)),
    contentColumns: columns.filter((column) => contentFieldIds.has(column.key)),
  };
}

export function buildDetailWorkspaceDescription(
  columns: TableColumn[],
  row: Record<string, unknown>,
): string {
  return columns
    .map((column) => {
      const text = normalizeCellValue(row[column.key] as CellValue | undefined).trim();
      if (!text) return "";
      return `## ${column.label}\n\n${text}`;
    })
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function buildDetailPropertyItems(options: {
  columns: TableColumn[];
  fieldDefs: CellFieldDef[];
  row: Record<string, unknown>;
}): DatabaseDetailPropertyItem[] {
  return options.columns.map((column) => {
    const field = options.fieldDefs.find((item) => item.id === column.key) ?? null;
    const value = options.row[column.key] as CellValue | undefined;
    const fallbackText = normalizeCellValue(value).trim() || "—";

    return {
      key: column.key,
      label: column.label,
      field,
      value,
      fallbackText,
    };
  });
}

export function resolveDetailPresentation(options: {
  requested: DatabaseViewDetailPresentation;
  preferred: DatabaseViewResolvedDetailPresentation | null;
  isMobileViewport: boolean;
}): DatabaseViewResolvedDetailPresentation {
  if (options.requested !== "auto") {
    return options.requested;
  }

  if (options.preferred) {
    if (options.preferred === "side-panel" && options.isMobileViewport) {
      return "sheet";
    }
    return options.preferred;
  }

  return options.isMobileViewport ? "sheet" : "side-panel";
}

export function buildWorkspaceModes(isMobileViewport: boolean): DatabaseWorkspaceModeOption[] {
  const modes: DatabaseWorkspaceModeOption[] = [];
  if (!isMobileViewport) {
    modes.push({ value: "side-panel", label: "侧栏" });
  }
  modes.push({ value: "sheet", label: "抽屉" });
  modes.push({ value: "full-page", label: "全屏" });
  return modes;
}
