import type { Ref } from "vue";

export type OpsAppSection =
  | "base"
  | "badge"
  | "layout"
  | "overlay"
  | "tabs"
  | "breadcrumb"
  | "split"
  | "mermaid"
  | "gallery"
  | "gantt"
  | "database-view"
  | "form"
  | "editor"
  | "detail"
  | "table"
  | "inline-edit"
  | "kanban"
  | "dashboard"
  | "auxiliary"
  | "ai"
  | "composables"
  | "new-atoms"
  | "biz-components"
  | "v3-components";

export type CommandWorkspaceMode = "drawer" | "sidepanel";

export type CommandTone = "info" | "success" | "warning" | "error";

export interface OpsCommandAction {
  key: string;
  label: string;
  tone: CommandTone;
  handler: () => void;
}

export interface OpsCommandWorkspace {
  title: string;
  subtitle: string;
  context: string;
  mode: CommandWorkspaceMode;
  details: Array<{ label: string; value: string }>;
  points: string[];
  actions: OpsCommandAction[];
}

export interface OpsCommand {
  id: string;
  label: string;
  hint: string;
  shortcut: string;
  tone: CommandTone;
  action: () => void;
}

export interface OpsCommandContext {
  themeMode: Ref<"neutral" | "ops-console">;
  activeSection: Ref<OpsAppSection>;
  openCommandWorkspace: (next: OpsCommandWorkspace) => void;
  closeCommandWorkspace: () => void;
  toast: {
    info: (message: string) => void;
    success: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string) => void;
  };
}

function withThemeLabel(ctx: OpsCommandContext) {
  return ctx.themeMode.value === "neutral" ? "Neutral" : "Ops Console";
}

function updateSection(ctx: OpsCommandContext, section: OpsAppSection) {
  ctx.activeSection.value = section;
}

export function createOpsCommands(ctx: OpsCommandContext): OpsCommand[] {
  const createOpenLogWorkspaceActions = () => [
    {
      key: "command-log-refresh",
      label: "刷新日志",
      tone: "info" as CommandTone,
      handler: () => ctx.toast.success("日志已刷新（模拟数据）"),
    },
    {
      key: "command-log-open-dashboard",
      label: "切到 Dashboard",
      tone: "warning" as CommandTone,
      handler: () => {
        updateSection(ctx, "dashboard");
        ctx.toast.info("已切到 Dashboard；你可继续在同页进行筛选");
        ctx.closeCommandWorkspace();
      },
    },
    {
      key: "command-log-close",
      label: "收起工作台",
      tone: "error" as CommandTone,
      handler: () => ctx.closeCommandWorkspace(),
    },
  ];

  const createDashboardLogWorkspaceActions = () => [
    {
      key: "command-log-refresh",
      label: "刷新日志",
      tone: "info" as CommandTone,
      handler: () => ctx.toast.success("日志已刷新（模拟数据）"),
    },
    {
      key: "command-log-open-dashboard",
      label: "回到 Dashboard",
      tone: "warning" as CommandTone,
      handler: () => {
        ctx.openCommandWorkspace({
          title: "Dashboard 工作视图",
          subtitle: "从日志入口回到大盘，继续沿同一上下文操作。",
          context: "命令：数据总览",
          mode: "drawer",
          details: [
            { label: "当前页面", value: "Dashboard 维度入口" },
            { label: "聚合范围", value: "任务、告警、吞吐" },
            { label: "建议操作", value: "先检查高优先告警，再看错误趋势" },
          ],
          points: [
            "卡片可联动到数据库视图与详情区",
            "日志与大盘状态保持可追溯引用关系",
            "通过同页命令切换，降低上下文损耗",
          ],
          actions: [],
        });
        ctx.toast.success("已返回 Dashboard 工作视图");
      },
    },
    {
      key: "command-log-close",
      label: "关闭日志",
      tone: "error" as CommandTone,
      handler: () => ctx.closeCommandWorkspace(),
    },
  ];

  return [
    {
      id: "new-task",
      label: "新建任务",
      hint: "快速创建一条新任务并分配负责人",
      shortcut: "⌘N",
      tone: "success",
      action: () =>
        ctx.openCommandWorkspace({
          title: "新建任务工作流",
          subtitle: "在右侧完成任务起草，无需跳转到独立页面。",
          context: "命令：新建任务",
          mode: "sidepanel",
          details: [
            { label: "模板", value: "标准任务模板（待办）" },
            { label: "默认优先级", value: "中" },
            { label: "预计时长", value: "2-4 小时" },
          ],
          points: [
            "支持快速补充负责人、到期时间、优先级",
            "支持批量创建同类任务并留存草稿",
            "自动跳过重复确认，直接提交到列表",
          ],
          actions: [
            {
              key: "command-create-draft",
              label: "生成草稿",
              tone: "info",
              handler: () => {
                ctx.toast.success("任务草稿已生成，可继续补充字段");
              },
            },
            {
              key: "command-create-submit",
              label: "立即提交",
              tone: "success",
              handler: () => {
                updateSection(ctx, "table");
                ctx.toast.success("任务已提交，当前已切到表格视图");
                ctx.closeCommandWorkspace();
              },
            },
            {
              key: "command-create-close",
              label: "收起工作台",
              tone: "warning",
              handler: () => {
                ctx.closeCommandWorkspace();
              },
            },
          ],
        }),
    },
    {
      id: "open-log",
      label: "查看日志",
      hint: "打开任务执行日志与系统事件",
      shortcut: "⌘L",
      tone: "info",
      action: () =>
        ctx.openCommandWorkspace({
          title: "执行日志面板",
          subtitle: "查看最近 20 条系统事件，支持错误级别高亮。",
          context: "命令：查看日志",
          mode: "drawer",
          details: [
            { label: "范围", value: "最近 30 分钟" },
            { label: "事件类型", value: "任务流、部署、数据库" },
            { label: "高优先级", value: "3 条未读告警" },
          ],
          points: [
            "关键告警默认置顶",
            "可直接点击跳转到关联任务（未实现：留给页面级实现）",
            "支持复制日志行作为排查备注",
          ],
          actions: createOpenLogWorkspaceActions(),
        }),
    },
    {
      id: "open-config",
      label: "配置中心",
      hint: "跳转系统配置与开关面板",
      shortcut: "⌘,",
      tone: "warning",
      action: () =>
        ctx.openCommandWorkspace({
          title: "系统配置中心",
          subtitle: "快速切换展示开关，当前仅提供中控台演示项。",
          context: "命令：配置中心",
          mode: "sidepanel",
          details: [
            { label: "主题", value: withThemeLabel(ctx) },
            { label: "命令面板", value: "常驻可见" },
            { label: "侧边栏", value: "支持收缩与展开" },
          ],
          points: [
            "常见配置不离开当前任务流程，直接在同页调整",
            "支持按域名与主题预设保存偏好",
            "与后续中台权限策略层对接可做按角色读写",
          ],
          actions: [
            {
              key: "command-config-to-neutral",
              label: "切到 Neutral",
              tone: "info",
              handler: () => {
                ctx.themeMode.value = "neutral";
                ctx.toast.success("已切换到 Neutral");
              },
            },
            {
              key: "command-config-to-ops",
              label: "切到 Ops Console",
              tone: "success",
              handler: () => {
                ctx.themeMode.value = "ops-console";
                ctx.toast.success("已切换到 Ops Console");
              },
            },
            {
              key: "command-config-close",
              label: "关闭",
              tone: "warning",
              handler: () => ctx.closeCommandWorkspace(),
            },
          ],
        }),
    },
    {
      id: "open-dashboard",
      label: "数据总览",
      hint: "打开 ProjectOpsCharts 的核心大屏入口",
      shortcut: "⌘D",
      tone: "info",
      action: () => {
        updateSection(ctx, "dashboard");
        ctx.openCommandWorkspace({
          title: "Dashboard 工作视图",
          subtitle: "聚合关键视图与告警，不离开原屏切换到 Dashboard 区块。",
          context: "命令：数据总览",
          mode: "drawer",
          details: [
            { label: "当前页面", value: "Dashboard 维度入口" },
            { label: "聚合范围", value: "任务、告警、吞吐" },
            { label: "建议操作", value: "先检查高优先告警，再看错误趋势" },
          ],
          points: [
            "点击卡片可联动到表格/看板视图（演示预留）",
            "错误趋势与任务吞吐支持一览对齐",
            "与日志面板联动可以降低页面跳转成本",
          ],
          actions: [
            {
              key: "command-dashboard-open-log",
              label: "打开最近日志",
              tone: "info",
              handler: () => {
                ctx.openCommandWorkspace({
                  title: "执行日志面板",
                  subtitle: "从 Dashboard 一键展开日志，避免来回切页。",
                  context: "命令：查看日志",
                  mode: "drawer",
                  details: [
                    { label: "来源", value: "一键联动日志" },
                    { label: "优先级", value: "WARNING/ERROR 增强展示" },
                    { label: "时间窗", value: "滚动加载（演示）" },
                  ],
                  points: [
                    "日志条目默认按时间倒序",
                    "支持从命令动作跳转到关联任务",
                    "支持复制日志片段（演示中）",
                  ],
                  actions: createDashboardLogWorkspaceActions(),
                });
                ctx.toast.success("已在同层打开日志面板");
              },
            },
            {
              key: "command-dashboard-to-database",
              label: "切到数据库视图",
              tone: "success",
              handler: () => {
                updateSection(ctx, "database-view");
                ctx.toast.success("已切到 DatabaseView");
                ctx.closeCommandWorkspace();
              },
            },
            {
              key: "command-dashboard-close",
              label: "收起面板",
              tone: "warning",
              handler: () => ctx.closeCommandWorkspace(),
            },
          ],
        });
      },
    },
  ];
}
