import { describe, expect, it } from "vitest";
import { DEFAULT_TABLE_SCHEMA, taskToDataRecord, type DataRecord, type ViewConfig } from "../types";

describe("三层模型集成", () => {
  it("task 可以转换为 DataRecord 且关键字段保留", () => {
    const record = taskToDataRecord({
      id: "T-1",
      title: "迁移 RichTextEditor",
      description: "替换旧编辑器为 oneui 实现",
      status: "in_progress",
      priority: "P1",
      assignee: "张三",
      startDate: "2026-03-01",
      endDate: "2026-03-05",
      tags: ["editor", "migration"],
      createdAt: "2026-03-01T10:00:00Z",
      updatedAt: "2026-03-02T10:00:00Z",
    });

    expect(record.id).toBe("T-1");
    expect(record.fields.title).toBe("迁移 RichTextEditor");
    expect(record.fields.status).toBe("in_progress");
    expect(record.fields.priority).toBe("P1");
    expect(record.fields.tags).toEqual(["editor", "migration"]);
    expect(record.createdAt).toBe("2026-03-01T10:00:00Z");
  });

  it("DEFAULT_TABLE_SCHEMA 提供迁移所需核心字段", () => {
    const fieldIds = new Set(DEFAULT_TABLE_SCHEMA.fields.map((field) => field.id));

    expect(fieldIds.has("title")).toBe(true);
    expect(fieldIds.has("status")).toBe(true);
    expect(fieldIds.has("priority")).toBe(true);
    expect(fieldIds.has("description")).toBe(true);
    expect(fieldIds.has("tags")).toBe(true);
  });

  it("ViewConfig 可以表达 table/kanban/gallery/timeline/detail 视图", () => {
    const views: ViewConfig[] = [
      { viewId: "v-table", viewType: "table", name: "表格", visibleFields: ["title", "status"] },
      {
        viewId: "v-kanban",
        viewType: "kanban",
        name: "看板",
        visibleFields: ["title", "status", "priority"],
        kanbanFieldId: "status",
      },
      {
        viewId: "v-gallery",
        viewType: "gallery",
        name: "画廊",
        visibleFields: ["title", "assignee"],
        galleryCoverFieldId: "cover",
        galleryCardFields: ["title", "assignee"],
      },
      {
        viewId: "v-timeline",
        viewType: "timeline",
        name: "甘特",
        visibleFields: ["title", "startDate", "endDate"],
      },
      {
        viewId: "v-detail",
        viewType: "detail",
        name: "详情",
        visibleFields: ["title", "description", "status"],
      },
    ];

    const record: DataRecord = {
      id: "R-1",
      fields: {
        title: "集成测试",
        status: "todo",
        priority: "P2",
        description: "验证多视图兼容",
      },
    };

    expect(views).toHaveLength(5);
    expect(record.fields.title).toBe("集成测试");
    expect(views.map((view) => view.viewType)).toEqual([
      "table",
      "kanban",
      "gallery",
      "timeline",
      "detail",
    ]);
  });
});
