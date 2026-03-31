import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("package entrypoints", () => {
  it("documents dedicated composables and theme entrypoints for finer-grained consumption", () => {
    const packageJson = readSource("../../package.json");
    const viteConfig = readSource("../../vite.config.ts");
    const themeEntry = readSource("../theme.ts");
    const readme = readSource("../../README.md");
    const readmeEn = readSource("../../README.en.md");

    expect(packageJson).toContain('"./composables"');
    expect(packageJson).toContain('"./theme"');
    expect(packageJson).toContain('"./tokens"');
    expect(packageJson).toContain('"./dist/theme.js"');
    expect(packageJson).toContain('"./dist/tokens.js"');
    expect(packageJson).toContain('"./dist/plugin.js"');
    expect(packageJson).toContain('"**/*.css"');

    expect(viteConfig).toContain("composables: resolve(__dirname, 'src/composables/index.ts')");
    expect(viteConfig).toContain("theme: resolve(__dirname, 'src/theme.ts')");

    expect(themeEntry).toContain('./styles/variables.css');
    expect(themeEntry).toContain('./styles/themes/neutral.css');
    expect(themeEntry).toContain('./styles/themes/ops-console.css');
    expect(themeEntry).toContain('./styles/markdown.css');

    expect(readme).toContain("@oneflowui/ui/theme");
    expect(readme).toContain("docs/CSS-TOKENS.md");
    expect(readme).toContain("@oneflowui/ui/composables");
    expect(readmeEn).toContain("@oneflowui/ui/theme");
    expect(readmeEn).toContain("docs/CSS-TOKENS.md");
    expect(readmeEn).toContain("@oneflowui/ui/composables");
  });
});
