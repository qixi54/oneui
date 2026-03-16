import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DataTable from "../components/table/DataTable.vue";
import TableDataRow from "../components/table/TableDataRow.vue";
import DetailLayout from "../components/detail/DetailLayout.vue";
import type { Task } from "../types";

describe("Table + Detail 集成", () => {
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

    const titleHeader = wrapper.findAll(".of-th").find((cell) => cell.text().includes("标题"));
    const titleCell = wrapper.find(".of-td-title").element.parentElement as HTMLElement | null;

    expect(titleHeader).toBeTruthy();
    expect(titleCell).not.toBeNull();
    expect((titleHeader!.element as HTMLElement).style.minWidth).toBe("260px");
    expect((titleHeader!.element as HTMLElement).style.flex).toBe("1 1 260px");
    expect(titleCell!.style.minWidth).toBe("260px");
    expect(titleCell!.style.flex).toBe("1 1 260px");
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
});
