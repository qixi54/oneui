/* eslint-disable vue/one-component-per-file */
import { createApp, defineComponent } from "vue";
import { describe, expect, it, vi } from "vitest";
import OneflowUI, {
  pluginComponentNames,
  pluginComponentRegistry,
} from "../plugin";

describe("plugin install", () => {
  it("app.use(plugin) 后应注册 registry 中的全部组件", () => {
    const app = createApp(defineComponent({ template: "<div />" }));

    app.use(OneflowUI);

    expect(pluginComponentRegistry).toHaveLength(pluginComponentNames.length);
    for (const name of pluginComponentNames) {
      expect(app.component(name)).toBeTruthy();
    }
  });

  it("重复安装同一个 plugin 不应抛错", () => {
    const app = createApp(defineComponent({ template: "<div />" }));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(() => {
      app.use(OneflowUI);
      app.use(OneflowUI);
    }).not.toThrow();
    warnSpy.mockRestore();
  });
});
