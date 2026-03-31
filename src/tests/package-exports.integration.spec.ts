import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type PackageJson = {
  exports?: Record<string, unknown>;
  sideEffects?: string[];
};

function readPackageJson(): PackageJson {
  const packageJsonPath = resolve(process.cwd(), "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
}

describe("package exports", () => {
  it("should expose stable subpath exports for composables and types", () => {
    const packageJson = readPackageJson();

    expect(packageJson.exports).toMatchObject({
      "./composables": {
        types: "./dist/composables/index.d.ts",
        import: "./dist/composables.js",
      },
      "./theme": {
        types: "./dist/theme.d.ts",
        import: "./dist/theme.js",
      },
      "./tokens": {
        types: "./dist/tokens.d.ts",
        import: "./dist/tokens.js",
      },
      "./types": {
        types: "./dist/types/index.d.ts",
        import: "./dist/types/index.js",
      },
      "./styles": "./dist/style.css",
    });
  });

  it("should mark nested css assets as side effects", () => {
    const packageJson = readPackageJson();

    expect(packageJson.sideEffects).toContain("**/*.css");
    expect(packageJson.sideEffects).toContain("./dist/theme.js");
  });
});
