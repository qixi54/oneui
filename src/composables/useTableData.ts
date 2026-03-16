import { computed, type Ref } from "vue";
import type { Task, DataRecord } from "../types";

export interface UseTableDataOptions<T extends { id: string } & Record<string, any>> {
  tasks?: Ref<Task[] | undefined>;
  records?: Ref<DataRecord[] | undefined>;
}

/**
 * 将 Task[] 或 DataRecord[] 标准化为统一的行格式 T[]。
 *
 * - 优先使用 records：展开 fields 并保留 createdAt/updatedAt/__record 元信息
 * - 否则使用 tasks（原样透传，不做额外转换）
 */
export function useTableData<T extends { id: string } & Record<string, any>>(
  options: UseTableDataOptions<T>,
) {
  const rows = computed<T[]>(() => {
    if (options.records?.value?.length) {
      return options.records.value.map((record) => ({
        id: record.id,
        ...record.fields,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        __record: record,
      })) as unknown as T[];
    }
    return (options.tasks?.value ?? []) as unknown as T[];
  });

  return { rows };
}
