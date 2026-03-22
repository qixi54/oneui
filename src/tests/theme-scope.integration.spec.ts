import { readFileSync } from "node:fs";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ThemeScope from "../components/common/ThemeScope.vue";
import ThemeScopeScene from "../components/common/ThemeScopeScene.vue";

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

  it("renders the reusable ThemeScopeScene shell and its slots", () => {
    const wrapper = mount(ThemeScopeScene, {
      props: {
        theme: "neutral",
        eyebrow: "Demo scene",
        title: "Task Surface",
        description: "Reusable scene shell for local theme scopes.",
        tag: "article",
      },
      slots: {
        default: '<div class="scene-body">Scene content</div>',
        meta: '<span class="scene-meta">meta chip</span>',
        footer: '<span class="scene-footer">footer note</span>',
      },
    });

    expect(wrapper.element.tagName).toBe("ARTICLE");
    expect(wrapper.attributes("data-of-theme")).toBe("neutral");
    expect(wrapper.attributes("data-of-theme-scope")).toBe("neutral");
    expect(wrapper.find(".of-theme-scope-scene").exists()).toBe(true);
    expect(wrapper.find(".of-theme-scope-scene__eyebrow").text()).toBe("Demo scene");
    expect(wrapper.find(".of-theme-scope-scene__title").text()).toBe("Task Surface");
    expect(wrapper.find(".of-theme-scope-scene__description").text()).toContain("Reusable scene shell");
    expect(wrapper.find(".scene-meta").exists()).toBe(true);
    expect(wrapper.find(".scene-body").exists()).toBe(true);
    expect(wrapper.find(".scene-footer").exists()).toBe(true);
  });

  it("documents the reusable ThemeScope entry and copyable examples", () => {
    const neutralTheme = readSource("../styles/themes/neutral.css");
    const opsTheme = readSource("../styles/themes/ops-console.css");
    const componentIndex = readSource("../components/common/index.ts");
    const rootIndex = readSource("../index.ts");
    const devApp = readSource("../dev/App.vue");
    const themeScopeDemo = readSource("../dev/ThemeScopeDemo.vue");
    const enterpriseDemo = readSource("../dev/DatabaseEnterpriseDemo.vue");
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
    expect(componentIndex).toContain("ThemeScopeScene");
    expect(rootIndex).toContain("ThemeScope");
    expect(rootIndex).toContain("ThemeScopeScene");
    expect(devApp).toContain("<ThemeScopeDemo");
    expect(themeScopeDemo).toContain("<ThemeScope");
    expect(themeScopeDemo).toContain("Scoped Component Tree");
    expect(themeScopeDemo).toContain("ThemeScopeScene");
    expect(themeScopeDemo).toContain("组件级场景壳层");
    expect(enterpriseDemo).toContain("ThemeScopeScene + DatabaseView");
    expect(readme).toContain("ThemeScope 包装组件");
    expect(readme).toContain('<ThemeScope theme="ops-console"');
    expect(readme).toContain("ThemeScope 场景组件");
    expect(readme).toContain("ThemeScopeScene");
    expect(readme).toContain("DatabasePresetDemo");
    expect(readmeEn).toContain("ThemeScope Wrapper");
    expect(readmeEn).toContain('<ThemeScope theme="ops-console"');
    expect(readmeEn).toContain("ThemeScope Scene Component");
    expect(readmeEn).toContain("ThemeScopeScene");
    expect(readmeEn).toContain("DatabasePresetDemo");
    expect(docsIndex).toContain("ThemeScope");
    expect(docsIndex).toContain("ThemeScopeDemo.vue");
    expect(docsIndex).toContain("ThemeScopeScene");
    expect(docsIndex).toContain("DatabasePresetDemo.vue");
    expect(docsIndex).toContain("composeDatabaseViewMiddlewares");
    expect(docsIndex).toContain("useVirtualListStateCache");
  });
});
