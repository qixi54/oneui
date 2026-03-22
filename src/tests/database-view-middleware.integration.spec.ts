import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  composeDatabaseViewMiddlewares,
  createDatabaseViewAnalyticsMiddleware,
  createDatabaseViewOptimisticMiddleware,
  createDatabaseViewToastMiddleware,
  useDatabaseView,
} from "../composables";
import type { DatabaseViewAnalyticsEvent } from "../composables";
import type { DataRecord, TableSchema, ViewConfig } from "../types";

function buildSchema(): TableSchema {
  return {
    tableId: "tbl-1",
    name: "任务",
    fields: [{ id: "title", name: "标题", type: "text" }],
    views: [],
  };
}

function buildViews(): ViewConfig[] {
  return [{ viewId: "v-table", viewType: "table", name: "表格", visibleFields: ["title"] }];
}

function buildRecords(): DataRecord[] {
  return [{ id: "R-1", fields: { title: "DatabaseView 主页" } }];
}

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("DatabaseView middleware presets", () => {
  it("createDatabaseViewToastMiddleware 应该输出成功和错误提示", async () => {
    const success = vi.fn();
    const error = vi.fn();
    const onCellEdit = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("boom"));

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records: ref(buildRecords()),
      views: ref(buildViews()),
      actions: {
        middleware: createDatabaseViewToastMiddleware({
          onSuccess: success,
          onError: error,
        }),
        onCellEdit,
      },
      autoLoad: false,
    });

    await flushPromises();
    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "ok",
    });

    expect(success).toHaveBeenCalledWith("单元格更新已完成", expect.objectContaining({ action: "cell-edit" }));

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "fail",
    });

    expect(error).toHaveBeenCalledWith(
      "单元格更新已完成失败",
      expect.objectContaining({
        action: "cell-edit",
        error: expect.any(Error),
      }),
    );
  });

  it("createDatabaseViewAnalyticsMiddleware 应该记录 action 序列", async () => {
    const events: DatabaseViewAnalyticsEvent[] = [];
    const onCellEdit = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("boom"));

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records: ref(buildRecords()),
      views: ref(buildViews()),
      actions: {
        middleware: createDatabaseViewAnalyticsMiddleware({
          onEvent: (event) => events.push(event),
        }),
        onCellEdit,
      },
      autoLoad: false,
    });

    await flushPromises();
    events.length = 0;

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "ok",
    });

    expect(events.map((event) => event.phase)).toEqual(["before", "after"]);
    expect(events[0]).toMatchObject({
      action: "cell-edit",
      tableId: "tbl-1",
      viewId: "v-table",
      selectedRecordId: "R-1",
    });

    events.length = 0;

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "fail",
    });

    expect(events.map((event) => event.phase)).toEqual(["before", "error"]);
    expect(events[1]).toMatchObject({
      action: "cell-edit",
      error: expect.any(Error),
    });
  });

  it("composeDatabaseViewMiddlewares 应该稳定组合多个 preset，并按栈顺序回放", async () => {
    const successEvents: string[] = [];
    const errorEvents: string[] = [];
    const onCellEdit = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("boom"));

    const middleware = composeDatabaseViewMiddlewares(
      createDatabaseViewAnalyticsMiddleware({
        onEvent: (event) => {
          if (event.action === "cell-edit") {
            successEvents.push(`${event.phase}:${event.action}`);
          }
        },
      }),
      [
        createDatabaseViewToastMiddleware({
          onSuccess: (message, context) => {
            if (context.action === "cell-edit") {
              successEvents.push(`success:${message}`);
            }
          },
          onError: (message, context) => {
            if (context.action === "cell-edit") {
              errorEvents.push(`error:${message}`);
            }
          },
        }),
        createDatabaseViewOptimisticMiddleware({
          apply: (context) => {
            if (context.action === "cell-edit") {
              successEvents.push(`apply:${context.action}`);
            }
          },
          revert: (context) => {
            if (context.action === "cell-edit") {
              errorEvents.push(`revert:${context.action}`);
            }
          },
        }),
      ],
    );

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records: ref(buildRecords()),
      views: ref(buildViews()),
      actions: {
        middleware,
        onCellEdit,
      },
      autoLoad: false,
    });

    await flushPromises();
    successEvents.length = 0;
    errorEvents.length = 0;

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "ok",
    });

    expect(successEvents).toEqual([
      "before:cell-edit",
      "apply:cell-edit",
      "success:单元格更新已完成",
      "after:cell-edit",
    ]);

    successEvents.length = 0;

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "fail",
    });

    expect(errorEvents).toEqual([
      "revert:cell-edit",
      "error:单元格更新已完成失败",
    ]);
  });

  it("createDatabaseViewOptimisticMiddleware 应该保留成功后的 optimistic 结果，并在失败时回滚", async () => {
    const records = ref(buildRecords());
    const snapshots = new Map<string, string>();
    const apply = vi.fn((context) => {
      const payload = context.payload as { rowId: string; fieldId: string; value: string };
      const current = records.value.find((record) => record.id === payload.rowId);
      if (!current) return;
      snapshots.set(payload.rowId, String(current.fields[payload.fieldId]));
      records.value = records.value.map((record) =>
        record.id === payload.rowId
          ? {
              ...record,
              fields: {
                ...record.fields,
                [payload.fieldId]: payload.value,
              },
            }
          : record,
      );
    });
    const revert = vi.fn((context) => {
      const payload = context.payload as { rowId: string; fieldId: string };
      const previous = snapshots.get(payload.rowId);
      if (previous === undefined) return;
      records.value = records.value.map((record) =>
        record.id === payload.rowId
          ? {
              ...record,
              fields: {
                ...record.fields,
                [payload.fieldId]: previous,
              },
            }
          : record,
      );
    });
    const onCellEdit = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("boom"));

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records,
      views: ref(buildViews()),
      actions: {
        middleware: createDatabaseViewOptimisticMiddleware({
          apply,
          revert,
        }),
        onCellEdit,
      },
      autoLoad: false,
    });

    await flushPromises();

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "optimistic",
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(revert).not.toHaveBeenCalled();
    expect(records.value[0]?.fields.title).toBe("optimistic");

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "rollback",
    });

    expect(apply).toHaveBeenCalledTimes(2);
    expect(revert).toHaveBeenCalledTimes(1);
    expect(records.value[0]?.fields.title).toBe("optimistic");
    expect(databaseView.error.value?.message).toBe("boom");
  });
});
