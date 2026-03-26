import type {
  TableImportColumn,
  TableImportFieldMapping,
  TableImportPreviewOptions,
  TableImportPreviewResult,
  TableImportValidationIssue,
} from "../types/table-import-export";

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function createFieldLookup(columns: readonly TableImportColumn[]) {
  const byKey = new Map<string, TableImportColumn>();
  const byLabel = new Map<string, TableImportColumn>();
  const byAlias = new Map<string, TableImportColumn>();

  columns.forEach((column) => {
    byKey.set(normalizeToken(column.key), column);
    byLabel.set(normalizeToken(column.label), column);
    column.aliases?.forEach((alias) => {
      byAlias.set(normalizeToken(alias), column);
    });
  });

  return { byKey, byLabel, byAlias };
}

function resolveHeaderMapping(
  header: string,
  columns: readonly TableImportColumn[],
  fieldMappings: ReadonlyMap<string, string>,
): TableImportFieldMapping {
  const manualTarget = fieldMappings.get(normalizeToken(header));
  if (manualTarget) {
    const manualColumn = columns.find((column) => column.key === manualTarget) ?? null;
    return {
      sourceHeader: header,
      targetKey: manualColumn?.key ?? manualTarget,
      targetLabel: manualColumn?.label,
      matchedBy: "manual",
    };
  }

  const lookup = createFieldLookup(columns);
  const normalized = normalizeToken(header);
  const byLabel = lookup.byLabel.get(normalized);
  if (byLabel) {
    return {
      sourceHeader: header,
      targetKey: byLabel.key,
      targetLabel: byLabel.label,
      matchedBy: "label",
    };
  }

  const byKey = lookup.byKey.get(normalized);
  if (byKey) {
    return {
      sourceHeader: header,
      targetKey: byKey.key,
      targetLabel: byKey.label,
      matchedBy: "key",
    };
  }

  const byAlias = lookup.byAlias.get(normalized);
  if (byAlias) {
    return {
      sourceHeader: header,
      targetKey: byAlias.key,
      targetLabel: byAlias.label,
      matchedBy: "alias",
    };
  }

  return {
    sourceHeader: header,
    targetKey: null,
    matchedBy: "unmapped",
  };
}

function isEmptyValue(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function buildHeaderIssues(
  mappings: readonly TableImportFieldMapping[],
  requiredKeys: readonly string[],
): TableImportValidationIssue[] {
  const issues: TableImportValidationIssue[] = [];
  const targetCounts = new Map<string, number>();

  mappings.forEach((mapping) => {
    if (!mapping.targetKey) {
      issues.push({
        code: "unmapped_header",
        severity: "warning",
        message: `导入列「${mapping.sourceHeader}」未映射到目标字段`,
        sourceHeader: mapping.sourceHeader,
      });
      return;
    }
    targetCounts.set(mapping.targetKey, (targetCounts.get(mapping.targetKey) ?? 0) + 1);
  });

  targetCounts.forEach((count, targetKey) => {
    if (count > 1) {
      issues.push({
        code: "duplicate_mapping",
        severity: "error",
        message: `目标字段「${targetKey}」被重复映射 ${count} 次`,
        targetKey,
      });
    }
  });

  requiredKeys.forEach((requiredKey) => {
    const matched = mappings.some((mapping) => mapping.targetKey === requiredKey);
    if (!matched) {
      issues.push({
        code: "missing_required_field",
        severity: "error",
        message: `必填字段「${requiredKey}」未出现在导入映射中`,
        targetKey: requiredKey,
      });
    }
  });

  return issues;
}

export function buildTableImportPreview(options: TableImportPreviewOptions): TableImportPreviewResult {
  const visibleColumns = options.columns.filter((column) => !column.hidden);
  const manualMappings = new Map(
    (options.fieldMappings ?? []).map((mapping) => [normalizeToken(mapping.sourceHeader), mapping.targetKey]),
  );
  const requiredKeys = Array.from(
    new Set([
      ...visibleColumns.filter((column) => column.required).map((column) => column.key),
      ...(options.requiredFields ?? []),
    ]),
  );

  const mappings = options.headers.map((header) =>
    resolveHeaderMapping(header, visibleColumns, manualMappings),
  );
  const issues = buildHeaderIssues(mappings, requiredKeys);

  const rows = options.rows.map((row, rowIndex) => {
    const source = Object.fromEntries(options.headers.map((header, headerIndex) => [header, row[headerIndex]]));
    const values: Record<string, unknown> = {};
    const rowIssues: TableImportValidationIssue[] = [];

    mappings.forEach((mapping, headerIndex) => {
      if (!mapping.targetKey) return;
      values[mapping.targetKey] = row[headerIndex];
    });

    requiredKeys.forEach((requiredKey) => {
      if (isEmptyValue(values[requiredKey])) {
        rowIssues.push({
          code: "missing_required_value",
          severity: "error",
          message: `第 ${rowIndex + 1} 行缺少必填值「${requiredKey}」`,
          rowIndex,
          targetKey: requiredKey,
          value: values[requiredKey],
        });
      }
    });

    return {
      rowIndex,
      source,
      values,
      issues: rowIssues,
      isValid: rowIssues.length === 0,
    };
  });

  const allIssues = [...issues, ...rows.flatMap((row) => row.issues)];
  const fieldIssueCount = allIssues.reduce<Record<string, number>>((acc, issue) => {
    const key = issue.targetKey || issue.sourceHeader;
    if (key) acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return {
    headers: [...options.headers],
    mappings,
    rows,
    issues: allIssues,
    summary: {
      totalRows: rows.length,
      validRows: rows.filter((row) => row.isValid).length,
      invalidRows: rows.filter((row) => !row.isValid).length,
      errorCount: allIssues.filter((issue) => issue.severity === "error").length,
      warningCount: allIssues.filter((issue) => issue.severity === "warning").length,
      unmappedHeaders: mappings.filter((mapping) => !mapping.targetKey).map((mapping) => mapping.sourceHeader),
      missingRequiredFields: requiredKeys.filter(
        (requiredKey) => !mappings.some((mapping) => mapping.targetKey === requiredKey),
      ),
      fieldIssueCount,
    },
  };
}
