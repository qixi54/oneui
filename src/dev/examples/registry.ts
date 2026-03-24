import type { Component, ComputedRef } from "vue";
import type { OpsAppSection } from "../opsCommandRegistry";
import { DatabaseDetailPrimitivesDemo, DatabaseViewDemo } from "./database";
import { ThemeScopeDemo } from "./theme";

export type ExampleThemeMode = "neutral" | "ops-console";
export type DevExampleGroup = "theme" | "database";

export type DevExampleDescriptor = {
  id: string;
  section: "shell" | "section";
  group: DevExampleGroup;
  order: number;
  title: string;
  summary: string;
  component: Component;
  when?: OpsAppSection;
  props?: () => Record<string, unknown>;
};

export type ExampleRegistryOptions = {
  themeMode: ComputedRef<ExampleThemeMode> | { value: ExampleThemeMode };
  scopedThemeMode: ComputedRef<ExampleThemeMode> | { value: ExampleThemeMode };
  scopedThemeSnippet: ComputedRef<string> | { value: string };
};

export function sortDevExamples(examples: DevExampleDescriptor[]): DevExampleDescriptor[] {
  return [...examples].sort((left, right) => left.order - right.order);
}

export function createDevExamplesRegistry(options: ExampleRegistryOptions): DevExampleDescriptor[] {
  return sortDevExamples([
    {
      id: "theme-scope-demo",
      section: "shell",
      group: "theme",
      order: 10,
      title: "ThemeScope Demo",
      summary: "局部主题作用域与 ThemeScopeScene 的轻量参考实现。",
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
      group: "database",
      order: 100,
      when: "database-view",
      title: "DatabaseView Demo",
      summary: "页面级数据库工作区示例，承接 enterprise demo 与 preset demo。",
      component: DatabaseViewDemo,
    },
    {
      id: "database-detail-primitives-demo",
      section: "section",
      group: "database",
      order: 110,
      when: "database-view",
      title: "Database Detail Primitives Demo",
      summary: "演示 DatabaseView detail slots 如何接入 workspace detail primitives。",
      component: DatabaseDetailPrimitivesDemo,
    },
  ]);
}
