import { ref, readonly } from "vue";
import type { Ref } from "vue";
import type { SortState } from "./useTable";
import type { FilterCondition as TableFilterCondition, FilterLogic } from "./useTableFilter";

// ─── Supabase Client Minimal Interface ──────────────────────────────────────
// No dependency on @supabase/supabase-js — consumers pass their own client.

export interface SupabaseQueryBuilder {
  from(table: string): SupabaseFilterBuilder;
}

export interface SupabaseFilterBuilder {
  select(
    columns?: string,
    options?: { count?: "exact" | "planned" | "estimated" },
  ): SupabaseFilterBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseFilterBuilder;
  range(from: number, to: number): SupabaseFilterBuilder;
  eq(column: string, value: unknown): SupabaseFilterBuilder;
  neq(column: string, value: unknown): SupabaseFilterBuilder;
  gt(column: string, value: unknown): SupabaseFilterBuilder;
  gte(column: string, value: unknown): SupabaseFilterBuilder;
  lt(column: string, value: unknown): SupabaseFilterBuilder;
  lte(column: string, value: unknown): SupabaseFilterBuilder;
  like(column: string, pattern: string): SupabaseFilterBuilder;
  ilike(column: string, pattern: string): SupabaseFilterBuilder;
  is(column: string, value: null): SupabaseFilterBuilder;
  not(column: string, operator: string, value: unknown): SupabaseFilterBuilder;
  in(column: string, values: unknown[]): SupabaseFilterBuilder;
  textSearch(
    column: string,
    query: string,
    options?: { type?: "plain" | "phrase" | "websearch" },
  ): SupabaseFilterBuilder;
  or(filters: string): SupabaseFilterBuilder;
  then<TResult1 = SupabaseQueryResult>(
    onfulfilled?: ((value: SupabaseQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult1 | PromiseLike<TResult1>) | null,
  ): Promise<TResult1>;
}

export interface SupabaseQueryResult {
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
  count: number | null;
}

// ─── Options ────────────────────────────────────────────────────────────────

export interface UseSupabaseProviderOptions {
  /** Supabase client instance (pass your createClient() result) */
  client: SupabaseQueryBuilder;
  /** Supabase table name */
  table: string;
  /** select columns, defaults to '*' */
  select?: string;
  /** Fixed filter conditions always appended (e.g. { project: 'xxx' }) */
  baseFilters?: Record<string, unknown>;
  /** Reactive filter conditions from useTableFilter */
  filterConditions?: Ref<readonly TableFilterCondition[]>;
  /** Filter logic: and / or */
  filterLogic?: Ref<FilterLogic>;
  /** Full-text search keyword */
  searchKeyword?: Ref<string>;
  /** Columns to search with ilike */
  searchColumns?: string[];
  /** Row transformer: Supabase row -> your T type */
  transform?: (row: Record<string, unknown>) => Record<string, unknown>;
}

// ─── Filter Translation Helpers ─────────────────────────────────────────────

/** Apply a single filter condition via chained builder methods (AND mode) */
function applyOneCondition(
  query: SupabaseFilterBuilder,
  cond: TableFilterCondition,
): SupabaseFilterBuilder {
  const { field, operator, value } = cond;
  switch (operator) {
    case "equals":
      return query.eq(field, value);
    case "not_equals":
      return query.neq(field, value);
    case "contains":
      return query.ilike(field, `%${value}%`);
    case "not_contains":
      return query.not(field, "ilike", `%${value}%`);
    case "starts_with":
      return query.ilike(field, `${value}%`);
    case "ends_with":
      return query.ilike(field, `%${value}`);
    case "gt":
      return query.gt(field, value);
    case "gte":
      return query.gte(field, value);
    case "lt":
      return query.lt(field, value);
    case "lte":
      return query.lte(field, value);
    case "is_empty":
      return query.is(field, null);
    case "is_not_empty":
      return query.not(field, "is", null);
    default:
      return query;
  }
}

/** Generate a PostgREST OR clause fragment for a single condition */
function conditionToPostgrest(cond: TableFilterCondition): string | null {
  const { field, operator, value } = cond;
  switch (operator) {
    case "equals":
      return `${field}.eq.${value}`;
    case "not_equals":
      return `${field}.neq.${value}`;
    case "contains":
      return `${field}.ilike.%${value}%`;
    case "not_contains":
      return `${field}.not.ilike.%${value}%`;
    case "starts_with":
      return `${field}.ilike.${value}%`;
    case "ends_with":
      return `${field}.ilike.%${value}`;
    case "gt":
      return `${field}.gt.${value}`;
    case "gte":
      return `${field}.gte.${value}`;
    case "lt":
      return `${field}.lt.${value}`;
    case "lte":
      return `${field}.lte.${value}`;
    case "is_empty":
      return `${field}.is.null`;
    case "is_not_empty":
      return `${field}.not.is.null`;
    default:
      return null;
  }
}

/** Apply an array of filter conditions with the given logic (and/or) */
function applyFilterConditions(
  query: SupabaseFilterBuilder,
  conditions: readonly TableFilterCondition[],
  logic: FilterLogic,
): SupabaseFilterBuilder {
  if (conditions.length === 0) return query;

  if (logic === "or") {
    const orParts = conditions.map((c) => conditionToPostgrest(c)).filter(Boolean) as string[];
    if (orParts.length > 0) {
      query = query.or(orParts.join(","));
    }
    return query;
  }

  // AND logic: chain each condition
  for (const cond of conditions) {
    if (
      !cond.field ||
      (!cond.value && cond.operator !== "is_empty" && cond.operator !== "is_not_empty")
    ) {
      continue;
    }
    query = applyOneCondition(query, cond);
  }
  return query;
}

// ─── Main Composable ────────────────────────────────────────────────────────

export function useSupabaseProvider<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseSupabaseProviderOptions,
) {
  const totalCount = ref(0);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Build a Supabase query with filter / sort / pagination applied.
   */
  function buildQuery(params: { page: number; pageSize: number; sort: SortState }) {
    let query = options.client
      .from(options.table)
      .select(options.select ?? "*", { count: "exact" });

    // 1. base filters (fixed conditions)
    if (options.baseFilters) {
      for (const [col, val] of Object.entries(options.baseFilters)) {
        query = query.eq(col, val);
      }
    }

    // 2. dynamic filters (from useTableFilter)
    if (options.filterConditions?.value) {
      query = applyFilterConditions(
        query,
        options.filterConditions.value,
        options.filterLogic?.value ?? "and",
      );
    }

    // 3. search (ilike multi-column fuzzy search)
    if (options.searchKeyword?.value && options.searchColumns?.length) {
      const keyword = options.searchKeyword.value.trim();
      if (keyword) {
        const orClause = options.searchColumns.map((col) => `${col}.ilike.%${keyword}%`).join(",");
        query = query.or(orClause);
      }
    }

    // 4. sort
    if (params.sort.field && params.sort.order) {
      query = query.order(params.sort.field, {
        ascending: params.sort.order === "asc",
      });
    }

    // 5. pagination (range is inclusive, 0-indexed)
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query.range(from, to);

    return query;
  }

  /**
   * onFetch — pass directly to useTable({ serverSide: true, onFetch })
   */
  async function onFetch(params: {
    page: number;
    pageSize: number;
    sort: SortState;
  }): Promise<{ data: T[]; total: number }> {
    loading.value = true;
    error.value = null;
    try {
      const query = buildQuery(params);
      const result = (await query) as SupabaseQueryResult;

      if (result.error) throw new Error(result.error.message);

      const rows = (result.data ?? []) as Record<string, unknown>[];
      const transformed = options.transform ? rows.map(options.transform) : rows;

      totalCount.value = result.count ?? transformed.length;

      return {
        data: transformed as T[],
        total: totalCount.value,
      };
    } catch (e) {
      error.value = e as Error;
      return { data: [], total: 0 };
    } finally {
      loading.value = false;
    }
  }

  return {
    onFetch,
    totalCount: readonly(totalCount),
    loading: readonly(loading),
    error: readonly(error),
    /** Exposed for advanced usage */
    buildQuery,
  };
}
