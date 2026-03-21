function sortData(data, field, order) {
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

function applyCondition(value, cond) {
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

function filterData(data, conditions, logic) {
  if (conditions.length === 0) return data;
  return data.filter((row) => {
    const results = conditions.map((cond) => {
      if (!cond.field) return true;
      return applyCondition(row[cond.field], cond);
    });
    return logic === "and" ? results.every(Boolean) : results.some(Boolean);
  });
}

self.onmessage = (e) => {
  try {
    const req = e.data;
    if (req.type === "sort") {
      self.postMessage({ type: "sort-result", data: sortData(req.data, req.field, req.order) });
    } else if (req.type === "filter") {
      self.postMessage({ type: "filter-result", data: filterData(req.data, req.conditions, req.logic) });
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
