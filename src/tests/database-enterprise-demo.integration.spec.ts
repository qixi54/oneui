import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";
import DatabaseEnterpriseDemo from "../dev/DatabaseEnterpriseDemo.vue";
import type { DataRecord, TableSchema, ViewConfig } from "../index";

const DatabaseViewStub = defineComponent({
  name: "DatabaseView",
  props: {
    tableId: { type: String, default: "" },
    records: { type: Array, default: () => [] },
    schema: { type: Object, required: true },
    views: { type: Array, default: () => [] },
    actions: { type: Object, default: () => ({}) },
  },
  template: `
    <div data-role="database-view-stub" :data-table-id="tableId">
      <button
        data-role="emit-cell-edit"
        @click="actions?.onCellEdit?.({ rowId: 'R-1', fieldId: 'title', value: 'changed' })"
      >
        edit
      </button>
      <span data-role="record-count">{{ Array.isArray(records) ? records.length : 0 }}</span>
    </div>
  `,
});

function buildSchema(): TableSchema {
  return {
    tableId: "tbl-1",
    name: "任务",
    fields: [{ id: "title", name: "标题", type: "text" }],
    views: [],
  };
}

function buildViews(): ViewConfig[] {
  return [{ viewId: "database-table", viewType: "table", name: "表格", visibleFields: ["title"] }];
}

function buildRecords(): DataRecord[] {
  return [{ id: "R-1", fields: { title: "DatabaseView 主页" } }];
}

describe("DatabaseEnterpriseDemo", () => {
  it("应该渲染企业组合 demo，并允许切换 ThemeScope 与 failure mode", async () => {
    const wrapper = mount(DatabaseEnterpriseDemo, {
      props: {
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
      },
      global: {
        stubs: {
          DatabaseView: DatabaseViewStub,
        },
      },
    });

    expect(wrapper.text()).toContain("ThemeScopeScene + DatabaseView + middleware presets");
    expect(wrapper.text()).toContain("Failure mode: ready");

    const buttons = wrapper.findAll(".database-enterprise__control-row .dev-btn");
    await buttons[0].trigger("click");
    expect(wrapper.text()).toContain("ThemeScope: neutral");

    await buttons[1].trigger("click");
    expect(wrapper.text()).toContain("Failure mode: armed");
  });

  it("reset log 应该恢复默认日志并清空 failure mode", async () => {
    const wrapper = mount(DatabaseEnterpriseDemo, {
      props: {
        schema: buildSchema(),
        records: buildRecords(),
        views: buildViews(),
      },
      global: {
        stubs: {
          DatabaseView: DatabaseViewStub,
        },
      },
    });

    const buttons = wrapper.findAll(".database-enterprise__control-row .dev-btn");
    await buttons[1].trigger("click");
    await buttons[2].trigger("click");

    expect(wrapper.text()).toContain("manual log reset");
    expect(wrapper.text()).toContain("Failure mode: ready");
  });
});
