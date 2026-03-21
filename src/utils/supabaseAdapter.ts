import { computed, type Ref } from "vue";
import type { DataRecord, CellValue, FieldDef, TableSchema } from "../types";

// ─── Options ────────────────────────────────────────────────────────────────

export interface RowAdapterOptions {
  /** 主键列名，默认 'id' */
  idColumn?: string;
  /** created_at 列名 */
  createdAtColumn?: string;
  /** updated_at 列名 */
  updatedAtColumn?: string;
  /** 需要从 fields 中排除的列（如主键、时间戳），自动包含 id/created_at/updated_at */
  excludeFromFields?: string[];
  /** Schema 定义（如有），用于类型转换 */
  schema?: TableSchema;
}

export interface UseSupabaseAdapterOptions extends RowAdapterOptions {
  /** 响应式的原始 Supabase 行数据 */
  rawRows?: Ref<Record<string, unknown>[]>;
}

// ─── Supabase Row → DataRecord ──────────────────────────────────────────────

/**
 * 将 Supabase 的扁平行转换为 DataRecord
 */
export function rowToDataRecord(
  row: Record<string, unknown>,
  options: RowAdapterOptions = {},
): DataRecord {
  const {
    idColumn = "id",
    createdAtColumn = "created_at",
    updatedAtColumn = "updated_at",
    excludeFromFields = [],
  } = options;

  const excludeSet = new Set([idColumn, createdAtColumn, updatedAtColumn, ...excludeFromFields]);

  const fields: Record<string, CellValue> = {};
  for (const [key, value] of Object.entries(row)) {
    if (excludeSet.has(key)) continue;
    fields[key] = normalizeCellValue(
      value,
      options.schema?.fields.find((f) => f.id === key),
    );
  }

  return {
    id: String(row[idColumn] ?? ""),
    fields,
    createdAt: row[createdAtColumn] != null ? String(row[createdAtColumn]) : undefined,
    updatedAt: row[updatedAtColumn] != null ? String(row[updatedAtColumn]) : undefined,
  };
}

/**
 * 批量转换
 */
export function rowsToDataRecords(
  rows: Record<string, unknown>[],
  options: RowAdapterOptions = {},
): DataRecord[] {
  return rows.map((row) => rowToDataRecord(row, options));
}

// ─── DataRecord → Supabase Row ──────────────────────────────────────────────

/**
 * 将 DataRecord 转换回 Supabase 扁平行格式（用于 insert/update）
 */
export function dataRecordToRow(
  record: DataRecord,
  options: RowAdapterOptions = {},
): Record<string, unknown> {
  const {
    idColumn = "id",
    createdAtColumn = "created_at",
    updatedAtColumn = "updated_at",
  } = options;

  const row: Record<string, unknown> = {
    [idColumn]: record.id,
  };

  // 展开 fields 到扁平结构
  for (const [key, value] of Object.entries(record.fields)) {
    row[key] = value;
  }

  // 时间戳（如果有的话）
  if (record.createdAt) row[createdAtColumn] = record.createdAt;
  if (record.updatedAt) row[updatedAtColumn] = record.updatedAt;

  return row;
}

/**
 * 部分更新：只提取变更的字段，转换为 Supabase 扁平行
 */
export function fieldsToRow(fields: Partial<Record<string, CellValue>>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    row[key] = value;
  }
  return row;
}

// ─── Vue Composable ─────────────────────────────────────────────────────────

/**
 * 响应式适配器：自动将 Supabase 行数据转换为 DataRecord[]
 */
export function useSupabaseAdapter(options: UseSupabaseAdapterOptions = {}) {
  const records = computed<DataRecord[]>(() => {
    if (!options.rawRows?.value) return [];
    return rowsToDataRecords(options.rawRows.value, options);
  });

  return {
    records,
    /** 单行转换 */
    toRecord: (row: Record<string, unknown>) => rowToDataRecord(row, options),
    /** 批量转换 */
    toRecords: (rows: Record<string, unknown>[]) => rowsToDataRecords(rows, options),
    /** 回写转换 */
    toRow: (record: DataRecord) => dataRecordToRow(record, options),
    /** 部分字段回写 */
    fieldsToRow,
  };
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * 将值归一化为 CellValue 类型
 */
function normalizeCellValue(value: unknown, _fieldDef?: FieldDef): CellValue {
  if (value === null || value === undefined) return null;

  // 数组类型
  if (Array.isArray(value)) {
    return value.map(String);
  }

  // 布尔
  if (typeof value === "boolean") return value;

  // 数字
  if (typeof value === "number") return value;

  // 字符串
  if (typeof value === "string") return value;

  // JSON 对象 → 序列化为字符串（markdown content 等场景）
  if (typeof value === "object") {
    // 如果存储的是包含 content 字段的 JSON（如 richtext），尝试提取
    const obj = value as Record<string, unknown>;
    if ("content" in obj && typeof obj.content === "string") {
      return obj.content;
    }
    return JSON.stringify(value);
  }

  return String(value);
}
