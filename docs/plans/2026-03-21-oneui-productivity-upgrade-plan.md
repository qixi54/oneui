---
生成时间: 2026-03-21 17:22:46
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:84, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:587, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:64, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:765, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/Drawer.vue:78, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:81, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/detail/DetailLayout.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:590, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:916, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:2526, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:2847
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI 建立从“修复期”切换到“产品力提升期”的三个月执行计划，并把当前最值得投入的 ROI 方向、任务拆分、依赖和验收口径冻结为可派发 plan
生成模型: GPT-5 Codex
---

# OneUI Productive UX Upgrade Plan

## Part 1: 执行摘要

OneUI 的兼容性包袱和显性设计残留已经基本清理完成，下一阶段不应再把资源消耗在“继续修补默认样式”，而应转向“提升单页面生产力”和“降低用户上下文切换成本”。

当前仓库已经具备这条升级路线所需的基础能力：`DataTable` 已有 density、列宽和详情 sheet 能力，`DatabaseView` 已有 `detailPresentation` 契约，`Drawer`、`SidePanel`、`DetailLayout` 已有工作区雏形，`neutral` 与 `ops-console` 主题分层也已建立。这意味着 OneUI 已经不缺“基础组件”，缺的是把这些能力编排成更连续的工作流。

本计划冻结一条 3 个月主线：先做 `上下文原地完成` 和 `数据行高效操作` 两个 P0 工作流，再用 `智能响应` 与 `语义主题 polish` 作为支撑层，最终把 OneUI 从“能展示后台”推进到“能支撑高频运营和管理动作”的专业级中控组件库。

范围明确限制在 OneUI 组件库与 dev 演示壳，不包含业务后端、权限系统、真实保存回滚策略和生产部署。

## Part 2: 需求分析

### 2.1 当前现状

| 现状 | 证据 | 结论 |
|------|------|------|
| 表格已有 `density`、列宽、自适配最小宽度 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:84`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:587` | 已有操作密度基础，但未形成真正的“高频编辑工作流” |
| 数据库页已有 `detailPresentation` 契约 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:64`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:765` | 已有“右侧工作区 / 移动端 sheet fallback”基础，但仍偏 demo 契约 |
| `Drawer`、`SidePanel`、`DetailLayout` 已能承载详情工作区 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/Drawer.vue:78`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:81`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/detail/DetailLayout.vue:1` | 上下文原地完成已有骨架，可进入产品化强化 |
| dev 已明确提出 `detailPresentation`、`density`、`detail workspace` 语义 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:590`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:2526`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:2847` | 设计意图已出现，问题不在方向，而在实现深度 |
| 主题层已完成 `neutral + ops-console` 分层 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1` | 视觉统一不再是主矛盾，但语义命名和状态体验仍可继续收口 |

### 2.2 核心问题

| 问题 | 当前表现 | 对业务生产力的影响 | 优先级 |
|------|----------|--------------------|--------|
| 页面切换仍偏重 | 详情、配置、上下文查看仍偏演示式，不是统一工作区工作流 | 用户查看记录、编辑字段、回看活动时需要中断上下文 | P0 |
| 数据行操作仍不够“就地完成” | `DataTable` 有 cell 编辑能力，但缺统一 action row、批量行级操作契约和 hover affordance | 高频运营动作步骤偏多，难以形成专业级操作密度 | P0 |
| 响应式更多是 viewport 逻辑，不是 container-aware 逻辑 | 当前主要依赖 `breakpoint`、density 和最小宽度策略 | 在不同壳布局、侧栏折叠、分栏 workspace 下，自适配仍不够聪明 | P1 |
| 主题虽然已分层，但语义变量仍可更贴近场景 | 现有 token 仍偏“颜色命名 + 组件消费” | 后续品牌换肤、深色模式或行业主题扩展成本仍偏高 | P1 |

### 2.3 优先级决策矩阵

| 业务痛点 | 优先工作流 | 本计划决策 |
|----------|------------|------------|
| 查找信息慢、频繁跳页 | Contextual Overlays | 第一优先级 |
| 行内操作繁琐、填报链路长 | Action-Oriented Data | 第一优先级 |
| 屏幕空间利用率不高 | Smart Responsive UI | 第二优先级 |
| 观感不够专业 | Theming Polish | 第二优先级 |

### 2.4 非目标

1. 本计划不引入新设计系统，不重写 OneUI 基础 token。
2. 本计划不承诺真实业务保存、权限、审批或审计闭环。
3. 本计划不把 dev demo 直接做成完整业务后台。
4. 本计划不在第一阶段引入 dark mode 完整方案。

## Part 3: 详细方案

### 3.1 产品阶段切换原则

从本计划开始，OneUI 的工作主语从“修复某个组件样式或兼容性”切换为“提高单位页面的可完成业务量”。所有后续需求默认先问两个问题：

1. 这个改动是否减少了页面跳转？
2. 这个改动是否提高了用户在当前上下文内完成关键操作的效率？

如果两个问题都不能回答为“是”，该需求不应进入主线优先级。

### 3.2 四条工作流

#### 3.2.1 Workstream A: Contextual Overlays

目标：把详情查看、轻量配置、记录上下文和活动轨迹，尽量收敛到右侧工作区或 drawer，不再优先跳转新页面。

当前锚点：
1. `DatabaseView` 已有 `detailPresentation` 和选中记录逻辑：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:64`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:765`
2. `Drawer`、`SidePanel` 已有基本壳结构：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/Drawer.vue:78`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:81`
3. `DetailLayout` 已能组织主内容 + 属性面板 + 活动记录：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/detail/DetailLayout.vue:1`

改造要求：
1. 冻结统一的 `detail workspace contract`，让 `table / gallery / kanban / timeline` 都能把当前记录送入同一类右侧工作区。
2. 明确桌面端优先 `side-panel`，移动端优先 `sheet`，只有页面明确声明时才使用 `full-page`。
3. 把标题、meta、属性面板、活动记录和 footer action 的承载边界固定在工作区契约内，不再由页面各自拼装。

#### 3.2.2 Workstream B: Action-Oriented Data

目标：让用户在表格或列表里直接完成最常见的 2-3 个操作，不再通过跳页或重型弹窗完成。

当前锚点：
1. `DataTable` 已有 `useInlineEdit`、列宽控制、keyboard、row drag 等能力：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1`
2. `DetailSheet` 已能承载结构化字段 + content 字段：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:1`
3. dev 已有 `inline-edit` 演示区：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:3293`

改造要求：
1. 为行 hover/selection 提供统一 `action row` 插槽和默认按钮规范。
2. 让 inline edit、row action、detail workspace 形成统一升级路径，而不是彼此割裂。
3. 明确 `readonly / editable / quick-action-enabled` 三类状态矩阵，避免组件各自猜测。

#### 3.2.3 Workstream C: Smart Responsive UI

目标：把响应式从“页面宽度断点”推进到“容器能力感知”，让布局变化真正反映到信息密度与显示策略上。

当前锚点：
1. `DataTable` 已有 density 和 fill-width 策略：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:182`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:587`
2. `DatabaseView` 与 dev 已明确提出 `density` 页面契约：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:594`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue:2526`

改造要求：
1. 优先在 `DataTable / Dashboard / GalleryView` 建立 container-aware 策略，不先全库铺开。
2. 第一阶段允许使用 `container-type` + `ResizeObserver` 混合方案，不强行要求所有能力都用纯 CSS 完成。
3. 决策口径必须写成矩阵，明确“空间增大时增加什么、空间减小时收缩什么”，禁止模糊写成“自适应布局增强”。

#### 3.2.4 Workstream D: Theming Polish

目标：把现有中性主题进一步提升到“语义场景级命名”，为未来品牌皮肤和深色方案做低成本准备。

当前锚点：
1. `neutral` 和 `ops-console` 已建立：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1`
2. `DetailLayout`、`Drawer`、`SidePanel` 仍有状态和表面语义可继续统一：`/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/detail/DetailLayout.vue:21`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/Drawer.vue:145`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue:141`

改造要求：
1. 从颜色命名继续迁移到场景命名，例如 `status-active / workspace-border / row-action-hover`。
2. 只在高频工作流组件收口，不为追求完美而全库重命名。
3. 所有主题 polish 都必须服务于 `A/B/C` 三个工作流，不允许独立成为主线。

### 3.3 方案权衡

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 先做纯视觉 polish | 见效快 | 不提升用户完成任务效率 | 不作为主线 |
| 先做 container queries 全库铺开 | 技术上先进 | 覆盖面大，ROI 不稳定 | 缩到 P1 支撑层 |
| 先做 detail workspace + 行内操作 | 直接减少跳页与操作步骤 | 需要同步冻结契约 | 作为主线 |
| 先把所有组件都引入复杂状态机 | 理论完整 | 会拖慢迭代，不符合当前阶段 | 不采用 |

### 3.4 决策矩阵

| 条件 | 呈现方式 | 组件行为 |
|------|----------|----------|
| 桌面端 + 列表页 + 已选择记录 | `side-panel` | 保持列表上下文，右侧展示详情工作区 |
| 移动端 + 已选择记录 | `sheet` | 以 `DetailSheet` 承载详情，关闭后回到列表 |
| 记录可编辑 + hover 行出现 | `action row` | 暴露编辑、详情、更多操作 |
| 记录只读 | `readonly action row` | 只暴露查看、复制、链接等非破坏动作 |
| 容器宽度增加 | `container-aware density up` | 扩充可见列、显示次级信息 |
| 容器宽度减少 | `container-aware density down` | 收起次级列，保留主字段与快捷动作 |

### 3.5 伪代码

```text
when record selected:
  resolve detailPresentation by page contract + viewport
  if desktop and page allows workspace:
    open side-panel workspace
  else:
    open detail sheet

when row hovered and row is actionable:
  reveal action row
  keep inline edit and detail action on same interaction ladder

when container width changes:
  recompute density and visible affordances
  do not only rely on viewport breakpoint

when product skin changes:
  update semantic scene tokens
  do not rewrite interaction structure
```

## Part 4: 实现路线图

| 阶段 | 时间 | 目标 | 产物 |
|------|------|------|------|
| Phase 0 | 0.5 天 | 冻结契约 | 规划文档、任务 DAG、组件边界矩阵 |
| Phase 1 | 3-4 天 | 上下文原地完成 | `DatabaseView + Drawer/SidePanel + DetailLayout` 统一 detail workspace |
| Phase 2 | 3-4 天 | 数据行高效操作 | `DataTable + TableRow + FieldCell` 的 action row / inline edit ladder |
| Phase 3 | 3 天 | 智能响应 | `DataTable + Dashboard + GalleryView` 的 container-aware 策略 |
| Phase 4 | 1.5-2 天 | 主题 polish 与验证 | 场景语义 token 收口、demo 校验、文档更新 |

总工期估计：`11 - 14 人天`。按 20% 缓冲估计，完整首轮落地窗口为 `3 周`。三个月窗口用于二轮打磨、消费侧试点和设计回看，不等于第一轮编码时长。

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 契约冻结、任务拆解、验收口径、阶段回看 | 1.5 天 |
| FE | Contextual Overlays | 3.5 天 |
| FE | Action-Oriented Data | 3.5 天 |
| FE | Smart Responsive UI | 3.0 天 |
| FE | Theming Polish | 1.5 天 |
| QA | demo 场景回归、响应式回归、文档核对 | 1.5 天 |

总计：`14.5 人天`。关键路径为 `契约冻结 -> overlays -> data actions -> responsive -> QA`。`Theming Polish` 可与 `responsive` 后半段并行，但不得早于契约冻结。

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对方案 |
|------|------|------|----------|
| detail workspace 契约过宽 | High | 若一开始把所有业务场景都塞进契约，会导致组件边界失控 | 第一阶段只覆盖 `record detail / comment / prop panel / footer action` |
| 行内编辑与详情工作区状态冲突 | High | 同一记录会同时落入 hover、edit、selected 状态 | 先冻结状态矩阵，再编码 |
| container-aware 方案落地不稳 | Medium | 不同宿主布局下仅靠 CSS 会不够用 | 允许 `ResizeObserver + CSS` 混合实现 |
| 主题 polish 反客为主 | Medium | 团队容易回到“只改视觉”的惯性 | 所有主题工作都必须绑定到 overlays / actions / responsive 场景 |
| dev demo 与真实消费场景脱节 | Medium | demo 看起来完整，但 consumer 接入路径不清楚 | Phase 4 增加 consumer-style smoke 页面与使用说明 |

## Part 7: 验收标准

1. 已存在正式规划文档并进入 FlowAPI plan 主链
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && test -f docs/plans/2026-03-21-oneui-productivity-upgrade-plan.md'
   ```
2. `detail workspace contract` 在代码中有统一入口，不再由页面各自拼装
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "detailPresentation|DetailWorkspace|detail workspace|side-panel|sheet" src/components/database src/components/detail src/components/overlay src/dev/App.vue'
   ```
3. `DataTable` 存在统一的行级快捷动作或等价契约入口
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "action row|row action|quick action|inline edit|hover" src/components/table'
   ```
4. 至少一个核心数据组件具备 container-aware 响应策略
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "@container|container-type|ResizeObserver" src/components/table src/components/Dashboard src/components/gallery'
   ```
5. 语义主题变量新增场景级命名，并在高频工作流组件被消费
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "workspace-|row-action-|status-active|surface-workspace" src/styles src/components'
   ```
6. 实现层静态验证通过
   ```bash
   bash -lc "cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check && npm run test && npm run build"
   ```

## Part 8: 回滚方案

1. 若 `detail workspace` 契约落地后侵入过大，先回滚为 `DatabaseView` 层桥接，不立即下沉到全库共用组件。
2. 若行级快捷动作导致表格交互噪音过高，保留 inline edit，暂时关闭默认 hover action，仅保留插槽契约。
3. 若 container-aware 方案引发布局回归，回退到现有 `density + breakpoint` 逻辑，不阻塞 overlays 和 actions 主线。
4. 若语义 token 命名收口过大，先在新增工作流组件内局部使用，不做全库替换。

## Part 9: 架构决策记录（ADR）

### ADR-1：主线优先级从视觉修补切换到业务生产力

- 状态：Accepted
- 原因：OneUI 当前的主要瓶颈已不是“组件不好看”，而是“单页面内可完成的业务动作不够多”
- 影响：后续需求优先看是否减少跳页、是否提高上下文连续性

### ADR-2：优先做 workspace + row actions，不先做全库 container query

- 状态：Accepted
- 原因：前者直接改善核心操作路径，后者更适合作为结构性增强
- 影响：容器响应能力作为第二优先级推进

### ADR-3：Theming Polish 作为支撑层，不单独占用主线

- 状态：Accepted
- 原因：主题收口只有在服务工作流时才有高 ROI
- 影响：所有主题命名收口都必须绑定真实场景

## Part 10: 参考和附录

### 10.1 首批目标文件

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/detail/DetailLayout.vue`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/Drawer.vue`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/FieldCell.vue`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue`
9. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/index.vue`
10. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryView.vue`
11. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css`
12. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css`
13. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue`

### 10.2 任务拆分原则

1. 先由 ARCH 冻结契约和矩阵，再让 FE 并发实现。
2. `Contextual Overlays` 与 `Action-Oriented Data` 允许并行，但都依赖契约任务完成。
3. `Smart Responsive UI` 依赖 overlays 和 data actions 的交互承载边界冻结。
4. QA 只在实现完成后进入，不代替开发期验证。

### 10.3 计划级结论

这条计划不是“再修 OneUI”，而是把 OneUI 推进成更像工作台而不是组件展示册的产品底座。判断这条计划是否成功，不看样式改了多少，而看用户是否更少离开当前页面、是否能在同一上下文里完成更多关键动作。
