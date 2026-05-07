---
生成时间: 2026-03-30 14:40:45
参考文档: src/components/overlay/SidePanel.vue, src/composables/useOverlay.ts, src/tests/overlay.integration.spec.ts, README.md, src/theme.ts, src/styles/variables.css, src/styles/themes/neutral.css, src/styles/themes/ops-console.css
角色定义: ARCH
文档生成目的: 为 ONEUI-FE-00136 与 ONEUI-FE-00138 提供统一修复计划，冻结实现边界、验收标准、验证命令与回滚口径。
生成模型: GPT-5 Codex
---

# OneUI Issues 136 / 138 Remediation Plan

## Part 1: 执行摘要

当前 `oneui` 仓库对 `ONEUI-FE-00136` 与 `ONEUI-FE-00138` 已具备明确问题证据，但两者性质不同：`136` 是 overlay 行为缺陷，`138` 是 token 文档与消费契约缺口。`136` 的根因是 `SidePanel` 没有把 scroll lock / focus trap 控制透传到 `useOverlay`，导致工作区侧边栏场景错误锁定 `body`；`138` 的根因是主题入口已经存在，但仍缺“默认 token 清单 + bridge 指南 + 可引用参考实现”。

本轮目标不是扩新功能，而是一次性把这两类问题收口成可发布、可验证、可回滚的最小闭环：先修 `SidePanel` 的 overlay 协议，再补 token 文档与 bridge 指南，并落地一个轻量的 `tokens` 导出增强位。交付物限定在本地代码、测试与文档，不改共享数据库、不改服务器配置、不改生产环境。

FlowAPI `plan` 主链当前存在前置阻塞：`project_channel_readiness_preflight.py --project oneui --channel main` 返回 `project_or_channel_not_ready`。因此本轮先落本地 SOP 规划文档；待 `oneui/main` 的 plan readiness 恢复后，再按 canonical owner path 物化到 FlowAPI。

## Part 2: 需求分析

### 2.1 问题差异与优先级

| Issue | 优先级 | 类型 | 当前证据 | 用户影响 | 本轮目标 |
|---|---|---|---|---|---|
| `ONEUI-FE-00136` | P1 | 行为缺陷 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:45` 未透传 overlay 控制；`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:12` 与 `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:28` 默认锁滚动并激活 focus trap | `SidePanel` 作为工作区右侧面板时会锁死主内容滚动与交互 | 为 `SidePanel` 补 `lockScroll` / `trapFocus` 可控协议，并补测试 |
| `ONEUI-FE-00138` | P2 | 文档/契约缺口 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/README.md:113` 只说明 theme entry；`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/theme.ts:1` 只加载样式入口；`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:5` 提供默认 token 但未形成公开参考表 | 消费方无法系统性桥接 `--of-*` 与自有 token，接入成本高 | 补 token 参考文档、README bridge 指南，评估 `@oneflowui/ui/tokens` |

### 2.2 冻结范围

1. 行为修复范围：
   `src/components/overlay/SidePanel.vue`
   `src/composables/useOverlay.ts`
   `src/tests/overlay.integration.spec.ts`
2. 文档修复范围：
   `README.md`
   `README.en.md`
   `docs/CSS-TOKENS.md` 或等价新文档
3. 可选增强范围：
   `src/tokens.ts` 或 `tokens.json`
   `package.json`
   `src/index.ts`
4. 非范围：
   `Modal` / `Drawer` 的默认行为不在本轮变更
   不重构全部组件的 token 消费逻辑
   不触达共享数据、共享 Storage、测试服务器或生产服务器

### 2.3 需求决策矩阵

| 场景 | `lockScroll` | `trapFocus` | 预期行为 |
|---|---|---|---|
| Modal / Dialog / Drawer 默认浮层 | `true` | `true` | 锁定背景滚动，聚焦限制在浮层内 |
| SidePanel 作为临时 overlay | `true` | `true` | 保持当前兼容行为 |
| SidePanel 作为工作区 side shell | `false` | `false` | 不锁 `body`，不抢主内容交互，仍可 ESC 关闭 |

## Part 3: 详细方案

### 3.1 Issue 136 方案

#### 3.1.1 根因

1. `SidePanel` 目前只调用：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:45`
2. `useOverlay` 默认：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:12`
   `lockScroll = true`
3. 打开时执行：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:32`
   一方面写入 `document.body.style.overflow = "hidden"`，另一方面激活 focus trap。

#### 3.1.2 改写方案

1. 在 `UseOverlayOptions` 中新增 `trapFocus?: boolean`，默认值 `true`。
2. 在 `useOverlay` 的 `watch` 与 `onUnmounted` 分支中，把 `activateTrap/deactivateTrap` 绑定到 `trapFocus`，不要和 `lockScroll` 隐式耦合。
3. 在 `SidePanelProps` 中新增：
   - `lockScroll?: boolean`
   - `trapFocus?: boolean`
4. `SidePanel` 默认维持向后兼容：
   - `lockScroll: true`
   - `trapFocus: true`
5. `SidePanel` 透传：
   `useOverlay({ open, onClose, lockScroll: props.lockScroll, trapFocus: props.trapFocus })`
6. 不改 `Modal` / `Drawer` 公开 API，避免扩大回归面。

#### 3.1.3 伪代码

```ts
type UseOverlayOptions = {
  open: Ref<boolean> | (() => boolean)
  onClose: () => void
  escapeClose?: boolean
  lockScroll?: boolean
  trapFocus?: boolean
}

const { lockScroll = true, trapFocus = true } = options

watch(openGetter, (isOpen) => {
  if (lockScroll) body.overflow = isOpen ? "hidden" : ""
  if (isOpen) {
    bindEscape()
    if (trapFocus) activateTrap()
  } else {
    unbindEscape()
    if (trapFocus) deactivateTrap()
  }
})
```

### 3.2 Issue 138 方案

#### 3.2.1 根因

1. 当前 README 只解释“如何切主题”：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/README.md:113`
2. 主题入口只负责样式加载：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/theme.ts:1`
3. 默认 token 定义存在，但没有公开参考表：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:5`
4. `package.json` 已显式开放 `./tokens` 子路径导出，`src/index.ts` 已将 `tokens` 纳入根入口导出图。

#### 3.2.2 改写方案

本轮按三层交付，优先级自上而下：

1. `P0` 文档层：
   - README 新增 “Token Override / Theme Bridge” 章节
   - 说明 `@oneflowui/ui/styles` 与 `@oneflowui/ui/theme` 的差异
   - 提供 `:root` 和局部 wrapper 的桥接示例
2. `P0` 参考层：
   - 新增 `docs/CSS-TOKENS.md`
   - 从 `variables.css`、`neutral.css`、`ops-console.css` 抽取 token 分类与默认值
   - 至少覆盖 `surface / text / border / accent / state / shadow / radius / spacing / z-index`
3. `P1` 导出层：
   - 已新增 `@oneflowui/ui/tokens`
   - 导出默认 token 映射对象，供消费方查阅或桥接
   - 运行态结论是：本轮不再把它保留为可选项，而是作为已完成的最小增强位

#### 3.2.3 桥接示例要求

README 中至少提供以下形态之一，禁止只给口头说明：

```css
:root {
  --of-surface-canvas: var(--color-bg-page);
  --of-surface-elevated: var(--color-bg-panel);
  --of-text-primary: var(--color-text-primary);
  --of-text-secondary: var(--color-text-secondary);
  --of-border-subtle: var(--color-border-muted);
  --of-accent-default: var(--color-primary);
}
```

#### 3.2.4 文档生成策略

1. token 参考表优先自动从 `src/styles/variables.css` 读取，避免手抄漂移。
2. 若首轮不写脚本，至少在文档中显式说明真源是：
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:5`
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1`
   `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1`
3. README 与 `docs/CSS-TOKENS.md` 之间要形成“入口文档 + 完整清单”的职责分层。

## Part 4: 实现路线图

| 阶段 | 目标 | 预计时长 | 前置依赖 | 输出 |
|---|---|---:|---|---|
| Phase 0 | 冻结契约与范围 | 0.2 天 | 已完成 issue 对照 | 本计划文档 |
| Phase 1 | 修 `136` 协议与测试 | 0.3 天 | 无 | `SidePanel/useOverlay/overlay tests` |
| Phase 2 | 补 `138` README 与 token 文档 | 0.4 天 | Phase 1 可并行收尾 | `README* + docs/CSS-TOKENS.md` |
| Phase 3 | 实现 `tokens` 导出 | 0.2 天 | Phase 2 | `src/tokens.ts` + `src/index.ts` + `package.json` |
| Phase 4 | 跑验证、整理留痕 | 0.2 天 | Phase 1-3 | 测试结果、变更摘要、后续 FlowAPI materialize 口径 |

关键路径：

1. `Phase 1` 是唯一必须先完成的代码路径。
2. `Phase 2` 与 `Phase 3` 可局部并行，但 `Phase 3` 若引入导出入口，必须等待 README 口径冻结。

## Part 5: 工作量估计

| 角色 | 工作项 | 工作量 |
|---|---|---:|
| ARCH | 冻结行为契约、文档结构、验收标准 | 0.2 天 |
| FE | 修 `SidePanel/useOverlay`、补测试 | 0.3 天 |
| FE | 补 README / README.en / `docs/CSS-TOKENS.md` | 0.4 天 |
| FE | `tokens` 导出实现与导出契约核对 | 0.2 天 |
| QA | 执行 type/test/build + spot check | 0.2 天 |
| 合计 |  | 1.3 天 |

缓冲：

1. 预留 `20%` 缓冲给 token 文档整理与导出契约校准。
2. 若后续扩充 `tokens` 导出触发构建或 subpath 风险，再单独拆新任务，不回滚当前最小导出。

## Part 6: 风险评估

| 风险级别 | 风险 | 影响 | 应对方案 |
|---|---|---|---|
| High | `trapFocus` 改动影响 Modal/Drawer 行为 | overlay 键盘导航回归 | 只改 `useOverlay` 的可选参数，不改 `Modal/Drawer` 默认 props；补现有默认行为测试 |
| High | token 文档与样式真源漂移 | 文档失真，消费方照抄后仍出错 | 以 `variables.css`/主题文件为唯一真源；优先自动抽取或最少引用真源路径 |
| Medium | `tokens` 导出增加新的包边界风险 | `build`、consumer import 或 `exports` 回归 | 已用最小导出和显式 `./tokens` 子路径收口；后续扩充时再补 smoke |
| Medium | `SidePanel` 新 props 语义表述不清 | 业务方不知道何时用 `lockScroll=false` | 在 README 或组件文档明确写出“workspace side shell” 示例 |
| Low | 文档篇幅扩张导致 README 可读性下降 | 入口文档变重 | README 只保留桥接入口与示例，完整清单下沉到 `docs/CSS-TOKENS.md` |

## Part 7: 验收标准

### 7.1 功能验收

1. `SidePanel` 默认行为保持不变，打开后仍锁定 `body`。
2. `SidePanel` 在 `lockScroll=false` 时，不再写入 `document.body.style.overflow = "hidden"`。
3. `SidePanel` 在 `trapFocus=false` 时，不激活 focus trap，但仍保留 `Escape` 关闭能力。
4. README 明确说明：
   - `@oneflowui/ui/styles` 与 `@oneflowui/ui/theme` 的用途差异
   - 如何通过 `:root` 覆盖高频 `--of-*` token
   - 如何做局部 scope bridge
5. 存在完整 token 参考文档，且至少引用 `variables.css`、`neutral.css`、`ops-console.css` 三个真源。

### 7.2 验证命令

1. `npm exec vitest run src/tests/overlay.integration.spec.ts`
2. `npm run type-check`
3. `npm run build`
4. `rg -n "lockScroll|trapFocus" src/components/overlay/SidePanel.vue src/composables/useOverlay.ts`
5. `rg -n "@oneflowui/ui/theme|Token Override|Theme Bridge|CSS Tokens" README.md README.en.md docs/CSS-TOKENS.md`

### 7.3 完成定义

1. 本地代码已改：是
2. 共享数据已改：否
3. 测试服务器代码已同步：否
4. 生产服务器代码已同步：否

## Part 8: 回滚方案

### 8.1 代码回滚

1. 若 `136` 改动导致 overlay 行为异常，只回滚：
   `src/components/overlay/SidePanel.vue`
   `src/composables/useOverlay.ts`
   `src/tests/overlay.integration.spec.ts`
2. 若 `138` 文档或导出入口引发构建问题，只回滚：
   `README.md`
   `README.en.md`
   `docs/CSS-TOKENS.md`
   以及 `tokens` 相关新增文件

### 8.2 Runbook

1. 先执行：
   `npm exec vitest run src/tests/overlay.integration.spec.ts`
2. 若失败定位到 overlay 行为回归，恢复 `useOverlay` 和 `SidePanel` 到改动前版本。
3. 若失败定位到构建或导出问题，先移除 `tokens` 新导出，再重跑 `npm run build`。
4. 回滚后至少保留 README 的最小 bridge 说明，不让 `138` 完全回到无指导状态。

## Part 9: 架构决策记录

### ADR-001: `lockScroll` 与 `trapFocus` 分离，而不是用一个布尔值同时控制两者

决策：

1. 在 `useOverlay` 中显式提供 `trapFocus`。
2. `SidePanel` 透传 `lockScroll` 与 `trapFocus` 两个 props。

原因：

1. 锁滚动和聚焦约束是两个不同维度。
2. 工作区 side shell 需要“不锁滚动 + 不 trap focus”，后续也可以演化出“锁滚动但不 trap focus”之类的组合。

代价：

1. props 和 overlay API 多一个布尔值。
2. 需要补更明确的测试。

### ADR-002: `138` 先补“文档 + 参考表”，再决定 `tokens` 导出是否进入主路径

决策：

1. 本轮优先解决消费方“看不见默认 token”的问题。
2. `tokens` 导出作为增强项，只有在不引入额外构建/导出风险时才纳入本轮。

原因：

1. `138` 的核心痛点是接入与桥接成本，不是缺少又一个运行时代码入口。
2. README + token 文档能先解决大部分问题，风险最低。

## Part 10: 参考与附录

### 10.1 代码位置索引

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:6`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:45`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:4`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:11`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useOverlay.ts:28`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/overlay.integration.spec.ts:37`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/README.md:113`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/theme.ts:1`
9. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:5`
10. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1`
11. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1`

### 10.2 FlowAPI readiness 现状

当前执行：

```bash
python3 /opt/Oneflow/flowapi/code/dev/flowapi/scripts/project_channel_readiness_preflight.py \
  --base-url 'http://127.0.0.1:8900' \
  --project 'oneui' \
  --channel 'main' \
  --required-owner-path /api/plan/complete
```

结果：

1. `health.ok = true`
2. `owner_paths.ok = true`
3. `project_index.ok = true`
4. 总结论：`ok = true`

因此本计划当前 handoff 为：

1. `phase = plan_design`
2. `entity_type = plan`
3. `entity_id = pending_create`
4. `owner_path = /api/plan/preflight-lint`
5. `next_owner_path = /api/plan/preflight-lint`
6. `next_action = 执行 wrapper preflight-lint，通过后调用 /api/plan/create`
7. `fallback = 若 preflight 失败，则按 gate 返回继续收紧文档结构与代码锚点`
8. `status_interpretation = oneui/main readiness 已恢复，当前剩余工作是让 plan 文本通过结构化门禁`
