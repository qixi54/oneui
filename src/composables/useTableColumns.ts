import { computed, type Ref } from "vue";
import type { TableColumn, TableSchema, ViewConfig, FieldDef } from "../types";
import { DEFAULT_TABLE_COLUMNS } from "../constants/table";

export interface UseTableColumnsOptions {
  columns?: Ref<TableColumn[] | undefined>;
  schema?: Ref<TableSchema | undefined>;
  view?: Ref<ViewConfig | undefined>;
}

/** 将 FieldDef 的类型映射为 TableColumn 的 type */
function fieldTypeToColumnType(field: FieldDef): TableColumn["type"] {
  if (field.type === "number" || field.type === "date") return field.type;
  if (field.type === "select") return "status";
  return "string";
}

/** 将单个 FieldDef 转换为 TableColumn */
function fieldToColumn(field: FieldDef): TableColumn {
  return {
    key: field.id,
    label: field.name,
    width: field.width,
    type: fieldTypeToColumnType(field),
  };
}

/**
 * 将 TableSchema 或 TableColumn[] 解析为渲染用的列配置。
 *
 * 优先级：
 * 1. props.columns 直接使用（已经是最终列定义）
 * 2. props.schema + props.view 过滤可见字段并转换
 * 3. 降级到 DEFAULT_TABLE_COLUMNS
 */
export function useTableColumns(options: UseTableColumnsOptions) {
  const columns = computed<TableColumn[]>(() => {
    if (options.columns?.value?.length) return options.columns.value;

    if (options.schema?.value?.fields?.length) {
      const visibleFields = options.view?.value?.visibleFields?.length
        ? options.schema.value.fields.filter((f) =>
            options.view!.value!.visibleFields.includes(f.id),
          )
        : options.schema.value.fields;
      return visibleFields.filter((f) => !f.hidden).map(fieldToColumn);
    }

    return DEFAULT_TABLE_COLUMNS;
  });

  return { columns };
}
