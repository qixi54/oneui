/* eslint-disable vue/one-component-per-file */
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import DatabaseView from "../components/database/DatabaseView.vue";
import DatabaseViewContent from "../components/database/DatabaseViewContent.vue";
import {
  composeDatabaseViewMiddlewares,
  createDatabaseViewAnalyticsMiddleware,
  createDatabaseViewOptimisticMiddleware,
  createDatabaseViewToastMiddleware,
  useDatabaseView,
} from "../composables";
import type {
  DatabaseViewKanbanAppearance,
  DatabaseViewKanbanCardMoveEvent,
  DatabaseViewKanbanCardSlotContext,
  DatabaseViewKanbanColumnHeaderSlotContext,
  DatabaseViewKanbanQuickAddEvent,
} from "../contracts/database";
import type { DataRecord, TableSchema, ViewConfig } from "../types";

function buildSchema(): TableSchema {
  return {
    tableId: "tbl-1",
    name: "任务",
    fields: [
      { id: "title", name: "标题", type: "text" },
      { id: "status", name: "状态", type: "select", options: [] },
      { id: "startDate", name: "开始时间", type: "date" },
      { id: "endDate", name: "结束时间", type: "date" },
    ],
    views: [],
  };
}

function buildViews(): ViewConfig[] {
  return [
    { viewId: "v-table", viewType: "table", name: "表格", visibleFields: ["title", "status"] },
    {
      viewId: "v-kanban",
      viewType: "kanban",
      name: "看板",
      visibleFields: ["title", "status"],
      kanbanFieldId: "status",
    },
    {
      viewId: "v-gallery",
      viewType: "gallery",
      name: "画廊",
      visibleFields: ["title", "status"],
    },
    {
      viewId: "v-timeline",
      viewType: "timeline",
      name: "时间线",
      visibleFields: ["title", "status", "startDate", "endDate"],
    },
  ];
}

function buildRecords(): DataRecord[] {
  return [
    {
      id: "R-1",
      fields: {
        title: "DatabaseView 主页",
        brief: "主页卡片摘要",
        prdVersion: "v1.0",
        status: "todo",
        priority: "P0",
        startDate: "2026-03-20",
        endDate: "2026-03-21",
      },
    },
    {
      id: "R-2",
      fields: {
        title: "第二条记录",
        brief: "第二条摘要",
        prdVersion: "v1.1",
        status: "done",
        priority: "P1",
        startDate: "2026-03-22",
        endDate: "2026-03-23",
      },
    },
  ];
}

function buildKanbanPreserveRecords(): DataRecord[] {
  return [
    {
      id: "R-1",
      fields: {
        title: "DatabaseView 主页",
        status: "todo",
        startDate: "2026-03-20",
        endDate: "2026-03-21",
        owner: "Alice",
        customFlag: "keep-me",
      },
    },
    {
      id: "R-2",
      fields: {
        title: "第二条记录",
        status: "done",
        startDate: "2026-03-22",
        endDate: "2026-03-23",
        estimate: 8,
      },
    },
  ];
}

function buildProviderSchema(): TableSchema {
  return {
    ...buildSchema(),
    tableId: "tbl-1",
    name: "任务（远端）",
    fields: [
      ...buildSchema().fields,
      { id: "priority", name: "优先级", type: "select", options: [] },
    ],
  };
}

function buildProviderViews(): ViewConfig[] {
  return [
    {
      viewId: "provider-table",
      viewType: "table",
      name: "远端表格",
      visibleFields: ["title", "status", "priority"],
    },
    {
      viewId: "provider-gallery",
      viewType: "gallery",
      name: "远端画廊",
      visibleFields: ["title", "status", "priority"],
    },
  ];
}

function buildProviderRecords(): DataRecord[] {
  return [
    {
      id: "P-1",
      fields: {
        title: "远端记录",
        status: "doing",
        priority: "P0",
        startDate: "2026-03-25",
        endDate: "2026-03-26",
      },
    },
  ];
}

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

const TableToolbarStub = defineComponent({
  name: "TableToolbar",
  props: {
    currentView: {
      type: String,
      default: "",
    },
    searchKeyword: {
      type: String,
      default: "",
    },
  },
  emits: ["update:current-view"],
  template: `
    <div data-role="toolbar" :data-current-view="currentView" :data-search-keyword="searchKeyword">
      <button data-role="switch-table" @click="$emit('update:current-view', 'v-table')">table</button>
      <button data-role="switch-kanban" @click="$emit('update:current-view', 'v-kanban')">kanban</button>
      <button data-role="switch-gallery" @click="$emit('update:current-view', 'v-gallery')">gallery</button>
      <button data-role="switch-timeline" @click="$emit('update:current-view', 'v-timeline')">timeline</button>
    </div>
  `,
});

const DataTableStub = defineComponent({
  name: "DataTable",
  props: {
    priorityColorMap: {
      type: Object,
      default: undefined,
    },
    statusColorMap: {
      type: Object,
      default: undefined,
    },
  },
  emits: ["cell-edit", "schema-add-field"],
  template: `
    <div
      data-view="table"
      data-role="table-view"
      :data-priority-label="priorityColorMap?.P0?.label ?? ''"
      :data-status-label="statusColorMap?.todo?.label ?? ''"
    >
      <button
        data-role="emit-cell-edit"
        @click="$emit('cell-edit', { rowId: 'R-1', fieldId: 'title', value: 'updated' })"
      >
        edit
      </button>
      <button data-role="emit-schema-add-field" @click="$emit('schema-add-field', 'text')">
        add
      </button>
    </div>
  `,
});

const KanbanBoardStub = defineComponent({
  name: "KanbanBoard",
  template: '<div data-view="kanban" data-role="kanban-view">kanban</div>',
});

const KanbanBoardForwardStub = defineComponent({
  name: "KanbanBoard",
  emits: ["update:columns", "add-column", "card-click"],
  template: `
    <div data-view="kanban" data-role="kanban-forward-view">
      <button
        data-role="emit-update-columns"
        @click="$emit('update:columns', [{ id: 'todo', title: 'Todo', tasks: [{ id: 'todo-task-1', title: 'Kanban Task', status: 'todo', priority: 'P1' }] }])"
      >
        update
      </button>
      <button data-role="emit-card-click" @click="$emit('card-click', { id: 'task-1' })">
        card
      </button>
      <button data-role="emit-add-column" @click="$emit('add-column')">add</button>
    </div>
  `,
});

const KanbanBoardPreserveStub = defineComponent({
  name: "KanbanBoard",
  emits: ["update:columns"],
  template: `
    <div data-view="kanban" data-role="kanban-preserve-view">
      <button
        data-role="emit-update-columns"
        @click="$emit('update:columns', [
          {
            id: 'todo',
            title: 'Todo',
            tasks: [
              {
                id: 'R-1',
                title: 'DatabaseView 主页（移动后）',
                status: 'todo',
                priority: 'P0',
                startDate: '2026-03-20',
                endDate: '2026-03-21',
              },
              {
                id: 'TASK-NEW',
                title: '快速新增任务',
                status: 'todo',
                priority: 'P3',
              },
            ],
          },
          {
            id: 'done',
            title: 'Done',
            tasks: [
              {
                id: 'R-2',
                title: '第二条记录',
                status: 'done',
                priority: 'P1',
                startDate: '2026-03-22',
                endDate: '2026-03-23',
              },
            ],
          },
        ])"
      >
        update
      </button>
    </div>
  `,
});

const KanbanBoardSlotProbeStub = defineComponent({
  name: "KanbanBoard",
  props: {
    priorityColorMap: {
      type: Object,
      default: undefined,
    },
    statusColorMap: {
      type: Object,
      default: undefined,
    },
    kanbanAppearance: {
      type: Object,
      default: undefined,
    },
  },
  emits: ["quick-add", "card-move"],
  template: `
    <div
      data-view="kanban"
      data-role="kanban-slot-probe"
      :data-priority-label="priorityColorMap?.P0?.label ?? ''"
      :data-status-label="statusColorMap?.todo?.label ?? ''"
      :data-card-variant="kanbanAppearance?.cardVariant ?? ''"
      :data-column-variant="kanbanAppearance?.columnVariant ?? ''"
      :data-show-column-count="String(kanbanAppearance?.showColumnCount ?? '')"
    >
      <slot
        name="column-header"
        :column="{ id: 'todo', title: 'Todo', tasks: [{ id: 'R-1', title: '任务卡片', status: 'todo', priority: 'P0' }] }"
        :task-count="2"
        dot-color="#ff5500"
        :tasks="[{ id: 'R-1', title: '任务卡片', status: 'todo', priority: 'P0' }]"
        :add-card="() => undefined"
      />
      <slot
        name="card"
        :task="{ id: 'R-1', title: '任务卡片', status: 'todo', priority: 'P0' }"
        display-date="3/23"
        :priority-badge="{ label: '最高', style: { color: '#f00' } }"
        :status-badge="{ label: '待处理', style: { color: '#0f0' } }"
        priority-label="最高"
        status-label="待处理"
      />
      <slot
        name="card-title"
        :task="{ id: 'R-1', title: '任务卡片', status: 'todo', priority: 'P0' }"
        display-date="3/23"
        :priority-badge="{ label: '最高', style: { color: '#f00' } }"
        :status-badge="{ label: '待处理', style: { color: '#0f0' } }"
        priority-label="最高"
        status-label="待处理"
      />
      <slot
        name="meta"
        :task="{ id: 'R-1', title: '任务卡片', status: 'todo', priority: 'P0' }"
        display-date="3/23"
        :priority-badge="{ label: '最高', style: { color: '#f00' } }"
        :status-badge="{ label: '待处理', style: { color: '#0f0' } }"
        priority-label="最高"
        status-label="待处理"
      />
      <slot
        name="tags"
        :task="{ id: 'R-1', title: '任务卡片', status: 'todo', priority: 'P0' }"
        display-date="3/23"
        :priority-badge="{ label: '最高', style: { color: '#f00' } }"
        :status-badge="{ label: '待处理', style: { color: '#0f0' } }"
        priority-label="最高"
        status-label="待处理"
      />
      <button
        data-role="emit-quick-add"
        @click="$emit('quick-add', { columnId: 'todo', title: '快速新增任务', task: { id: 'TASK-NEW', title: '快速新增任务', status: 'todo', priority: 'P3' } })"
      >
        quick-add
      </button>
      <button
        data-role="emit-card-move"
        @click="$emit('card-move', { fromColumnId: 'todo', toColumnId: 'done', task: { id: 'R-1', title: '任务卡片', status: 'done', priority: 'P0' } })"
      >
        move
      </button>
    </div>
  `,
});

const GalleryViewStub = defineComponent({
  name: "GalleryView",
  template: '<div data-view="gallery" data-role="gallery-view">gallery</div>',
});

const GanttTimelineStub = defineComponent({
  name: "GanttTimeline",
  template: '<div data-view="timeline" data-role="timeline-view">timeline</div>',
});

const DetailSheetStub = defineComponent({
  name: "DetailSheet",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    fullPage: {
      type: Boolean,
      default: false,
    },
  },
  template: `
    <div
      v-if="visible"
      data-role="detail-sheet"
      :data-full-page="fullPage ? 'true' : 'false'"
    >
      detail-sheet
    </div>
  `,
});

const SidePanelStub = defineComponent({
  name: "SidePanel",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "persistent",
    },
    width: {
      type: Number,
      default: 500,
    },
  },
  emits: ["update:width"],
  template: `
    <aside v-if="modelValue" data-role="side-panel" :data-mode="mode" :data-width="String(width)">
      <button data-role="resize-side-panel" @click="$emit('update:width', 840)">resize</button>
      <slot />
    </aside>
  `,
});

const DrawerStub = defineComponent({
  name: "Drawer",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 390,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:width"],
  template: `
    <aside
      v-if="modelValue"
      data-role="drawer"
      :data-width="String(width)"
      :data-fullscreen="fullscreen ? 'true' : 'false'"
    >
      <button data-role="resize-drawer" @click="$emit('update:width', 980)">resize</button>
      <slot />
    </aside>
  `,
});

const EmptyStateStub = defineComponent({
  name: "EmptyState",
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  template: '<div data-role="empty-slot">{{ title }}{{ description }}</div>',
});

describe("DatabaseView 页面级集成", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("useDatabaseView 应该保持 local/provider contract，并转发页面动作", async () => {
    const schema = ref(buildSchema());
    const records = ref(buildRecords());
    const views = ref(buildViews());
    const onFetch = vi.fn();
    const onRefresh = vi.fn();
    const onCellEdit = vi.fn();
    const onSchemaEvent = vi.fn();
    const onSelectRecord = vi.fn();

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema,
      records,
      views,
      provider: {
        mode: "local",
        onFetch,
        onRefresh,
      },
      actions: {
        onCellEdit,
        onSchemaEvent,
        onSelectRecord,
      },
      initialViewId: "v-table",
      autoLoad: false,
    });

    expect(databaseView.mode.value).toBe("local");
    expect(databaseView.isLocalMode.value).toBe(true);
    expect(databaseView.isProviderMode.value).toBe(false);
    expect(databaseView.activeView.value.viewId).toBe("v-table");
    expect(databaseView.viewList.value.map((view) => view.id)).toEqual([
      "v-table",
      "v-kanban",
      "v-gallery",
      "v-timeline",
    ]);

    databaseView.switchView("v-kanban");
    expect(databaseView.activeViewId.value).toBe("v-kanban");
    expect(databaseView.page.value).toBe(1);

    await databaseView.refresh();

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onFetch).not.toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: "tbl-1",
        page: 1,
        pageSize: 20,
        selectedRecordId: "R-1",
        view: expect.objectContaining({ viewId: "v-kanban" }),
      }),
    );

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "页面级更新",
    });
    await databaseView.emitSchemaEvent({
      type: "schema-rename-field",
      fieldId: "status",
      newName: "阶段",
    });
    databaseView.setSelectedRecord("R-2");

    expect(onCellEdit).toHaveBeenCalledWith({
      rowId: "R-1",
      fieldId: "title",
      value: "页面级更新",
    });
    expect(onSchemaEvent).toHaveBeenCalledWith({
      type: "schema-rename-field",
      fieldId: "status",
      newName: "阶段",
    });
    await flushPromises();
    expect(onSelectRecord).toHaveBeenCalledWith(expect.objectContaining({ id: "R-2" }));
    expect(databaseView.selectedRecordId.value).toBe("R-2");
  });

  it("useDatabaseView middleware 应该按 before/after 顺序拦截成功路径", async () => {
    const sequence: string[] = [];
    const onCellEdit = vi.fn();

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records: ref(buildRecords()),
      views: ref(buildViews()),
      actions: {
        middleware: [
          {
            before: (context) => {
              sequence.push(`before:${context.action}`);
            },
            after: (context) => {
              sequence.push(`after:${context.action}`);
            },
          },
        ],
        onCellEdit,
      },
      autoLoad: false,
    });

    await flushPromises();
    sequence.length = 0;

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "middleware",
    });

    expect(sequence).toEqual(["before:cell-edit", "after:cell-edit"]);
    expect(onCellEdit).toHaveBeenCalledWith({
      rowId: "R-1",
      fieldId: "title",
      value: "middleware",
    });
    expect(databaseView.error.value).toBeNull();
  });

  it("useDatabaseView middleware 应该在错误路径收到 error 回调", async () => {
    const sequence: string[] = [];
    const onCellEdit = vi.fn().mockRejectedValue(new Error("boom"));

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records: ref(buildRecords()),
      views: ref(buildViews()),
      actions: {
        middleware: [
          {
            before: (context) => {
              sequence.push(`before:${context.action}`);
            },
            after: () => {
              sequence.push("after:cell-edit");
            },
            error: (context) => {
              sequence.push(`error:${context.action}:${context.error instanceof Error ? context.error.message : String(context.error)}`);
            },
          },
        ],
        onCellEdit,
      },
      autoLoad: false,
    });

    await flushPromises();
    sequence.length = 0;

    await databaseView.emitCellEdit({
      rowId: "R-1",
      fieldId: "title",
      value: "middleware-error",
    });

    expect(sequence).toEqual(["before:cell-edit", "error:cell-edit:boom"]);
    expect(onCellEdit).toHaveBeenCalledTimes(1);
    expect(databaseView.error.value?.message).toBe("boom");
  });

  it("useDatabaseView 可以组合 composeDatabaseViewMiddlewares，并在成功/错误链路上稳定回放", async () => {
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
    expect(errorEvents).toEqual([]);

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
    expect(successEvents).toEqual([
      "before:cell-edit",
      "apply:cell-edit",
      "error:cell-edit",
    ]);
    expect(databaseView.error.value?.message).toBe("boom");
  });

  it("useDatabaseView 应该同步 selectedRecord，并支持 detail workspace 打开/关闭", async () => {
    const records = ref(buildRecords());
    const onSelectRecord = vi.fn();
    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records,
      views: ref(buildViews()),
      actions: {
        onSelectRecord,
      },
      initialSelectedRecordId: "R-2",
      autoLoad: false,
    });

    expect(databaseView.selectedRecordId.value).toBe("R-2");
    expect(databaseView.selectedRecord.value?.id).toBe("R-2");
    expect(databaseView.selectedRecord.value?.fields.title).toBe("第二条记录");

    databaseView.setSelectedRecord("R-1");
    await flushPromises();
    expect(databaseView.selectedRecordId.value).toBe("R-1");
    expect(databaseView.selectedRecord.value?.fields.title).toBe("DatabaseView 主页");
    expect(onSelectRecord).toHaveBeenLastCalledWith(expect.objectContaining({ id: "R-1" }));

    databaseView.clearSelectedRecord();
    await flushPromises();
    expect(databaseView.selectedRecordId.value).toBeNull();
    expect(databaseView.selectedRecord.value).toBeNull();
    expect(onSelectRecord).toHaveBeenLastCalledWith(null);

    databaseView.setSelectedRecord("R-2");
    await flushPromises();
    expect(databaseView.selectedRecordId.value).toBe("R-2");

    records.value = [
      {
        id: "R-1",
        fields: {
          title: "DatabaseView 主页",
          status: "todo",
          startDate: "2026-03-20",
          endDate: "2026-03-21",
        },
      },
      {
        id: "R-2",
        fields: {
          title: "第二条记录（已更新）",
          status: "done",
          startDate: "2026-03-22",
          endDate: "2026-03-23",
        },
      },
    ];
    await nextTick();

    expect(databaseView.selectedRecordId.value).toBe("R-2");
    expect(databaseView.selectedRecord.value?.fields.title).toBe("第二条记录（已更新）");
  });

  it("useDatabaseView 应该在 provider contract 下吸收远端 schema / views / records", async () => {
    const onFetch = vi.fn().mockResolvedValue({
      schema: buildProviderSchema(),
      views: buildProviderViews(),
      records: buildProviderRecords(),
      activeViewId: "provider-gallery",
      selectedRecordId: "P-1",
      total: 1,
    });
    const onRefresh = vi.fn();

    const databaseView = useDatabaseView({
      tableId: "tbl-1",
      schema: ref(buildSchema()),
      records: ref(buildRecords()),
      views: ref(buildViews()),
      provider: {
        mode: "provider",
        onFetch,
        onRefresh,
      },
      pageSize: 10,
      initialSelectedRecordId: "R-2",
      autoLoad: false,
    });

    expect(databaseView.mode.value).toBe("provider");
    expect(databaseView.isProviderMode.value).toBe(true);

    await databaseView.refresh();

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onFetch).toHaveBeenCalledTimes(1);
    expect(onFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: "tbl-1",
        page: 1,
        pageSize: 10,
        selectedRecordId: "R-2",
        sort: { field: null, order: null },
        view: expect.objectContaining({ viewId: "v-table", viewType: "table" }),
      }),
    );
    expect(databaseView.loading.value).toBe(false);
    expect(databaseView.schema.value?.name).toBe("任务（远端）");
    expect(databaseView.records.value).toHaveLength(1);
    expect(databaseView.totalCount.value).toBe(1);
    expect(databaseView.views.value.map((view) => view.viewId)).toEqual([
      "v-table",
      "v-kanban",
      "v-gallery",
      "v-timeline",
      "provider-table",
      "provider-gallery",
    ]);
    expect(databaseView.activeViewId.value).toBe("provider-gallery");
    expect(databaseView.selectedRecordId.value).toBe("P-1");
    expect(databaseView.selectedRecord.value?.fields.title).toBe("远端记录");

    databaseView.setPage(3);
    await flushPromises();
    onFetch.mockClear();
    databaseView.switchView("provider-table");
    await flushPromises();

    expect(databaseView.page.value).toBe(1);
    expect(databaseView.selectedRecordId.value).toBe("P-1");
    expect(databaseView.selectedRecord.value?.fields.priority).toBe("P0");
    expect(onFetch).toHaveBeenCalledTimes(1);
    expect(onFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tableId: "tbl-1",
        page: 1,
        view: expect.objectContaining({ viewId: "provider-table" }),
      }),
    );
  });

  it("DatabaseView 应该按 view switching 渲染主视图，并透传 actions / emits", async () => {
    const onViewChange = vi.fn();
    const onCellEdit = vi.fn();
    const onSchemaEvent = vi.fn();
    const sequence: string[] = [];
    const wrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-1",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        currentViewId: "v-table",
        actions: {
          onViewChange,
          onCellEdit,
          onSchemaEvent,
          middleware: [
            {
              before: (context) => {
                if (context.action === "cell-edit") {
                  sequence.push(`before:${context.action}`);
                }
              },
              after: (context) => {
                if (context.action === "cell-edit") {
                  sequence.push(`after:${context.action}`);
                }
              },
            },
          ],
        },
      },
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
        },
      },
    });

    await nextTick();
    await flushPromises();
    sequence.length = 0;
    expect(wrapper.find('[data-view="table"]').exists()).toBe(true);

    await wrapper.get('[data-role="switch-kanban"]').trigger("click");
    await nextTick();
    expect(wrapper.find('[data-view="kanban"]').exists()).toBe(true);
    expect(wrapper.emitted("update:currentViewId")?.at(-1)?.[0]).toBe("v-kanban");
    expect(onViewChange).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: "tbl-1",
        view: expect.objectContaining({ viewId: "v-kanban", viewType: "kanban" }),
      }),
    );

    await wrapper.get('[data-role="switch-gallery"]').trigger("click");
    await nextTick();
    expect(wrapper.find('[data-view="gallery"]').exists()).toBe(true);

    await wrapper.get('[data-role="switch-timeline"]').trigger("click");
    await nextTick();
    expect(wrapper.find('[data-view="timeline"]').exists()).toBe(true);

    await wrapper.get('[data-role="switch-table"]').trigger("click");
    await nextTick();
    expect(wrapper.find('[data-view="table"]').exists()).toBe(true);

    await wrapper.get('[data-role="emit-cell-edit"]').trigger("click");
    await nextTick();
    expect(sequence).toEqual(["before:cell-edit", "after:cell-edit"]);
    expect(wrapper.emitted("cell-edit")?.at(-1)?.[0]).toEqual({
      rowId: "R-1",
      fieldId: "title",
      value: "updated",
    });
    expect(onCellEdit).toHaveBeenCalledWith({
      rowId: "R-1",
      fieldId: "title",
      value: "updated",
    });

    await wrapper.get('[data-role="emit-schema-add-field"]').trigger("click");
    await nextTick();
    expect(wrapper.emitted("schema-add-field")?.at(-1)?.[0]).toBe("text");
    expect(onSchemaEvent).toHaveBeenCalledWith({
      type: "schema-add-field",
      fieldType: "text",
    });
  });

  it("DatabaseViewContent 应该把 kanban 的 update:columns、card-click、add-column 逐层转发", async () => {
    const wrapper = mount(DatabaseViewContent, {
      props: {
        viewType: "kanban",
        records: buildRecords(),
        schema: buildSchema(),
        view: buildViews()[1],
        columns: [],
        readonly: false,
        enableFieldManagement: false,
      },
      global: {
        stubs: {
          KanbanBoard: KanbanBoardForwardStub,
        },
      },
    });

    await wrapper.get('[data-role="emit-update-columns"]').trigger("click");
    await wrapper.get('[data-role="emit-card-click"]').trigger("click");
    await wrapper.get('[data-role="emit-add-column"]').trigger("click");
    await nextTick();

    expect(wrapper.emitted("update:columns")?.at(-1)?.[0]).toEqual([
      {
        id: "todo",
        title: "Todo",
        tasks: [
          {
            id: "todo-task-1",
            title: "Kanban Task",
            status: "todo",
            priority: "P1",
          },
        ],
      },
    ]);
    expect(wrapper.emitted("card-click")?.at(-1)?.[0]).toEqual({ id: "task-1" });
    expect(wrapper.emitted("add-column")?.length).toBe(1);
  });

  it("DatabaseViewContent 应该把 kanban slots 与 colorMap 透传给 KanbanBoard", async () => {
    const quickAddEvents: DatabaseViewKanbanQuickAddEvent[] = [];
    const moveEvents: DatabaseViewKanbanCardMoveEvent[] = [];
    const wrapper = mount(DatabaseViewContent, {
      props: {
        viewType: "kanban",
        records: buildRecords(),
        schema: buildSchema(),
        view: buildViews()[1],
        columns: [],
        kanbanAppearance: {
          cardVariant: "compact",
          columnVariant: "flat",
          showColumnCount: false,
        } satisfies DatabaseViewKanbanAppearance,
        priorityColorMap: {
          P0: {
            label: "最高",
            text: "#991b1b",
            bg: "#fee2e2",
          },
        },
        statusColorMap: {
          todo: {
            label: "待处理",
            text: "#9a3412",
            bg: "#ffedd5",
            dot: "#ff5500",
          },
        },
      },
      slots: {
        "kanban-column-header": ({ column, taskCount, dotColor, records }: DatabaseViewKanbanColumnHeaderSlotContext) =>
          h("div", { "data-role": "column-slot" }, `${column.title}|${taskCount}|${dotColor}|${records[0]?.fields.title ?? ''}`),
        "kanban-card": ({ record, fields }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "card-slot" }, `${record.id}|${String(fields.brief ?? "")}`),
        "kanban-card-title": ({ task, priorityLabel, fields }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "title-slot" }, `${task.title}|${priorityLabel}|${String(fields.prdVersion ?? "")}`),
        "kanban-card-meta": ({ task, displayDate, record }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "meta-slot" }, `${task.id}|${displayDate}|${record.id}`),
        "kanban-card-tags": ({ statusLabel }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "tags-slot" }, statusLabel),
      },
      global: {
        stubs: {
          KanbanBoard: KanbanBoardSlotProbeStub,
        },
      },
    });

    const probe = wrapper.get('[data-role="kanban-slot-probe"]');
    expect(probe.attributes("data-priority-label")).toBe("最高");
    expect(probe.attributes("data-status-label")).toBe("待处理");
    expect(probe.attributes("data-card-variant")).toBe("compact");
    expect(probe.attributes("data-column-variant")).toBe("flat");
    expect(probe.attributes("data-show-column-count")).toBe("false");
    expect(wrapper.get('[data-role="column-slot"]').text()).toBe("Todo|2|#ff5500|DatabaseView 主页");
    expect(wrapper.get('[data-role="card-slot"]').text()).toBe("R-1|主页卡片摘要");
    expect(wrapper.get('[data-role="title-slot"]').text()).toBe("任务卡片|最高|v1.0");
    expect(wrapper.get('[data-role="meta-slot"]').text()).toBe("R-1|3/23|R-1");
    expect(wrapper.get('[data-role="tags-slot"]').text()).toBe("待处理");

    await wrapper.get('[data-role="emit-quick-add"]').trigger("click");
    await wrapper.get('[data-role="emit-card-move"]').trigger("click");
    quickAddEvents.push(wrapper.emitted("kanban-quick-add")?.at(-1)?.[0] as DatabaseViewKanbanQuickAddEvent);
    moveEvents.push(wrapper.emitted("kanban-card-move")?.at(-1)?.[0] as DatabaseViewKanbanCardMoveEvent);

    expect(quickAddEvents[0]).toEqual({
      columnId: "todo",
      title: "快速新增任务",
      task: {
        id: "TASK-NEW",
        title: "快速新增任务",
        status: "todo",
        priority: "P3",
      },
      record: {
        id: "TASK-NEW",
        fields: {
          title: "快速新增任务",
          description: "",
          status: "todo",
          priority: "P3",
          assignee: "",
          startDate: "",
          endDate: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
      fields: {
        title: "快速新增任务",
        description: "",
        status: "todo",
        priority: "P3",
        assignee: "",
        startDate: "",
        endDate: "",
        tags: [],
      },
    });
    expect(moveEvents[0]).toEqual({
      recordId: "R-1",
      fromColumnId: "todo",
      toColumnId: "done",
      task: {
        id: "R-1",
        title: "任务卡片",
        status: "done",
        priority: "P0",
      },
      record: buildRecords()[0],
      fields: buildRecords()[0].fields,
    });
  });

  it("DatabaseViewContent 应该把 table colorMap 透传给 DataTable", async () => {
    const wrapper = mount(DatabaseViewContent, {
      props: {
        viewType: "table",
        records: buildRecords(),
        schema: buildSchema(),
        view: buildViews()[0],
        columns: [],
        priorityColorMap: {
          P0: {
            label: "最高",
            text: "#991b1b",
            bg: "#fee2e2",
          },
        },
        statusColorMap: {
          todo: {
            label: "待处理",
            text: "#9a3412",
            bg: "#ffedd5",
            dot: "#ff5500",
          },
        },
      },
      global: {
        stubs: {
          DataTable: DataTableStub,
        },
      },
    });

    const probe = wrapper.get('[data-role="table-view"]');
    expect(probe.attributes("data-priority-label")).toBe("最高");
    expect(probe.attributes("data-status-label")).toBe("待处理");
  });

  it("DatabaseView 应该把 kanban update:columns 归并回 update:records", async () => {
    const wrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-kanban",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        currentViewId: "v-kanban",
      },
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardForwardStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
        },
      },
    });

    await wrapper.get('[data-role="emit-update-columns"]').trigger("click");
    await nextTick();

    expect(wrapper.emitted("update:records")?.at(-1)?.[0]).toEqual([
      {
        id: "todo-task-1",
        fields: {
          title: "Kanban Task",
          description: "",
          status: "todo",
          priority: "P1",
          assignee: "",
          startDate: "",
          endDate: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
    ]);
  });

  it("DatabaseView 应该在 kanban 更新时保留同 id 记录的非看板字段", async () => {
    const wrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-kanban-preserve",
        schema: buildSchema(),
        records: buildKanbanPreserveRecords(),
        views: buildViews(),
        currentViewId: "v-kanban",
      },
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardPreserveStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
        },
      },
    });

    await wrapper.get('[data-role="emit-update-columns"]').trigger("click");
    await nextTick();

    expect(wrapper.emitted("update:records")?.at(-1)?.[0]).toEqual([
      {
        id: "R-1",
        fields: {
          title: "DatabaseView 主页（移动后）",
          status: "todo",
          startDate: "2026-03-20",
          endDate: "2026-03-21",
          priority: "P0",
          owner: "Alice",
          customFlag: "keep-me",
          description: "",
          assignee: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
      {
        id: "TASK-NEW",
        fields: {
          title: "快速新增任务",
          description: "",
          status: "todo",
          priority: "P3",
          assignee: "",
          startDate: "",
          endDate: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
      {
        id: "R-2",
        fields: {
          title: "第二条记录",
          status: "done",
          startDate: "2026-03-22",
          endDate: "2026-03-23",
          priority: "P1",
          estimate: 8,
          description: "",
          assignee: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
    ]);
  });

  it("DatabaseView 应该为 kanban 更新回传 create/update/delete 动作", async () => {
    const onUpdateRecord = vi.fn();
    const onCreateRecord = vi.fn();
    const onDeleteRecord = vi.fn();

    const wrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-kanban-persist",
        schema: buildSchema(),
        records: buildKanbanPreserveRecords(),
        views: buildViews(),
        currentViewId: "v-kanban",
        actions: {
          onUpdateRecord,
          onCreateRecord,
          onDeleteRecord,
        },
      },
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardPreserveStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
        },
      },
    });

    await wrapper.get('[data-role="emit-update-columns"]').trigger("click");
    await nextTick();
    await flushPromises();

    expect(onUpdateRecord).toHaveBeenCalledTimes(2);
    expect(onUpdateRecord).toHaveBeenCalledWith({
      tableId: "tbl-kanban-persist",
      recordId: "R-1",
      patch: {
        title: "DatabaseView 主页（移动后）",
        priority: "P0",
        description: "",
        assignee: "",
        tags: [],
      },
      record: {
        id: "R-1",
        fields: {
          title: "DatabaseView 主页（移动后）",
          status: "todo",
          startDate: "2026-03-20",
          endDate: "2026-03-21",
          priority: "P0",
          owner: "Alice",
          customFlag: "keep-me",
          description: "",
          assignee: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
    });
    expect(onUpdateRecord).toHaveBeenCalledWith({
      tableId: "tbl-kanban-persist",
      recordId: "R-2",
      patch: {
        priority: "P1",
        description: "",
        assignee: "",
        tags: [],
      },
      record: {
        id: "R-2",
        fields: {
          title: "第二条记录",
          status: "done",
          startDate: "2026-03-22",
          endDate: "2026-03-23",
          priority: "P1",
          estimate: 8,
          description: "",
          assignee: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
    });
    expect(onCreateRecord).toHaveBeenCalledWith({
      tableId: "tbl-kanban-persist",
      record: {
        id: "TASK-NEW",
        fields: {
          title: "快速新增任务",
          description: "",
          status: "todo",
          priority: "P3",
          assignee: "",
          startDate: "",
          endDate: "",
          tags: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      },
    });
    expect(onDeleteRecord).not.toHaveBeenCalled();
  });

  it("业务页面应该可以通过 DatabaseView 直接自定义 kanban slots 与 colorMap", async () => {
    const onKanbanQuickAdd = vi.fn();
    const onKanbanCardMove = vi.fn();
    const wrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-kanban-custom",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        currentViewId: "v-kanban",
        kanbanAppearance: {
          cardVariant: "compact",
          columnVariant: "flat",
          showColumnCount: false,
        },
        priorityColorMap: {
          P0: {
            label: "最高",
            text: "#991b1b",
            bg: "#fee2e2",
          },
        },
        statusColorMap: {
          todo: {
            label: "待处理",
            text: "#9a3412",
            bg: "#ffedd5",
            dot: "#ff5500",
          },
        },
        actions: {
          onKanbanQuickAdd,
          onKanbanCardMove,
        },
      },
      slots: {
        "kanban-column-header": ({ column, taskCount, dotColor, records }: DatabaseViewKanbanColumnHeaderSlotContext) =>
          h("div", { "data-role": "dbv-column-slot" }, `${column.id}|${taskCount}|${dotColor}|${records[0]?.id ?? ''}`),
        "kanban-card": ({ record, fields }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "dbv-card-slot" }, `${record.id}|${String(fields.brief ?? "")}`),
        "kanban-card-title": ({ task, priorityLabel, fields }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "dbv-title-slot" }, `${task.id}|${priorityLabel}|${String(fields.prdVersion ?? "")}`),
        "kanban-card-meta": ({ task, displayDate, record }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "dbv-meta-slot" }, `${task.title}|${displayDate}|${record.id}`),
        "kanban-card-tags": ({ statusLabel }: DatabaseViewKanbanCardSlotContext) =>
          h("div", { "data-role": "dbv-tags-slot" }, statusLabel),
      },
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardSlotProbeStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
        },
      },
    });

    const probe = wrapper.get('[data-role="kanban-slot-probe"]');
    expect(probe.attributes("data-priority-label")).toBe("最高");
    expect(probe.attributes("data-status-label")).toBe("待处理");
    expect(probe.attributes("data-card-variant")).toBe("compact");
    expect(probe.attributes("data-column-variant")).toBe("flat");
    expect(wrapper.get('[data-role="dbv-column-slot"]').text()).toBe("todo|2|#ff5500|R-1");
    expect(wrapper.get('[data-role="dbv-card-slot"]').text()).toBe("R-1|主页卡片摘要");
    expect(wrapper.get('[data-role="dbv-title-slot"]').text()).toBe("R-1|最高|v1.0");
    expect(wrapper.get('[data-role="dbv-meta-slot"]').text()).toBe("任务卡片|3/23|R-1");
    expect(wrapper.get('[data-role="dbv-tags-slot"]').text()).toBe("待处理");

    await wrapper.get('[data-role="emit-quick-add"]').trigger("click");
    await wrapper.get('[data-role="emit-card-move"]').trigger("click");
    await flushPromises();

    expect(wrapper.emitted("kanban-quick-add")?.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        columnId: "todo",
        title: "快速新增任务",
        task: expect.objectContaining({ id: "TASK-NEW" }),
        record: expect.objectContaining({ id: "TASK-NEW" }),
      }),
    );
    expect(wrapper.emitted("kanban-card-move")?.at(-1)?.[0]).toEqual({
      recordId: "R-1",
      fromColumnId: "todo",
      toColumnId: "done",
      task: {
        id: "R-1",
        title: "任务卡片",
        status: "done",
        priority: "P0",
      },
      record: buildRecords()[0],
      fields: buildRecords()[0].fields,
    });
    expect(onKanbanQuickAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: "tbl-kanban-custom",
        columnId: "todo",
        title: "快速新增任务",
      }),
    );
    expect(onKanbanCardMove).toHaveBeenCalledWith({
      tableId: "tbl-kanban-custom",
      recordId: "R-1",
      fromColumnId: "todo",
      toColumnId: "done",
      task: {
        id: "R-1",
        title: "任务卡片",
        status: "done",
        priority: "P0",
      },
      record: buildRecords()[0],
      fields: buildRecords()[0].fields,
    });
  });

  it("DatabaseView 应该保留 loading / empty / error 三个关键状态", async () => {
    const sharedStubs = {
      Teleport: true,
      TableToolbar: TableToolbarStub,
      DataTable: DataTableStub,
      KanbanBoard: KanbanBoardStub,
      GalleryView: GalleryViewStub,
      GanttTimeline: GanttTimelineStub,
      EmptyState: EmptyStateStub,
    };

    const loadingWrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-1",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        currentViewId: "v-table",
        loading: true,
      },
      global: { stubs: sharedStubs },
    });
    expect(loadingWrapper.find('[data-role="loading-state"]').exists()).toBe(true);

    const emptyWrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-1",
        schema: buildSchema(),
        records: [],
        views: buildViews(),
        currentViewId: "v-table",
      },
      global: { stubs: sharedStubs },
    });
    await nextTick();
    expect(emptyWrapper.find('[data-role="empty-state"]').exists()).toBe(true);
    expect(emptyWrapper.text()).toContain("暂无记录");

    const errorWrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-1",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        currentViewId: "v-table",
        error: "boom",
      },
      global: { stubs: sharedStubs },
    });
    await nextTick();
    expect(errorWrapper.find('[data-role="error-state"]').exists()).toBe(true);
    expect(errorWrapper.text()).toContain("boom");
  });

  it("DatabaseView 桌面端 detailPresentation=side-panel 时应进入右侧工作区契约", async () => {
    const wrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-1",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        currentViewId: "v-table",
        selectedRecordId: "R-1",
        detailPresentation: "side-panel",
        density: "compact",
      },
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
          DetailSheet: DetailSheetStub,
          SidePanel: SidePanelStub,
        },
      },
    });

    await nextTick();

    expect(wrapper.find('[data-role="side-panel"]').exists()).toBe(true);
    expect(wrapper.find('[data-role="detail-sheet"]').exists()).toBe(false);
    expect(wrapper.props()).toMatchObject({
      detailPresentation: "side-panel",
      density: "compact",
    });
  });

  it("DatabaseView detail slot context 应该透传 source 与 presentation hints", async () => {
    const DetailSlotProbe = defineComponent({
      name: "DetailSlotProbe",
      components: { DatabaseView },
      setup() {
        return {
          schema: buildSchema(),
          records: buildRecords(),
          views: buildViews(),
          detailSource: "notifications",
          detailPresentation: "drawer",
        };
      },
      template: `
        <DatabaseView
          table-id="tbl-1"
          :schema="schema"
          :records="records"
          :views="views"
          current-view-id="v-table"
          selected-record-id="R-1"
          :detail-source="detailSource"
          :detail-presentation="detailPresentation"
        >
          <template #actions="{ source, presentation }">
            <div
              data-role="detail-slot"
              :data-source="source ?? ''"
              :data-presentation="presentation"
            >
              {{ source }}|{{ presentation }}
            </div>
          </template>
        </DatabaseView>
      `,
    });

    const wrapper = mount(DetailSlotProbe, {
      global: {
        stubs: {
          Teleport: true,
          TableToolbar: TableToolbarStub,
          DataTable: DataTableStub,
          KanbanBoard: KanbanBoardStub,
          GalleryView: GalleryViewStub,
          GanttTimeline: GanttTimelineStub,
          EmptyState: EmptyStateStub,
          DetailSheet: DetailSheetStub,
          SidePanel: SidePanelStub,
          Drawer: DrawerStub,
        },
      },
    });

    await nextTick();

    const slot = wrapper.get('[data-role="detail-slot"]');
    expect(slot.attributes("data-source")).toBe("notifications");
    expect(slot.attributes("data-presentation")).toBe("drawer");
    expect(slot.text()).toContain("notifications|drawer");
  });

  it("DatabaseView 应该记住当前视图、搜索词和 workspace 宽度偏好", async () => {
    const stubs = {
      Teleport: true,
      TableToolbar: TableToolbarStub,
      DataTable: DataTableStub,
      KanbanBoard: KanbanBoardStub,
      GalleryView: GalleryViewStub,
      GanttTimeline: GanttTimelineStub,
      EmptyState: EmptyStateStub,
      SidePanel: SidePanelStub,
      Drawer: DrawerStub,
    };

    const firstWrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-persist",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        selectedRecordId: "R-1",
      },
      global: { stubs },
    });

    await nextTick();
    await firstWrapper.get('[data-role="switch-gallery"]').trigger("click");
    await nextTick();
    await firstWrapper.setProps({ searchKeyword: "第二条" });
    await nextTick();
    await firstWrapper.get('[data-role="resize-side-panel"]').trigger("click");
    await nextTick();
    await firstWrapper.get('[data-role="workspace-mode-switch"] [data-mode="fullscreen"]').trigger("click");
    await nextTick();
    firstWrapper.unmount();

    const persisted = JSON.parse(window.localStorage.getItem("oneui-database-workspace:tbl-persist") || "{}");
    expect(persisted).toMatchObject({
      activeViewId: "v-gallery",
      searchKeyword: "第二条",
      detailPresentation: "fullscreen",
      sidePanelWidth: 840,
    });

    const secondWrapper = mount(DatabaseView, {
      props: {
        tableId: "tbl-persist",
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
        selectedRecordId: "R-1",
      },
      global: { stubs },
    });

    await nextTick();
    expect(secondWrapper.get('[data-role="toolbar"]').attributes("data-current-view")).toBe("v-gallery");
    expect(secondWrapper.get('[data-role="toolbar"]').attributes("data-search-keyword")).toBe("第二条");
    expect(secondWrapper.find('[data-role="drawer"]').exists()).toBe(true);
    expect(secondWrapper.get('[data-role="drawer"]').attributes("data-fullscreen")).toBe("true");
  });
});
