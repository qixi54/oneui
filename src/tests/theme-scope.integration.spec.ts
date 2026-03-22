import { readFileSync } from "node:fs";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ThemeScope from "../components/common/ThemeScope.vue";

function readSource(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("theme scope", () => {
  it("wraps slot content and writes scoped theme attributes", () => {
    const wrapper = mount(ThemeScope, {
      props: {
        theme: "ops-console",
        tag: "section",
      },
      slots: {
        default: '<span class="slot-copy">Scoped content</span>',
      },
    });

    expect(wrapper.element.tagName).toBe("SECTION");
    expect(wrapper.attributes("data-of-theme")).toBe("ops-console");
    expect(wrapper.attributes("data-of-theme-scope")).toBe("ops-console");
    expect(wrapper.find(".slot-copy").exists()).toBe(true);
    expect(wrapper.text()).toContain("Scoped content");
  });

  it("documents the reusable ThemeScope entry and copyable examples", () => {
    const neutralTheme = readSource("../styles/themes/neutral.css");
    const opsTheme = readSource("../styles/themes/ops-console.css");
    const componentIndex = readSource("../components/common/index.ts");
    const rootIndex = readSource("../index.ts");
    const devApp = readSource("../dev/App.vue");
    const readme = readSource("../../README.md");
    const readmeEn = readSource("../../README.en.md");
    const docsIndex = readSource("../../docs/ONEUI-INDEX.md");

    expect(neutralTheme).toContain('[data-of-theme-scope="neutral"]');
    expect(neutralTheme).toContain('[data-of-theme="neutral"]');
    expect(opsTheme).toContain('[data-of-theme-scope="ops-console"]');
    expect(opsTheme).toContain('[data-of-theme="ops-console"]');
    expect(neutralTheme).toContain("--of-accent-default: #334155;");
    expect(opsTheme).toContain("--of-accent-default: #0f4c81;");
    expect(componentIndex).toContain("ThemeScope");
    expect(rootIndex).toContain("ThemeScope");
    expect(devApp).toContain("<ThemeScope");
    expect(devApp).toContain("Scoped Component Tree");
    expect(readme).toContain("ThemeScope 包装组件");
    expect(readme).toContain('<ThemeScope theme="ops-console"');
    expect(readme).toContain("组件级示例");
    expect(readmeEn).toContain("ThemeScope Wrapper");
    expect(readmeEn).toContain('<ThemeScope theme="ops-console"');
    expect(readmeEn).toContain("Component-Level Example");
    expect(docsIndex).toContain("ThemeScope");
    expect(docsIndex).toContain("composeDatabaseViewMiddlewares");
    expect(docsIndex).toContain("useVirtualListStateCache");
  });
});
