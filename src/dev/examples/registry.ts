import type { Component, ComputedRef } from "vue";
import type { OpsAppSection } from "../opsCommandRegistry";
import { DatabaseViewDemo } from "./database";
import { ThemeScopeDemo } from "./theme";

export type ExampleThemeMode = "neutral" | "ops-console";

export type DevExampleDescriptor = {
  id: string;
  section: "shell" | "section";
  title: string;
  component: Component;
  when?: OpsAppSection;
  props?: () => Record<string, unknown>;
};

export type ExampleRegistryOptions = {
  themeMode: ComputedRef<ExampleThemeMode> | { value: ExampleThemeMode };
  scopedThemeMode: ComputedRef<ExampleThemeMode> | { value: ExampleThemeMode };
  scopedThemeSnippet: ComputedRef<string> | { value: string };
};

export function createDevExamplesRegistry(options: ExampleRegistryOptions): DevExampleDescriptor[] {
  return [
    {
      id: "theme-scope-demo",
      section: "shell",
      title: "ThemeScope Demo",
      component: ThemeScopeDemo,
      props: () => ({
        globalTheme: options.themeMode.value,
        scopedTheme: options.scopedThemeMode.value,
        snippet: options.scopedThemeSnippet.value,
      }),
    },
    {
      id: "database-view-demo",
      section: "section",
      when: "database-view",
      title: "DatabaseView Demo",
      component: DatabaseViewDemo,
    },
  ];
}
