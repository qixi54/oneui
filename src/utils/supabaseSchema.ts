/**
 * Supabase Table Schema Introspection Utility
 *
 * Reads column metadata from information_schema.columns and produces
 * FieldDef[] / TableSchema objects compatible with OneUI's field system.
 */

import type { FieldDef, TableSchema, SelectOption } from "../types";

// ─── Column Metadata Interface ──────────────────────────────────────────────

/** Supabase / PostgreSQL column metadata (from information_schema.columns) */
export interface PgColumnInfo {
  column_name: string;
  data_type: string; // 'text', 'integer', 'boolean', 'timestamp with time zone', etc.
  udt_name: string; // underlying type: 'int4', 'int8', 'float8', 'bool', 'timestamptz', 'jsonb', '_text' (text[]), etc.
  is_nullable: "YES" | "NO";
  column_default: string | null;
  character_maximum_length: number | null;
  is_identity: "YES" | "NO";
  identity_generation: string | null; // 'ALWAYS' | 'BY DEFAULT' | null
}

// ─── PG → FieldType Mapping ────────────────────────────────────────────────

const PG_TYPE_MAP: Record<string, FieldDef["type"]> = {
  // Text
  text: "text",
  varchar: "text",
  char: "text",
  "character varying": "text",
  character: "text",
  name: "text",
  citext: "text",

  // Numeric
  int2: "number",
  int4: "number",
  int8: "number",
  float4: "number",
  float8: "number",
  numeric: "number",
  decimal: "number",
  real: "number",
  "double precision": "number",
  integer: "number",
  bigint: "number",
  smallint: "number",

  // Boolean
  bool: "checkbox",
  boolean: "checkbox",

  // Date / Time
  date: "date",
  timestamp: "datetime",
  timestamptz: "datetime",
  "timestamp with time zone": "datetime",
  "timestamp without time zone": "datetime",

  // JSON → richtext (markdown / structured content)
  json: "richtext",
  jsonb: "richtext",

  // UUID
  uuid: "text",

  // Array types
  _text: "multi_select", // text[]
  _varchar: "multi_select", // varchar[]
  _int4: "multi_select", // int[]
  _uuid: "relation", // uuid[] → relation
};

// ─── Name-based Heuristics ─────────────────────────────────────────────────

/** Infer a more specific FieldDef type from the column name */
function inferFieldTypeByName(colName: string, pgType: string): FieldDef["type"] | null {
  const name = colName.toLowerCase();

  // URL
  if (
    name === "url" ||
    name === "link" ||
    name === "website" ||
    name.endsWith("_url") ||
    name.endsWith("_link")
  ) {
    return "url";
  }

  // Email
  if (name === "email" || name.endsWith("_email")) {
    return "email";
  }

  // Phone
  if (name === "phone" || name === "tel" || name === "mobile" || name.endsWith("_phone")) {
    return "phone";
  }

  // Progress
  if (name === "progress" || name === "completion" || name === "percent") {
    return "progress";
  }

  // Rating
  if (name === "rating" || name === "score" || name === "stars") {
    return "rating";
  }

  // Creator / modifier
  if (
    name === "created_by" ||
    name === "creator" ||
    name === "author" ||
    name === "updated_by" ||
    name === "modifier"
  ) {
    return "creator";
  }

  // Currency (only when backed by a numeric PG type)
  if (
    name === "price" ||
    name === "amount" ||
    name === "cost" ||
    name === "total" ||
    name.endsWith("_amount") ||
    name.endsWith("_price")
  ) {
    if (pgType === "numeric" || pgType === "decimal" || pgType === "float8" || pgType === "money") {
      return "currency";
    }
  }

  // Rich-text content fields
  if (
    name === "content" ||
    name === "body" ||
    name === "description" ||
    name === "summary" ||
    name === "notes"
  ) {
    if (pgType === "text" || pgType === "jsonb") {
      return "richtext";
    }
  }

  return null;
}

// ─── Options ───────────────────────────────────────────────────────────────

export interface InferSchemaOptions {
  /** Table name */
  tableName: string;
  /** Column info rows from information_schema.columns */
  columns: PgColumnInfo[];
  /** Manual per-column overrides (merged last) */
  overrides?: Record<string, Partial<FieldDef>>;
  /** Column names to skip */
  skipColumns?: string[];
  /** column_name → display label mapping; use key '__table__' for the table display name */
  labelMap?: Record<string, string>;
  /** Include the id column (skipped by default) */
  includeIdColumn?: boolean;
  /** Use column-name heuristics for content fields (default true) */
  inferContentFields?: boolean;
  /** Pre-defined select options keyed by column name */
  selectOptions?: Record<string, SelectOption[]>;
}

// ─── Main Function ─────────────────────────────────────────────────────────

export function inferSchema(options: InferSchemaOptions): TableSchema {
  const {
    tableName,
    columns,
    overrides = {},
    skipColumns = [],
    labelMap = {},
    includeIdColumn = false,
    inferContentFields = true,
    selectOptions = {},
  } = options;

  const defaultSkip = new Set(["id", "created_at", "updated_at", ...skipColumns]);
  if (includeIdColumn) {
    defaultSkip.delete("id");
  }

  const fields: FieldDef[] = [];

  for (const col of columns) {
    if (defaultSkip.has(col.column_name)) continue;

    // Auto-increment → auto_number
    if (
      col.is_identity === "YES" ||
      (col.column_default && col.column_default.includes("nextval"))
    ) {
      fields.push({
        id: col.column_name,
        name: labelMap[col.column_name] ?? humanizeColumnName(col.column_name),
        type: "auto_number",
        prefix: "",
      } as FieldDef);
      continue;
    }

    // Pre-defined select options
    if (selectOptions[col.column_name]) {
      fields.push({
        id: col.column_name,
        name: labelMap[col.column_name] ?? humanizeColumnName(col.column_name),
        type: "select",
        options: selectOptions[col.column_name],
        required: col.is_nullable === "NO",
      } as FieldDef);
      continue;
    }

    // Infer type
    let fieldType: FieldDef["type"] = "text";

    if (inferContentFields) {
      const nameInferred = inferFieldTypeByName(col.column_name, col.udt_name);
      if (nameInferred) {
        fieldType = nameInferred;
      } else {
        fieldType = PG_TYPE_MAP[col.udt_name] ?? PG_TYPE_MAP[col.data_type] ?? "text";
      }
    } else {
      fieldType = PG_TYPE_MAP[col.udt_name] ?? PG_TYPE_MAP[col.data_type] ?? "text";
    }

    // Build the FieldDef
    let fieldDef: FieldDef = buildFieldDef(col, fieldType, labelMap);

    // Apply manual overrides
    if (overrides[col.column_name]) {
      fieldDef = { ...fieldDef, ...overrides[col.column_name] } as FieldDef;
    }

    fields.push(fieldDef);
  }

  return {
    tableId: tableName,
    name: labelMap["__table__"] ?? humanizeColumnName(tableName),
    fields,
    views: [],
  };
}

// ─── FieldDef Builder ──────────────────────────────────────────────────────

function buildFieldDef(
  col: PgColumnInfo,
  fieldType: FieldDef["type"],
  labelMap: Record<string, string>,
): FieldDef {
  const base = {
    id: col.column_name,
    name: labelMap[col.column_name] ?? humanizeColumnName(col.column_name),
    required: col.is_nullable === "NO",
  };

  switch (fieldType) {
    case "number":
      return { ...base, type: "number" };
    case "currency":
      return { ...base, type: "currency", currencyCode: "CNY", precision: 2 };
    case "progress":
      return { ...base, type: "progress", min: 0, max: 100 };
    case "rating":
      return { ...base, type: "rating", max: 5 };
    case "checkbox":
      return { ...base, type: "checkbox" };
    case "date":
      return { ...base, type: "date" };
    case "datetime":
      return { ...base, type: "datetime" };
    case "richtext":
      return { ...base, type: "richtext" };
    case "url":
      return { ...base, type: "url" };
    case "email":
      return { ...base, type: "email" };
    case "phone":
      return { ...base, type: "phone" };
    case "creator":
      return { ...base, type: "creator" };
    case "auto_number":
      return { ...base, type: "auto_number", prefix: "" };
    case "select":
    case "multi_select":
      return { ...base, type: fieldType, options: [] };
    case "relation":
      return { ...base, type: "relation" };
    case "attachment":
      return { ...base, type: "attachment" };
    default:
      return { ...base, type: "text" };
  }
}

// ─── Convenience: Fetch Schema from Supabase ───────────────────────────────

/** Minimal Supabase client interface (avoids hard dependency on @supabase/supabase-js) */
interface SupabaseClientLike {
  from(table: string): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        eq(
          column: string,
          value: string,
        ): Promise<{ data: PgColumnInfo[] | null; error: { message: string } | null }>;
        limit(
          count: number,
        ): Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
      };
      limit(
        count: number,
      ): Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
    };
  };
  rpc?(
    fn: string,
    params?: Record<string, unknown>,
  ): Promise<{ data: unknown; error: { message: string } | null }>;
}

/**
 * Query table schema from Supabase and produce a TableSchema.
 *
 * Strategy (in order of preference):
 * 1. RPC `get_table_columns(p_table_name)` — requires a custom Postgres function
 * 2. Direct `information_schema.columns` query — works only if PostgREST exposes it
 * 3. Falls back to inferring from a sample row's keys (limited type info)
 *
 * To use strategy 1, create this function in your Supabase SQL editor:
 * ```sql
 * CREATE OR REPLACE FUNCTION get_table_columns(p_table_name text)
 * RETURNS TABLE(
 *   column_name text, data_type text, udt_name text,
 *   is_nullable text, column_default text,
 *   character_maximum_length int, is_identity text, identity_generation text
 * ) LANGUAGE sql SECURITY DEFINER AS $$
 *   SELECT column_name::text, data_type::text, udt_name::text,
 *          is_nullable::text, column_default::text,
 *          character_maximum_length::int, is_identity::text, identity_generation::text
 *   FROM information_schema.columns
 *   WHERE table_schema = 'public' AND table_name = p_table_name
 *   ORDER BY ordinal_position;
 * $$;
 * ```
 */
export async function fetchSchemaFromSupabase(
  client: SupabaseClientLike,
  tableName: string,
  options?: Omit<InferSchemaOptions, "tableName" | "columns">,
): Promise<TableSchema> {
  // Strategy 1: Try RPC (preferred, works with any PostgREST config)
  if (client.rpc) {
    try {
      const { data, error } = await client.rpc("get_table_columns", {
        p_table_name: tableName,
      });
      if (!error && Array.isArray(data) && data.length > 0) {
        return inferSchema({
          tableName,
          columns: data as PgColumnInfo[],
          ...options,
        });
      }
    } catch {
      // RPC not available, fall through
    }
  }

  // Strategy 2: Try information_schema directly (may 404 on most Supabase setups)
  try {
    const { data, error } = await client
      .from("information_schema.columns" as string)
      .select(
        "column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length, is_identity, identity_generation",
      )
      .eq("table_schema", "public")
      .eq("table_name", tableName);

    if (!error && data && data.length > 0) {
      return inferSchema({
        tableName,
        columns: data as PgColumnInfo[],
        ...options,
      });
    }
  } catch {
    // Not available, fall through
  }

  // Strategy 3: Infer from a sample row (limited — only gets column names, types are guessed)
  try {
    const { data, error } = await client.from(tableName).select("*").limit(1);
    if (!error && Array.isArray(data) && data.length > 0) {
      const sampleRow = data[0] as Record<string, unknown>;
      const columns: PgColumnInfo[] = Object.entries(sampleRow).map(([key, value]) => ({
        column_name: key,
        data_type: inferPgTypeFromValue(value),
        udt_name: inferPgTypeFromValue(value),
        is_nullable: "YES" as const,
        column_default: null,
        character_maximum_length: null,
        is_identity: "NO" as const,
        identity_generation: null,
      }));
      return inferSchema({ tableName, columns, ...options });
    }
  } catch {
    // Nothing works
  }

  throw new Error(
    `Failed to fetch schema for "${tableName}". ` +
      `Create the get_table_columns() RPC function or provide schema manually via inferSchema().`,
  );
}

/** Guess pg type from JS value (fallback strategy) */
function inferPgTypeFromValue(value: unknown): string {
  if (value === null || value === undefined) return "text";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return Number.isInteger(value) ? "int4" : "float8";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return "timestamptz";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
    return "text";
  }
  if (Array.isArray(value)) return "_text";
  if (typeof value === "object") return "jsonb";
  return "text";
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** snake_case → Human Readable Name */
export function humanizeColumnName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
