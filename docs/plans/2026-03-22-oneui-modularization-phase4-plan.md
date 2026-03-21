---
生成时间: 2026-03-22 02:15:45
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:216, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:238, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:655, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:756, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts:106, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:495
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第四阶段的范围、并发拆分、风险、验收与回滚口径，继续降低 DatabaseView 页面编排耦合，并统一 plugin 注册来源
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 4 Plan

## Part 1: 执行摘要

当前 `DatabaseView.vue` 已经完成第一轮状态与 renderer 抽离，但文件仍同时承担页面状态分流、loading/error/empty 状态壳、toolbar 编排、content 编排，以及 detail workspace 容器分流，模板和事件桥接仍偏重。与此同时，`src/plugin.ts` 仍手工维护一整套 lazy component 清单，与 `src/index.ts` 的导出面长期存在漂移风险。

本阶段目标不是改公开 API，而是在保持 `DatabaseView` props/emit 契约和插件安装方式不变的前提下，再把页面壳层抽成内部模块，并把 plugin 注册清单收敛成单一来源。范围限定为两条并行工作流：`DatabaseView` 的 shell/detail presenter 抽离，以及 `plugin` 的 registry single-source 改造。

本阶段只修改本地代码、测试和文档，不改共享数据库、不改服务端、不改外部运行环境。预期结果是进一步压缩 `DatabaseView.vue` 的模板复杂度，降低 plugin 注册维护成本，并补一条插件安装自动化验证。

资源时间按 `1.4` 人日估算，其中 `0.3` 人日作为并发集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `DatabaseView.vue` 同时承担壳层状态和 detail 容器分流 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:655` | 页面模板仍然重，后续再扩 scene 时改动面大 | P0 |
| detail workspace 的 `SidePanel/Drawer` 分支重复 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:756` | detail presentation 逻辑容易出现事件映射漂移 | P0 |
| toolbar/content/detail 事件桥接集中在单个页面组件 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:238` | 后续抽 controller 或 scene 适配器时边界不稳 | P1 |
| `plugin.ts` 手工维护 lazy 组件定义与注册数组 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts:1` | 新增组件时容易出现导出和安装不一致 | P0 |
| `index.ts` 与 `plugin.ts` 缺少显式共享 registry 概念 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts:1` | 难以对外提供“可安装组件清单”的稳定契约 | P1 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 抽离 `DatabaseView` 的状态壳层组件 | 收敛 loading/error/empty/normal 的模板分支 | 是 |
| 抽离 `DatabaseView` 的 detail presenter | 收敛 `SidePanel/Drawer` 分流和 `DatabaseDetailWorkspace` 复用模板 | 是 |
| 为 `plugin` 建立单一来源 registry | 收敛 lazy loader 定义、组件数组和 install 注册入口 | 是 |
| 新增插件安装自动化测试 | 防止 registry 缺项或 install 漂移 | 是 |
| 改 `DatabaseView` 的公开 props/emit 契约 | 会扩大验证面 | 否 |
| 改根导出的具名组件清单 | 风险高且收益低，本轮不动具名导出面 | 否 |
| 改 theme token / scene skin | 与本轮目标正交 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 只拆 `DatabaseView` 模板 | 风险低 | plugin 注册漂移问题继续存在 | 不选 |
| 只做 plugin registry 单一来源 | 收益稳定 | 页面层复杂度不下降 | 不选 |
| 同时做页面壳层抽离 + plugin registry 收敛 | 两个边界同时变清晰，且写入集合基本不冲突 | 集成时需要多一轮回归 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewShell.vue` | renderer-shell | 承接 toolbar、content、empty/error/loading state 壳层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailPresenter.vue` | renderer-shell | 承接 `SidePanel/Drawer` 切换和 `DatabaseDetailWorkspace` 事件桥接 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue` | orchestrator | 保留状态编排、record/view 逻辑、emit 行为，不再直接持有重模板 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/registry/plugin-components.ts` | delivery registry | 作为 plugin lazy registry 的单一来源 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts` | delivery install | 消费 registry 并执行 `app.component(...)` 注册 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/plugin.install.integration.spec.ts` | regression | 验证 install 后关键组件可被宿主识别 |

### 3.2 `DatabaseViewShell` 方案

`DatabaseViewShell.vue` 输入：

1. `renderState`
2. `effectiveError`
3. `showToolbar`
4. `toolbarProps`
5. `contentProps`
6. `emptyStateProps`

输出事件：

1. `toolbar:*`
2. `content:*`

实现原则：

1. `DatabaseViewShell` 只承载页面渲染分支，不触碰 `useDatabaseView`、`useDatabaseWorkspaceState` 和本地 record patch 逻辑。
2. toolbar 和 content 事件只做无状态透传，状态写回仍由 `DatabaseView.vue` 统一控制。

### 3.3 `DatabaseDetailPresenter` 方案

`DatabaseDetailPresenter.vue` 输入：

1. `visible`
2. `presentation`
3. `title`
4. `sidePanelWidth`
5. `drawerWidth`
6. `workspaceProps`

输出事件：

1. `update:side-panel-width`
2. `update:drawer-width`
3. `close`
4. `commit`
5. `save`
6. `delete`
7. `update:presentation`

伪代码：

```text
if !visible -> render nothing
if presentation === side-panel -> render SidePanel + DatabaseDetailWorkspace
else -> render Drawer + DatabaseDetailWorkspace
workspace events -> emit upward without local state mutation
width events -> emit upward for parent clamp/save
```

### 3.4 plugin registry single-source 方案

本轮新增 `src/registry/plugin-components.ts`，保存：

1. `lazyRegistryComponent(name, loader)` 辅助函数
2. `pluginComponents` 数组
3. `registerOneUIComponents(app)` 安装函数

`src/plugin.ts` 只保留：

1. `install(app)`
2. `installedApps` 幂等保护
3. 对 `registerOneUIComponents` 的调用

说明：

1. `src/index.ts` 暂不消除具名导出清单，但会暴露 `pluginComponents` 或等效 registry 元信息，作为后续统一导出层的桥头堡。
2. 组件懒加载路径仍保持当前行为，不改宿主使用方式。

### 3.5 测试方案

新增 `plugin.install.integration.spec.ts` 覆盖两类验证：

1. `app.use(plugin)` 后关键组件名可以从 app context 取到。
2. 重复安装不会抛错，也不会丢注册结果。

已有 `database-view.integration.spec.ts` 继续作为页面级回归硬门禁，验证：

1. toolbar 切视图
2. loading / empty / error state
3. side-panel / drawer detail workspace 契约
4. workspace preference 记忆

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 4A | 新增 `DatabaseViewShell.vue` 和 `DatabaseDetailPresenter.vue` | 无 | `DatabaseView.vue` 模板明显收缩 |
| Phase 4B | 新增 `plugin-components.ts`，收敛 plugin lazy registry | 无 | plugin install 清单有单一来源 |
| Phase 4C | 新增 `plugin.install.integration.spec.ts` 并完成集成接线 | 4A / 4B | 页面壳层与 plugin 注册均有自动化回归 |
| Phase 4D | FlowAPI closeout、验证文档、git 提交 | 4C | 计划、任务、文档、代码一致闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 计划冻结、FlowAPI 留痕、并发集成、提交 | 0.4 人日 |
| FE-A | `DatabaseView` shell/detail presenter 抽离 | 0.5 人日 |
| FE-B | plugin registry 单一来源 + 插件安装测试 | 0.3 人日 |
| QA | 本轮以自动化验证代替独立 QA | 0.2 人日 |

总计 `1.4` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| detail presenter 事件桥接漂移 | High | `close/save/delete/commit` 在 presenter 中映射错误 | 用 `database-view.integration.spec.ts` 的 detail workspace 用例做硬门禁 |
| loading/error/empty state 文案或 data-role 回归 | Medium | shell 抽离时改了状态分支或属性 | 保持原 `data-role` 和文案结构不变，依赖现有测试断言 |
| plugin registry 漏注册组件 | High | 新 registry 数组缺项或名称不一致 | 新增 `plugin.install.integration.spec.ts`，并校验核心组件名 |
| `plugin.ts` 与 `index.ts` 再次漂移 | Medium | registry 文件只接入 `plugin.ts`，未暴露元信息 | 在 `src/index.ts` 暴露 registry 元信息或安装辅助出口 |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| DatabaseView 与 plugin 安装回归通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/database-view.integration.spec.ts src/tests/plugin.install.integration.spec.ts'` |
| 新模块已进入主路径 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"DatabaseViewShell|DatabaseDetailPresenter|pluginComponents|registerOneUIComponents\" src'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败
2. `database-view.integration.spec.ts` 或 `plugin.install.integration.spec.ts` 回归
3. 插件安装后宿主拿不到核心组件

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/database src/plugin.ts src/index.ts src/registry src/tests docs/plans
git checkout HEAD -- src/components/database/DatabaseView.vue src/plugin.ts src/index.ts
rm -f src/components/database/DatabaseViewShell.vue
rm -f src/components/database/DatabaseDetailPresenter.vue
rm -f src/registry/plugin-components.ts
rm -f src/tests/plugin.install.integration.spec.ts
npm run type-check
```

数据影响边界：

1. 本轮只改本地代码，不改共享数据库。
2. 不涉及共享存储、测试服务器、生产服务器配置。

## Part 9: 架构决策记录（ADR）

### ADR-001: 本轮优先抽壳层，不继续下钻 `useDatabaseView`

决策：`useDatabaseView.ts` 暂不拆 provider/view/selection 子引擎，本轮先把页面壳层与 detail presenter 抽离。

原因：当前页面层复杂度对后续 scene 复用的阻碍更直接，而 `useDatabaseView` 的契约已经先于本轮被冻结。

### ADR-002: plugin registry 先服务 install，不强行重写全部根导出

决策：本轮先建立 `plugin` 的单一来源 registry，并在 `index.ts` 暴露 registry 元信息，不一次性改写全部具名导出。

原因：install 漂移是当前最直接的维护风险，而根导出清单涉及 tree-shaking 和包消费面，适合后续再收口。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:216`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:238`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:655`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:756`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts:1`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts:106`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts:1`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:495`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run test -- src/tests/database-view.integration.spec.ts src/tests/plugin.install.integration.spec.ts`
4. `rg -n "DatabaseViewShell|DatabaseDetailPresenter|pluginComponents|registerOneUIComponents" src`
5. 补充执行验证：`npm run build`
