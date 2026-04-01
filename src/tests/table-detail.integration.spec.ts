import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
import DataTable from "../components/table/DataTable.vue";
import TableDataRow from "../components/table/TableDataRow.vue";
import DetailLayout from "../components/detail/DetailLayout.vue";
import FieldCell from "../components/table/FieldCell.vue";
import type { FieldDef } from "../components/table/FieldCell.vue";
import type { Task } from "../types";

const { measureTextBlockMock } = vi.hoisted(() => ({
  measureTextBlockMock: vi.fn((options: {
    text: string;
    lineHeight: number;
    maxWidth: number;
    chromeHeight?: number;
    minHeight?: number;
  }) => {
    const charsPerLine = Math.max(1, Math.floor(Math.max(options.maxWidth, 1) / 8));
    const lineCount = Math.max(1, Math.ceil(options.text.length / charsPerLine));
    const contentHeight = Math.max(options.lineHeight, lineCount * options.lineHeight);
    return {
      height: Math.max(options.minHeight ?? 0, (options.chromeHeight ?? 0) + contentHeight),
      contentHeight,
      lineCount,
      isApproximate: false,
    };
  }),
}));

vi.mock("../composables/useTextLayout", () => ({
  measureTextBlock: measureTextBlockMock,
}));

describe("Table + Detail 集成", () => {
  const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  const originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
  const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
  const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");

  const tasks: Task[] = [
    {
      id: "T-1",
      title: "完善集成测试",
      status: "in_progress",
      priority: "P1",
      assignee: "李四",
      description: "补齐 Task 2.4 的联调覆盖",
    },
    {
      id: "T-2",
      title: "更新文档",
      status: "todo",
      priority: "P2",
      assignee: "王五",
    },
  ];

  function setViewportWidth(width: number) {
    Object.defineProperty(window, "innerWidth", {
      value: width,
      configurable: true,
    });
  }

  function getRowHeights(wrapper: ReturnType<typeof mount>) {
    return wrapper
      .findAll(".of-table-row")
      .map((row) => Number.parseFloat((row.element as HTMLElement).style.height || "0"));
  }

  function installFieldCellMetrics() {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        const el = this as HTMLElement;
        if (el.dataset.fieldCellPreviewMode === "richtext") return 160;
        return 120;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get() {
        const el = this as HTMLElement;
        const length = Number(el.dataset.fieldCellTextLength ?? "0");
        if (el.dataset.fieldCellPreviewMode === "richtext") {
          return length > 36 ? 320 : 140;
        }
        return length > 16 ? 240 : 100;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        const el = this as HTMLElement;
        return el.dataset.fieldCellPreviewMode === "richtext" ? 40 : 20;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        const el = this as HTMLElement;
        const length = Number(el.dataset.fieldCellTextLength ?? "0");
        if (el.dataset.fieldCellPreviewMode === "richtext") {
          return length > 36 ? 84 : 36;
        }
        return 20;
      },
    });
  }

  beforeEach(() => {
    measureTextBlockMock.mockClear();
    installFieldCellMetrics();
  });

  afterEach(() => {
    if (originalClientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
    if (originalScrollWidth) Object.defineProperty(HTMLElement.prototype, "scrollWidth", originalScrollWidth);
    if (originalClientHeight) Object.defineProperty(HTMLElement.prototype, "clientHeight", originalClientHeight);
    if (originalScrollHeight) Object.defineProperty(HTMLElement.prototype, "scrollHeight", originalScrollHeight);
  });

  it("FieldCell 会暴露 text / richtext 的真实溢出状态和可观测属性", async () => {
    const textWrapper = mount(FieldCell, {
      props: {
        rowId: "T-1",
        field: { id: "summary", type: "text", label: "摘要" } as FieldDef,
        value: "This is a deliberately long field cell text to trigger overflow",
      },
    });

    await textWrapper.vm.$nextTick();
    await textWrapper.vm.$nextTick();

    expect(textWrapper.attributes("data-field-cell-content-kind")).toBe("text");
    expect(textWrapper.attributes("data-field-cell-overflow-state")).toBe("overflow");
    expect(Number(textWrapper.attributes("data-field-cell-text-length"))).toBeGreaterThan(16);

    const richWrapper = shallowMount(FieldCell, {
      props: {
        rowId: "T-2",
        field: { id: "body", type: "richtext", label: "正文" } as FieldDef,
        value: "# Heading\n\nThis markdown preview text is intentionally long to wrap across lines.",
      },
      global: {
        stubs: {
          FieldMarkdownPreview: true,
        },
      },
    });

    await richWrapper.vm.$nextTick();
    await richWrapper.vm.$nextTick();

    expect(richWrapper.attributes("data-field-cell-content-kind")).toBe("richtext");
    expect(richWrapper.attributes("data-field-cell-overflow-state")).toBe("overflow");
    expect(Number(richWrapper.attributes("data-field-cell-predicted-height"))).toBeGreaterThan(0);
    expect(measureTextBlockMock).toHaveBeenCalled();
  });

  it("FieldCell 在显式 editing=false 时仍会透传 request-edit 行为", async () => {
    const wrapper = mount(FieldCell, {
      props: {
        rowId: "T-3",
        field: { id: "title", type: "text", label: "标题" } as FieldDef,
        value: "原始值",
        editing: false,
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.trigger("click");

    expect(wrapper.emitted("request-edit")?.[0]).toEqual(["T-3", "title"]);
  });

  it("DataTable 点击行会透出 row-click 事件", async () => {
    const onRowClick = vi.fn();
    const wrapper = mount(DataTable, {
      props: {
        tasks,
        columns: [
          { key: "title", label: "标题" },
          { key: "status", label: "状态" },
          { key: "priority", label: "优先级" },
        ],
        onRowClick,
      },
    });

    const row = wrapper.findComponent(TableDataRow);
    row.vm.$emit("click", tasks[0]);
    await wrapper.vm.$nextTick();

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0][0]).toMatchObject({ id: "T-1", title: "完善集成测试" });
  });

  it("TableDataRow 可以通过键盘激活点击事件", async () => {
    const onClick = vi.fn();
    const wrapper = mount(TableDataRow, {
      props: {
        row: {
          id: "T-1",
          title: "完善集成测试",
          status: "in_progress",
        },
        columns: [{ key: "title", label: "标题" }],
        selectable: false,
        onClick,
      },
    });

    await wrapper.find('[role="row"]').trigger("keydown", { key: "Enter" });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toMatchObject({ id: "T-1", title: "完善集成测试" });
  });

  it("DataTable 行快捷动作「详情」会触发 row-click", async () => {
    const onRowClick = vi.fn();
    const wrapper = mount(DataTable, {
      props: {
        tasks,
        columns: [
          { key: "title", label: "标题" },
          { key: "status", label: "状态" },
        ],
        fieldDefs: [
          { id: "title", type: "text", label: "标题" },
          { id: "status", type: "select", label: "状态", options: [] },
        ] as FieldDef[],
        onRowClick,
      },
    });

    await wrapper.vm.$nextTick();

    const firstRow = wrapper.findAll(".of-table-row").at(0);
    expect(firstRow).toBeTruthy();
    const detailButton = firstRow!.findAll(".of-table-row__action-btn").find((btn) => btn.text() === "详情");
    expect(detailButton).toBeTruthy();
    await detailButton!.trigger("click");

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]?.[0]).toMatchObject({ id: "T-1", title: "完善集成测试" });
  });

  it("DataTable 行快捷动作「编辑」会驱动字段进入编辑态", async () => {
    const wrapper = mount(DataTable, {
      props: {
        tasks,
        columns: [
          { key: "title", label: "标题" },
          { key: "status", label: "状态" },
        ],
        fieldDefs: [
          { id: "title", type: "text", label: "标题" },
          { id: "status", type: "select", label: "状态", options: [] },
        ] as FieldDef[],
      },
    });

    await wrapper.vm.$nextTick();

    const firstRow = wrapper.findAll(".of-table-row").at(0);
    expect(firstRow).toBeTruthy();
    const editButton = firstRow!.findAll(".of-table-row__action-btn").find((btn) => btn.text() === "编辑");
    expect(editButton).toBeTruthy();
    await editButton!.trigger("click");

    await wrapper.vm.$nextTick();
    expect(firstRow!.find(".of-field-cell--editing").exists()).toBe(true);
  });

  it("DataTable 的 cell slot 可以覆盖默认单元格渲染", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(1280);
    const fieldDefs: FieldDef[] = [
      { id: "title", type: "text", label: "标题" },
      { id: "status", type: "select", label: "状态", options: [] },
      { id: "priority", type: "select", label: "优先级", options: [] },
    ];
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          columns: [
            { key: "title", label: "标题" },
            { key: "status", label: "状态" },
            { key: "priority", label: "优先级" },
          ],
          fieldDefs,
        },
        slots: {
          cell: `
            <template #default="{ row, col }">
              <span class="custom-cell">{{ col.key }}:{{ row.title }}</span>
            </template>
          `,
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.findAll(".custom-cell")).toHaveLength(tasks.length * 3);
      expect(wrapper.text()).toContain("title:完善集成测试");
      expect(wrapper.find(".of-field-cell").exists()).toBe(false);
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 在移动端也会透传 cell slot", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(375);
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          columns: [
            { key: "title", label: "标题" },
            { key: "status", label: "状态" },
            { key: "priority", label: "优先级" },
          ],
        },
        slots: {
          cell: `
            <template #default="{ row, col }">
              <span class="custom-cell">{{ col.key }}:{{ row.title }}</span>
            </template>
          `,
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.findAll(".custom-cell")).toHaveLength(tasks.length * 3);
      expect(wrapper.text()).toContain("title:完善集成测试");
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 移动端会保留 status / priority badge 语义与 colorMap", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(375);
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          columns: [
            { key: "title", label: "标题" },
            { key: "status", label: "状态" },
            { key: "priority", label: "优先级" },
          ],
          statusColorMap: {
            in_progress: {
              label: "执行中",
              text: "#0f766e",
              bg: "#ccfbf1",
            },
          },
          priorityColorMap: {
            P1: {
              label: "最高",
              text: "#991b1b",
              bg: "#fee2e2",
            },
          },
        },
      });

      await wrapper.vm.$nextTick();

      const badges = wrapper.findAll(".of-mobile-card__badge").map((node) => node.text());
      expect(badges).toContain("执行中");
      expect(badges).toContain("最高");
      expect(badges).toHaveLength(tasks.length * 2);
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 的 grid 语义应包含 row / columnheader / gridcell", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(1280);
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          columns: [
            { key: "title", label: "标题" },
            { key: "status", label: "状态" },
          ],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('[role="grid"]').exists()).toBe(true);
      expect(wrapper.findAll('[role="row"]').length).toBeGreaterThanOrEqual(3);
      expect(wrapper.findAll('[role="columnheader"]').length).toBeGreaterThanOrEqual(2);
      expect(wrapper.findAll('[role="gridcell"]').length).toBeGreaterThan(0);
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("selectable=false 时表头和数据行都不渲染 checkbox", async () => {
    const wrapper = mount(DataTable, {
      props: {
        tasks,
        selectable: false,
        columns: [
          { key: "title", label: "标题" },
          { key: "status", label: "状态" },
        ],
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(".of-th-checkbox").exists()).toBe(false);
    expect(wrapper.find(".of-td-checkbox").exists()).toBe(false);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false);
  });

  it("fill 列会应用最小宽度，避免窄容器下被压扁", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(1280);
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          columns: [
            { key: "title", label: "标题", width: "fill", minWidth: 260 },
            { key: "status", label: "状态", width: 90 },
          ],
        },
      });

      await wrapper.vm.$nextTick();

      const titleHeader = wrapper
        .findAll('[role="columnheader"]')
        .find((cell) => cell.text().includes("标题"));
      const titleCell = wrapper
        .findAll(".of-td")
        .find((cell) => cell.text().includes("完善集成测试"));

      expect(titleHeader).toBeTruthy();
      expect(titleCell).toBeTruthy();
      expect((titleHeader!.element as HTMLElement).style.minWidth).toBe("260px");
      expect((titleHeader!.element as HTMLElement).style.flex).toBe("1 1 260px");
      expect((titleCell!.element as HTMLElement).style.minWidth).toBe("260px");
      expect((titleCell!.element as HTMLElement).style.flex).toBe("1 1 260px");
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 固定列桌面分支会渲染 status / priority 彩色 badge", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(1280);
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          fixedColumns: ["title"],
          columns: [
            { key: "title", label: "标题", width: 220 },
            { key: "status", label: "状态", width: 120 },
            { key: "priority", label: "优先级", width: 100 },
          ],
        },
      });

      await wrapper.vm.$nextTick();

      const badges = wrapper.findAll(".of-badge").map((node) => node.text());
      expect(badges).toContain("进行中");
      expect(badges).toContain("待处理");
      expect(badges).toContain("P1");
      expect(badges).toContain("P2");
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 桌面标准分支会保留 status / priority badge fallback", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(1280);
    const fieldDefs: FieldDef[] = [
      { id: "title", type: "text", label: "标题" },
      { id: "status", type: "select", label: "状态", options: [] },
      { id: "priority", type: "select", label: "优先级", options: [] },
    ];
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          columns: [
            { key: "title", label: "标题" },
            { key: "status", label: "状态" },
            { key: "priority", label: "优先级" },
          ],
          fieldDefs,
        },
      });

      await wrapper.vm.$nextTick();

      const badges = wrapper.findAll(".of-badge").map((node) => node.text());
      expect(badges).toContain("进行中");
      expect(badges).toContain("待处理");
      expect(badges).toContain("P1");
      expect(badges).toContain("P2");
      expect(wrapper.findAll(".of-field-cell")).toHaveLength(tasks.length);
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 预留 density=compact 的契约位", async () => {
    const originalWidth = window.innerWidth;
    setViewportWidth(1280);
    try {
      const wrapper = mount(DataTable, {
        props: {
          tasks,
          density: "compact",
          columns: [
            { key: "title", label: "标题" },
            { key: "status", label: "状态" },
          ],
        },
      });

      await wrapper.vm.$nextTick();

      expect((wrapper.props() as Record<string, unknown>).density).toBe("compact");
      expect(getRowHeights(wrapper).length).toBeGreaterThan(0);
    } finally {
      setViewportWidth(originalWidth);
    }
  });

  it("DataTable 选中行后会显示批量操作条，并支持清空选择", async () => {
    const wrapper = mount(DataTable, {
      props: {
        tasks,
        columns: [
          { key: "title", label: "标题" },
          { key: "status", label: "状态" },
        ],
      },
    });

    await wrapper.vm.$nextTick();

    const firstCheckbox = wrapper.find('input[id="of-table-row-checkbox-T-1"]');
    await firstCheckbox.setValue(true);

    const selectionBar = wrapper.find('[data-role="selection-bar"]');
    expect(selectionBar.exists()).toBe(true);
    expect(selectionBar.text()).toContain("1");
    expect(selectionBar.text()).toContain("条记录已选中");

    await selectionBar.find("button").trigger("click");

    expect(wrapper.emitted("bulk-action")).toBeTruthy();
    expect(wrapper.emitted("bulk-action")?.[0]?.[0]).toMatchObject({
      actionKey: "clear-selection",
      rowIds: ["T-1"],
    });
    expect(wrapper.find('[data-role="selection-bar"]').exists()).toBe(false);
  });

  it("DataTable 支持按当前选择动态解析批量动作文案和禁用态", async () => {
    const wrapper = mount(DataTable, {
      props: {
        tasks,
        columns: [
          { key: "title", label: "标题" },
          { key: "status", label: "状态" },
        ],
        bulkActionItems: [
          {
            key: "archive",
            label: ({ selectionCount }) => `归档 ${selectionCount} 项`,
            disabled: ({ selectionCount }) => selectionCount < 2,
          },
        ],
      },
    });

    await wrapper.vm.$nextTick();

    const firstCheckbox = wrapper.find('input[id="of-table-row-checkbox-T-1"]');
    await firstCheckbox.setValue(true);

    const buttonsAfterFirstSelect = wrapper.findAll('[data-role="selection-bar"] button');
    expect(buttonsAfterFirstSelect[1]?.text()).toContain("归档 1 项");
    expect(buttonsAfterFirstSelect[1]?.attributes("disabled")).toBeDefined();

    const secondCheckbox = wrapper.find('input[id="of-table-row-checkbox-T-2"]');
    await secondCheckbox.setValue(true);

    const buttonsAfterSecondSelect = wrapper.findAll('[data-role="selection-bar"] button');
    expect(buttonsAfterSecondSelect[1]?.text()).toContain("归档 2 项");
    expect(buttonsAfterSecondSelect[1]?.attributes("disabled")).toBeUndefined();
  });

  it("DetailLayout 能渲染来自 task 的关键字段", () => {
    const wrapper = mount(DetailLayout, {
      props: {
        task: tasks[0],
        propItems: [
          { key: "状态", value: "进行中" },
          { key: "优先级", value: "P1" },
        ],
      },
    });

    expect(wrapper.text()).toContain("完善集成测试");
    expect(wrapper.text()).toContain("进行中");
    expect(wrapper.text()).toContain("P1");
    expect(wrapper.text()).toContain("补齐 Task 2.4 的联调覆盖");
  });

  it("DetailLayout 会把 meta 与属性面板统一走语义 colorMap", () => {
    const wrapper = mount(DetailLayout, {
      props: {
        task: {
          ...tasks[0],
          status: "in_progress",
          priority: "P1",
        },
        statusColorMap: {
          in_progress: {
            label: "执行中",
            text: "#155e75",
            bg: "#cffafe",
            dot: "#0891b2",
          },
        },
        priorityColorMap: {
          P1: {
            label: "核心",
            text: "#7c2d12",
            bg: "#ffedd5",
            dot: "#ea580c",
          },
        },
        propItems: [
          {
            key: "状态",
            value: "in_progress",
            type: "status",
            statusColorMap: {
              in_progress: {
                label: "执行中",
                text: "#155e75",
                bg: "#cffafe",
                dot: "#0891b2",
              },
            },
          },
          {
            key: "优先级",
            value: "P1",
            type: "priority",
            priorityColorMap: {
              P1: {
                label: "核心",
                text: "#7c2d12",
                bg: "#ffedd5",
                dot: "#ea580c",
              },
            },
          },
          {
            key: "分组",
            value: "product",
            type: "badge",
            customColorMap: {
              product: {
                label: "产品组",
                text: "#1d4ed8",
                bg: "#dbeafe",
                dot: "#2563eb",
              },
            },
          },
        ],
      },
    });

    const metaBadges = wrapper.findAll(".detail-layout__meta .detail-layout__badge").map((node) => node.text());
    expect(metaBadges).toContain("执行中");
    expect(metaBadges).toContain("核心");

    const propBadges = wrapper.findAll(".prop-row__badge").map((node) => node.text());
    expect(propBadges).toContain("执行中");
    expect(propBadges).toContain("核心");
    expect(propBadges).toContain("产品组");
  });

  it("DetailLayout 在非 ready 状态下会渲染统一状态壳", () => {
    const wrapper = mount(DetailLayout, {
      props: {
        title: "详情工作区",
        state: "loading",
      },
    });

    expect(wrapper.find('[data-role="detail-state-loading"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("正在准备工作区");
    expect(wrapper.find(".detail-layout__sidebar").exists()).toBe(false);
  });
});
