import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ThemeScopeDemo from "../dev/examples/theme/ThemeScopeDemo.vue";

describe("ThemeScopeDemo", () => {
  it("should render scoped theme scene sections and reflect theme props", () => {
    const wrapper = mount(ThemeScopeDemo, {
      props: {
        globalTheme: "neutral",
        scopedTheme: "ops-console",
        snippet: '<ThemeScope theme="ops-console" />',
      },
    });

    expect(wrapper.text()).toContain("局部主题作用域");
    expect(wrapper.text()).toContain("组件级场景壳层");
    expect(wrapper.text()).toContain("全局：neutral / 局部：ops-console");
    expect(wrapper.text()).toContain("Scoped Component Tree");
    expect(wrapper.text()).toContain("ThemeScopeScene");
    expect(wrapper.text()).toContain("任务总览");
    expect(wrapper.text()).toContain('<ThemeScope theme="ops-console" />');
  });
});
