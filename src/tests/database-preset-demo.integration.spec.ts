import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import DatabasePresetDemo from "../dev/examples/database/DatabasePresetDemo.vue";

function stubComponent(name: string) {
  return defineComponent({
    name,
    template: `<div data-role="${name}"><slot /></div>`,
  });
}

describe("DatabasePresetDemo", () => {
  it("should render the preset bundle demo and keep controls interactive", async () => {
    const wrapper = mount(DatabasePresetDemo, {
      global: {
        stubs: {
          DatabaseView: stubComponent("DatabaseView"),
          ThemeScope: stubComponent("ThemeScope"),
        },
      },
    });

    expect(wrapper.text()).toContain("Official preset demo");
    expect(wrapper.text()).toContain("Preset bundle");
    expect(wrapper.text()).toContain("Failure mode: ready");

    const buttons = wrapper.findAll(".database-preset-demo__control-row .dev-btn");
    await buttons[0].trigger("click");
    expect(wrapper.text()).toContain("ThemeScope: neutral");

    await buttons[1].trigger("click");
    expect(wrapper.text()).toContain("Failure mode: armed");

    await buttons[2].trigger("click");
    expect(wrapper.text()).toContain("Failure mode: ready");
  });
});
