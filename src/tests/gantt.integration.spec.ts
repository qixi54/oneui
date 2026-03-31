import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GanttTimeline from "../components/timeline/GanttTimeline.vue";
import GanttRow from "../components/timeline/GanttRow.vue";

describe("Dashboard Gantt 集成", () => {
  it("为空时展示空态", () => {
    const wrapper = mount(GanttTimeline, {
      props: {
        items: [],
        startDate: "2026-03-01",
        days: 7,
      },
    });

    expect(wrapper.text()).toContain("暂无任务数据");
  });

  it("有数据时渲染行并透出 row-click", async () => {
    const onRowClick = vi.fn();
    const wrapper = mount(GanttTimeline, {
      props: {
        startDate: "2026-03-01",
        days: 14,
        onRowClick,
        items: [
          {
            id: "G-1",
            title: "Dashboard 迁移",
            status: "in_progress",
            priority: "P0",
            startDate: "2026-03-02",
            endDate: "2026-03-06",
          },
        ],
      },
    });

    expect(wrapper.findAll(".gantt-row").length).toBe(1);

    const row = wrapper.findComponent(GanttRow);
    row.vm.$emit("click", { id: "G-1", title: "Dashboard 迁移" });
    await wrapper.vm.$nextTick();
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0][0]).toMatchObject({ id: "G-1", title: "Dashboard 迁移" });
  });

  it("GanttTimeline 会把 priority/status colorMap 透传给 GanttRow", async () => {
    const wrapper = mount(GanttTimeline, {
      props: {
        startDate: "2026-03-01",
        days: 14,
        priorityColorMap: {
          P0: { label: "最高", text: "#991b1b", bg: "#fee2e2" },
        },
        statusColorMap: {
          in_progress: { label: "进行中", text: "#1d4ed8", bg: "#dbeafe", dot: "#2563eb" },
        },
        items: [
          {
            id: "G-1",
            title: "Dashboard 迁移",
            status: "in_progress",
            priority: "P0",
            startDate: "2026-03-02",
            endDate: "2026-03-06",
          },
        ],
      },
    });

    const row = wrapper.findComponent(GanttRow);
    expect(row.props("priorityColorMap")).toMatchObject({
      P0: { label: "最高", text: "#991b1b", bg: "#fee2e2" },
    });
    expect(row.props("statusColorMap")).toMatchObject({
      in_progress: { label: "进行中", text: "#1d4ed8", bg: "#dbeafe", dot: "#2563eb" },
    });
  });
});
