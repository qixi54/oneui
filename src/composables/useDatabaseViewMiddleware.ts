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

export interface DatabaseViewOptimisticMiddlewareOptions<T extends DataRecord = DataRecord> {
  apply: (context: DatabaseViewActionContext<T>) => void | Promise<void>;
  revert: (context: DatabaseViewActionErrorContext<T>) => void | Promise<void>;
  shouldApply?: (context: DatabaseViewActionContext<T>) => boolean;
}

export type DatabaseViewMiddlewareInput<T extends DataRecord = DataRecord> =
  | DatabaseViewActionMiddleware<T>
  | readonly DatabaseViewMiddlewareInput<T>[]
  | null
  | undefined;

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

export function createDatabaseViewOptimisticMiddleware<T extends DataRecord = DataRecord>(
  options: DatabaseViewOptimisticMiddlewareOptions<T>,
): DatabaseViewActionMiddleware<T> {
  const shouldApply =
    options.shouldApply ??
    ((context: DatabaseViewActionContext<T>) => context.action === "cell-edit");

  return {
    async before(context) {
      if (!shouldApply(context)) return;
      await options.apply(context);
    },
    async error(context) {
      if (!shouldApply(context)) return;
      await options.revert(context);
    },
  };
}

function flattenMiddlewareInputs<T extends DataRecord>(
  inputs: readonly DatabaseViewMiddlewareInput<T>[],
): DatabaseViewActionMiddleware<T>[] {
  const result: DatabaseViewActionMiddleware<T>[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      result.push(...flattenMiddlewareInputs(input as readonly DatabaseViewMiddlewareInput<T>[]));
      continue;
    }
    result.push(input as DatabaseViewActionMiddleware<T>);
  }
  return result;
}

export function composeDatabaseViewMiddlewares<T extends DataRecord = DataRecord>(
  ...inputs: DatabaseViewMiddlewareInput<T>[]
): DatabaseViewActionMiddleware<T> {
  const middlewares = flattenMiddlewareInputs(inputs);
  const progress = new WeakMap<DatabaseViewActionContext<T>, number>();

  return {
    async before(context) {
      let count = 0;
      try {
        for (const middleware of middlewares) {
          if (!middleware.before) {
            count += 1;
            continue;
          }
          await middleware.before(context);
          count += 1;
        }
        progress.set(context, count);
      } catch (error) {
        progress.set(context, count);
        throw error;
      }
    },
    async after(context) {
      const count = progress.get(context) ?? middlewares.length;
      try {
        for (let index = count - 1; index >= 0; index -= 1) {
          const middleware = middlewares[index];
          if (!middleware?.after) continue;
          await middleware.after(context);
        }
      } finally {
        progress.delete(context);
      }
    },
    async error(context) {
      const count = progress.get(context) ?? middlewares.length;
      try {
        for (let index = count - 1; index >= 0; index -= 1) {
          const middleware = middlewares[index];
          if (!middleware?.error) continue;
          await middleware.error(context);
        }
      } finally {
        progress.delete(context);
      }
    },
  };
}
