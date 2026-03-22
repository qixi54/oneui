import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";

import {
  createOpsCommands,
  type OpsCommandWorkspace,
  type OpsCommandContext,
  type OpsAppSection,
} from "../dev/opsCommandRegistry";

describe("opsCommandRegistry", () => {
  it("creates fixed command set and dispatches expected workspace skeleton", async () => {
    const openCommandWorkspace = vi.fn<(workspace: OpsCommandWorkspace) => void>();
    const closeCommandWorkspace = vi.fn<() => void>();
    const toast = {
      info: vi.fn<(message: string) => void>(),
      success: vi.fn<(message: string) => void>(),
      warning: vi.fn<(message: string) => void>(),
      error: vi.fn<(message: string) => void>(),
    };

    const ctx: OpsCommandContext = {
      themeMode: ref("neutral"),
      activeSection: ref("base"),
      openCommandWorkspace,
      closeCommandWorkspace,
      toast,
    };

    const commandDeck = createOpsCommands(ctx);
    const byId = Object.fromEntries(commandDeck.map((cmd) => [cmd.id, cmd])) as Record<
      string,
      (typeof commandDeck)[number]
    >;

    expect(commandDeck).toHaveLength(4);
    expect(Object.keys(byId).sort()).toEqual([
      "new-task",
      "open-config",
      "open-dashboard",
      "open-log",
    ]);

    byId["new-task"].action();
    expect(openCommandWorkspace).toHaveBeenCalledTimes(1);
    expect(openCommandWorkspace.mock.calls.at(-1)?.[0]).toMatchObject({
      title: "新建任务工作流",
      subtitle: expect.any(String),
      mode: "sidepanel",
    });

    byId["open-log"].action();
    expect(openCommandWorkspace).toHaveBeenCalledTimes(2);
    expect(openCommandWorkspace.mock.calls.at(-1)?.[0]).toMatchObject({
      title: "执行日志面板",
      context: "命令：查看日志",
      mode: "drawer",
      details: expect.arrayContaining([
        expect.objectContaining({ label: "范围" }),
        expect.objectContaining({ label: "事件类型" }),
      ]),
    });

    byId["open-config"].action();
    expect(openCommandWorkspace).toHaveBeenCalledTimes(3);
    const configWorkspace = openCommandWorkspace.mock.calls.at(-1)?.[0];
    expect(configWorkspace).toMatchObject({
      title: "系统配置中心",
      mode: "sidepanel",
      actions: expect.arrayContaining([
        expect.objectContaining({
          key: "command-config-to-neutral",
          tone: "info",
        }),
      ]),
    });
  });

  it("switches section by command action and can call nested close operation", () => {
    const openCommandWorkspace = vi.fn<(workspace: OpsCommandWorkspace) => void>();
    const closeCommandWorkspace = vi.fn<() => void>();
    const toast = {
      info: vi.fn<(message: string) => void>(),
      success: vi.fn<(message: string) => void>(),
      warning: vi.fn<(message: string) => void>(),
      error: vi.fn<(message: string) => void>(),
    };

    const activeSection = ref<OpsAppSection>("base");
    const ctx: OpsCommandContext = {
      themeMode: ref("ops-console"),
      activeSection,
      openCommandWorkspace,
      closeCommandWorkspace,
      toast,
    };

    const commandDeck = createOpsCommands(ctx);
    const byId = Object.fromEntries(commandDeck.map((cmd) => [cmd.id, cmd])) as Record<
      string,
      (typeof commandDeck)[number]
    >;

    byId["open-dashboard"].action();
    expect(activeSection.value).toBe("dashboard");
    expect(openCommandWorkspace).toHaveBeenCalledTimes(1);

    const latestWorkspace = openCommandWorkspace.mock.calls.at(-1)?.[0];
    const closeAction = latestWorkspace?.actions.find((action) => action.key === "command-dashboard-close");
    expect(closeAction).toBeTruthy();
    closeAction?.handler();
    expect(closeCommandWorkspace).toHaveBeenCalledTimes(1);
  });
});
