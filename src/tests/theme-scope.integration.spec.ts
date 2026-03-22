import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("theme scope", () => {
  it("supports scoped wrappers with distinct neutral and ops-console token payloads", () => {
    const neutralTheme = readSource("../styles/themes/neutral.css");
    const opsTheme = readSource("../styles/themes/ops-console.css");
    const devApp = readSource("../dev/App.vue");
    const readme = readSource("../../README.md");
    const readmeEn = readSource("../../README.en.md");
    const index = readSource("../../docs/ONEUI-INDEX.md");
    const changelog = readSource("../../docs/CHANGELOG-v0.8.4.md");

    expect(neutralTheme).toContain('[data-of-theme-scope="neutral"]');
    expect(neutralTheme).toContain('[data-of-theme="neutral"]');
    expect(opsTheme).toContain('[data-of-theme-scope="ops-console"]');
    expect(opsTheme).toContain('[data-of-theme="ops-console"]');
    expect(devApp).toContain(':data-of-theme-scope="scopedThemeMode"');
    expect(devApp).toContain("local subtree inherits scoped theme tokens");
    expect(devApp).toContain("组件级主题包装");
    expect(devApp).toContain("任务总览");
    expect(readme).toContain("data-of-theme-scope");
    expect(readme).toContain("局部主题作用域");
    expect(readme).toContain("组件级示例");
    expect(readme).toContain("非 breaking");
    expect(readmeEn).toContain("data-of-theme-scope");
    expect(readmeEn).toContain("Local Theme Scope");
    expect(readmeEn).toContain("Component-Level Example");
    expect(readmeEn).toContain("non-breaking");
    expect(index).toContain("README.md");
    expect(index).toContain("scoped theme preview demo");
    expect(changelog).toContain("局部主题增强说明");
    expect(changelog).toContain("非 breaking 增强");

    expect(neutralTheme).toContain("--of-accent-default: #334155;");
    expect(opsTheme).toContain("--of-accent-default: #0f4c81;");
    expect(neutralTheme).not.toContain("--of-accent-default: #0f4c81;");
  });
});
