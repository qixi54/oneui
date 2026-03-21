/**
 * Web Worker for offloading sort/filter operations on large datasets.
 * Activated when data.length > 5000 to avoid serialization overhead on small sets.
 */

export type WorkerRequest =
  | { type: "sort"; data: Record<string, unknown>[]; field: string; order: "asc" | "desc" }
  | {
      type: "filter";
      data: Record<string, unknown>[];
      conditions: FilterConditionMsg[];
      logic: "and" | "or";
    };

export type WorkerResponse =
  | { type: "sort-result"; data: Record<string, unknown>[] }
  | { type: "filter-result"; data: Record<string, unknown>[] }
  | { type: "error"; message: string };

interface FilterConditionMsg {
  field: string;
  operator: string;
  value: string;
}

function sortData(
  data: Record<string, unknown>[],
  field: string,
  order: "asc" | "desc",
): Record<string, unknown>[] {
  return [...data].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") {
      return order === "asc" ? av - bv : bv - av;
    }
    const as = String(av);
    const bs = String(bv);
    return order === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });
}

function applyCondition(value: unknown, cond: FilterConditionMsg): boolean {
  const strVal = String(value ?? "").toLowerCase();
  const condVal = cond.value.toLowerCase();
  switch (cond.operator) {
    case "equals":
      return strVal === condVal;
    case "not_equals":
      return strVal !== condVal;
    case "contains":
      return strVal.includes(condVal);
    case "not_contains":
      return !strVal.includes(condVal);
    case "starts_with":
      return strVal.startsWith(condVal);
    case "ends_with":
      return strVal.endsWith(condVal);
    case "is_empty":
      return strVal === "" || value == null;
    case "is_not_empty":
      return strVal !== "" && value != null;
    case "gt":
      return Number(value) > Number(cond.value);
    case "gte":
      return Number(value) >= Number(cond.value);
    case "lt":
      return Number(value) < Number(cond.value);
    case "lte":
      return Number(value) <= Number(cond.value);
    default:
      return true;
  }
}

function filterData(
  data: Record<string, unknown>[],
  conditions: FilterConditionMsg[],
  logic: "and" | "or",
): Record<string, unknown>[] {
  if (conditions.length === 0) return data;
  return data.filter((row) => {
    const results = conditions.map((cond) => {
      if (!cond.field) return true;
      return applyCondition(row[cond.field], cond);
    });
    return logic === "and" ? results.every(Boolean) : results.some(Boolean);
  });
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  try {
    const req = e.data;
    if (req.type === "sort") {
      const result = sortData(req.data, req.field, req.order);
      self.postMessage({ type: "sort-result", data: result } satisfies WorkerResponse);
    } else if (req.type === "filter") {
      const result = filterData(req.data, req.conditions, req.logic);
      self.postMessage({ type: "filter-result", data: result } satisfies WorkerResponse);
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    } satisfies WorkerResponse);
  }
};
