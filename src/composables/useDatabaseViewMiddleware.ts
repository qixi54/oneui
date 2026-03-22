import type { DataRecord } from "../types";
import type {
  DatabaseViewActionContext,
  DatabaseViewActionErrorContext,
  DatabaseViewActionMiddleware,
} from "../contracts/database";

export interface DatabaseViewToastMiddlewareOptions<T extends DataRecord = DataRecord> {
  onSuccess?: (message: string, context: DatabaseViewActionContext<T>) => void | Promise<void>;
  onError?: (message: string, context: DatabaseViewActionErrorContext<T>) => void | Promise<void>;
  resolveSuccessMessage?: (context: DatabaseViewActionContext<T>) => string;
  resolveErrorMessage?: (context: DatabaseViewActionErrorContext<T>) => string;
}

export interface DatabaseViewAnalyticsEvent<T extends DataRecord = DataRecord> {
  phase: "before" | "after" | "error";
  action: DatabaseViewActionContext<T>["action"];
  tableId: string;
  viewId: string;
  selectedRecordId: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  payload: unknown;
  error?: unknown;
}

export interface DatabaseViewAnalyticsMiddlewareOptions<T extends DataRecord = DataRecord> {
  onEvent: (event: DatabaseViewAnalyticsEvent<T>) => void;
}

function resolveDefaultSuccessMessage<T extends DataRecord>(context: DatabaseViewActionContext<T>): string {
  switch (context.action) {
    case "cell-edit":
      return "单元格更新已完成";
    case "select-record":
      return "记录选择已更新";
    case "schema-event":
      return "结构变更已处理";
    case "save-view":
      return "视图已保存";
    case "delete-view":
      return "视图已删除";
    case "refresh":
      return "数据视图已刷新";
  }
}

function resolveDefaultErrorMessage<T extends DataRecord>(context: DatabaseViewActionErrorContext<T>): string {
  return `${resolveDefaultSuccessMessage(context)}失败`;
}

export function createDatabaseViewToastMiddleware<T extends DataRecord = DataRecord>(
  options: DatabaseViewToastMiddlewareOptions<T> = {},
): DatabaseViewActionMiddleware<T> {
  return {
    async after(context) {
      const message = (options.resolveSuccessMessage ?? resolveDefaultSuccessMessage)(context);
      await options.onSuccess?.(message, context);
    },
    async error(context) {
      const message = (options.resolveErrorMessage ?? resolveDefaultErrorMessage)(context);
      await options.onError?.(message, context);
    },
  };
}

export function createDatabaseViewAnalyticsMiddleware<T extends DataRecord = DataRecord>(
  options: DatabaseViewAnalyticsMiddlewareOptions<T>,
): DatabaseViewActionMiddleware<T> {
  const emit = (phase: DatabaseViewAnalyticsEvent<T>["phase"], context: DatabaseViewActionContext<T>, error?: unknown) => {
    options.onEvent({
      phase,
      action: context.action,
      tableId: context.tableId,
      viewId: context.activeViewId,
      selectedRecordId: context.selectedRecordId,
      page: context.page,
      pageSize: context.pageSize,
      totalCount: context.totalCount,
      payload: context.payload,
      error,
    });
  };

  return {
    before(context) {
      emit("before", context);
    },
    after(context) {
      emit("after", context);
    },
    error(context) {
      emit("error", context, context.error);
    },
  };
}
