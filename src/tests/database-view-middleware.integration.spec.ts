import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  createDatabaseViewAnalyticsMiddleware,
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
});
