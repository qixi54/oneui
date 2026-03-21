import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "").trim();
  const expanded =
    normalized.length === 3 ? normalized.split("").map((ch) => ch + ch).join("") : normalized;

  const match = expanded.match(/^[0-9a-f]{6}$/i);
  if (!match) {
    throw new Error(`Unsupported hex color: ${hex}`);
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const fg = luminance(foreground);
  const bg = luminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function readSource(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function readTokenMap(): Record<string, string> {
  const source = readSource("../styles/variables.css");
  const tokens: Record<string, string> = {};
  const pattern = /--([a-z0-9-_]+):\s*(#[0-9a-f]{3,6});/gi;
  for (const match of source.matchAll(pattern)) {
    tokens[`--${match[1]}`] = match[2];
  }
  return tokens;
}

describe("accessibility tokens", () => {
  it("Badge 默认语义色应满足常规文本对比度", () => {
    const tokens = readTokenMap();
    const cases: Array<[string, string]> = [
      ["--of-badge-gray-text", "--of-badge-gray-bg"],
      ["--of-badge-blue-text", "--of-badge-blue-bg"],
      ["--of-badge-green-text", "--of-badge-green-bg"],
      ["--of-badge-orange-text", "--of-badge-orange-bg"],
      ["--of-badge-red-text", "--of-badge-red-bg"],
      ["--of-badge-purple-text", "--of-badge-purple-bg"],
    ];

    for (const [textToken, bgToken] of cases) {
      const ratio = contrastRatio(tokens[textToken], tokens[bgToken]);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("Breadcrumb 默认链接色应使用更高对比度的灰阶与语义强调色", () => {
    const breadcrumbSource = readSource("../components/breadcrumb/Breadcrumb.vue");
    const breadcrumbItemSource = readSource("../components/breadcrumb/BreadcrumbItem.vue");

    expect(breadcrumbSource).toContain("var(--of-color-gray-600, #475569)");
    expect(breadcrumbSource).toContain("var(--of-accent-strong, #0f172a)");
    expect(breadcrumbSource).toContain("var(--of-color-gray-800, #1e293b)");
    expect(breadcrumbItemSource).toContain("var(--of-color-gray-600, #475569)");
    expect(breadcrumbItemSource).toContain("var(--of-accent-strong, #0f172a)");
    expect(breadcrumbItemSource).toContain("var(--of-color-gray-800, #1e293b)");
  });
});
