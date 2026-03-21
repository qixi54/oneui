import type { AggregationConfig, AggregationFn } from "../types";

/**
 * Compute aggregation results for a set of rows.
 */
export function computeAggregations(
  rows: Record<string, unknown>[],
  configs: AggregationConfig[],
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const config of configs) {
    const key = `${config.fieldId}:${config.fn}`;
    result[key] = computeSingle(rows, config.fieldId, config.fn);
  }

  return result;
}

function computeSingle(
  rows: Record<string, unknown>[],
  fieldId: string,
  fn: AggregationFn,
): number {
  if (fn === "count") {
    return rows.length;
  }

  const numbers: number[] = [];
  for (const row of rows) {
    const val = row[fieldId];
    if (val != null && typeof val === "number" && !Number.isNaN(val)) {
      numbers.push(val);
    } else if (val != null && typeof val === "string") {
      const parsed = Number(val);
      if (!Number.isNaN(parsed)) numbers.push(parsed);
    }
  }

  if (numbers.length === 0) return 0;

  switch (fn) {
    case "sum":
      return numbers.reduce((a, b) => a + b, 0);
    case "avg":
      return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    case "min":
      return Math.min(...numbers);
    case "max":
      return Math.max(...numbers);
    default:
      return 0;
  }
}
