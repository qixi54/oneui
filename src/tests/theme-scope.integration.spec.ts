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

    expect(neutralTheme).toContain('[data-of-theme-scope="neutral"]');
    expect(neutralTheme).toContain('[data-of-theme="neutral"]');
    expect(opsTheme).toContain('[data-of-theme-scope="ops-console"]');
    expect(opsTheme).toContain('[data-of-theme="ops-console"]');
    expect(devApp).toContain(':data-of-theme-scope="scopedThemeMode"');

    expect(neutralTheme).toContain("--of-accent-default: #334155;");
    expect(opsTheme).toContain("--of-accent-default: #0f4c81;");
    expect(neutralTheme).not.toContain("--of-accent-default: #0f4c81;");
  });
});
