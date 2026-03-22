import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import DatabaseViewDemo from "../dev/examples/database/DatabaseViewDemo.vue";

function stubComponent(name: string) {
  return defineComponent({
    name,
    setup(_, { slots }) {
      return () => h("div", { "data-role": name }, slots.default?.());
    },
  });
}

describe("DatabaseViewDemo", () => {
  it("should render the page-level demo shell and keep controls interactive", async () => {
    const wrapper = mount(DatabaseViewDemo, {
      global: {
        stubs: {
          DatabaseEnterpriseDemo: stubComponent("DatabaseEnterpriseDemo"),
          DatabasePresetDemo: stubComponent("DatabasePresetDemo"),
          TableToolbar: stubComponent("TableToolbar"),
          DataTable: stubComponent("DataTable"),
          KanbanBoard: stubComponent("KanbanBoard"),
          GalleryView: stubComponent("GalleryView"),
          GanttTimeline: stubComponent("GanttTimeline"),
          DetailLayout: stubComponent("DetailLayout"),
          EmptyState: stubComponent("EmptyState"),
        },
      },
    });

    expect(wrapper.text()).toContain("DatabaseView 页面级方案证明");
    expect(wrapper.find('[data-role="DatabasePresetDemo"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("source mode");
    expect(wrapper.text()).toContain("page state");
    expect(wrapper.text()).toContain("current view");
    expect(wrapper.text()).toContain("mode: provider");
    expect(wrapper.text()).toContain("view: table");

    const buttons = wrapper.findAll(".database-shell__bar .dev-btn");
    await buttons[0].trigger("click");
    expect(wrapper.text()).toContain("mode: local");

    await buttons[3].trigger("click");
    expect(wrapper.text()).toContain("页面级视图加载中");

    await buttons.at(-1)?.trigger("click");
    expect(wrapper.text()).toContain("mode: provider");
    expect(wrapper.text()).toContain("view: table");
  });
});
