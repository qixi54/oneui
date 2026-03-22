---
生成时间: 2026-03-22 11:59:47
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableToolbar.vue:94, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableFilterPanel.vue:158, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableColumnManager.vue:103, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:243, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/MobileListView.vue:149, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewShell.vue:73, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailWorkspace.vue:132, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/StatusBar.vue:48, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第九阶段的并发改写范围、实现顺序、风险与验收口径，继续收紧 toolbar 状态编排并扩大 secondary panel 与 database workspace 的语义主题覆盖
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 9 Plan

## Part 1: 执行摘要

phase8 已经把 `DatabaseView` 的 detail host 和 table/dashboard 第一批高频壳层收口了一轮，但 `TableToolbar.vue` 仍直接承接面板显隐、按钮定位与全局点击收束，secondary panel 与 database workspace 仍保留较多旧 token fallback。

本阶段目标只做三件事：把 `TableToolbar` 的面板编排抽成独立 composable、把 table secondary panel 默认视觉进一步切到 semantic token、把 database workspace 和壳层状态面统一到 workspace 语义层。

本阶段不新增公共组件 API，不改共享数据，不改服务端，不改版本号。执行方式继续采用并发子代理，主线程负责集成、门禁、FlowAPI 和 Git 收口。

资源时间按 `0.9` 人日估算，其中 `0.2` 人日预留给并发集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `TableToolbar.vue` 仍内联面板显隐与定位状态 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableToolbar.vue:94` | toolbar 组件同时承担交互编排和渲染，后续扩展 dropdown 行为时回归面过大 | P0 |
| table secondary panel 默认视觉仍大量依赖旧灰阶 fallback | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableFilterPanel.vue:158`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableColumnManager.vue:103`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:243`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/MobileListView.vue:149` | neutral 与 ops-console 在表格次级面板上的统一度不足 | P0 |
| database workspace 与状态壳层仍混用旧 surface 和 border fallback | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewShell.vue:73`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailWorkspace.vue:132` | database 场景的工作区质感未完全跟随 workspace 语义层 | P0 |
| status bar 还停留在基础 token 直连 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/StatusBar.vue:48` | layout 壳层收口不完整，底部状态区在不同皮肤下层级感不稳定 | P1 |
| 用户要求继续并发推进可以收掉的高 ROI 项 | `/tmp/dispatch-brief-phase9.md` 已冻结三个互斥写域 | 若不冻结写域直接并发，容易产生覆盖和重复改动 | P0 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 新增 `useTableToolbarPanels.ts` | 承接 panel visibility、dropdown positioning 与 outside click 收束 | 是 |
| 更新 `TableToolbar.vue` 接入新 composable | 保持 props、emits 与模板行为稳定 | 是 |
| table secondary panel semantic token 收口 | 覆盖 `TableFilterPanel.vue`、`TableColumnManager.vue`、`DetailSheet.vue`、`MobileListView.vue` | 是 |
| database workspace 与状态壳层语义层收口 | 覆盖 `DatabaseViewShell.vue`、`DatabaseDetailWorkspace.vue`、`StatusBar.vue` | 是 |
| 改 DataTable 主渲染结构 | 该项涉及面更大，留给后续阶段 | 否 |
| 新增 public export 或对外主题 preset | 与本轮目标无关 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 只改 token，不拆 toolbar 状态 | 风险更低 | `TableToolbar.vue` 仍继续累积交互编排负担 | 不选 |
| 只拆 toolbar composable，不碰次级面板 | 结构更清晰 | neutral 与 ops-console 在次级面板上仍不够统一 | 不选 |
| 并发推进 `toolbar-state / secondary-panels / database-theme` 三个互斥写域 | 收益集中，集成路径清晰，适合当前提速目标 | 需要主线程做统一门禁和冲突兜底 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useTableToolbarPanels.ts` | toolbar state engine | 集中管理 filter/sort/group/column 四类面板的显隐、按钮 ref、dropdown style 和 outside click 收束 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableToolbar.vue` | toolbar renderer | 只保留视图切换、事件透传和模板渲染，不再承接面板编排细节 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableFilterPanel.vue` 等 secondary panel 文件 | token consumer | 默认优先消费 `surface / text / border / elevation / workspace` 语义层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewShell.vue` 与 `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailWorkspace.vue` | database scene shell | 把状态面、workspace chip、action button 的默认来源切到 workspace 语义层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/StatusBar.vue` | layout shell | 让 status bar 与 workspace surface、text 和 feedback 语义一致 |

### 3.2 并发执行伪代码

```text
freeze phase9 write scopes
parallel:
  FE-TABLE-TOOLBAR -> extract toolbar panel state composable and update TableToolbar
  FE-SECONDARY-PANELS -> retarget secondary panel surfaces to semantic tokens
  FE-DATABASE-THEME -> retarget database shell, workspace, status bar to workspace semantics
main-thread:
  review landed diffs
  materialize missing changes if any agent result is not in workspace
  run type/lint/style/test/build gates
  write verification doc
  update FlowAPI evidence
  commit git
```

### 3.3 实现原则

1. `useTableToolbarPanels.ts` 只做状态与 DOM 事件编排，不引入新的业务语义。
2. 本轮 semantic token 收口以默认来源替换为主，兼容 fallback 允许保留。
3. secondary panel 与 database workspace 不新增 props，不改 emits，不改 DOM role 命名。
4. 主线程以工作区落盘结果为准；若子代理只提交方案未落盘，由主线程补齐最终 patch。

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 9A | 新增 `useTableToolbarPanels.ts` 并接入 `TableToolbar.vue` | 无 | toolbar 状态编排独立落点形成 |
| Phase 9B | secondary panel semantic token 收口 | 无 | table 次级面板默认质感更统一 |
| Phase 9C | database shell/workspace/status bar semantic token 收口 | 无 | database 与 layout 壳层更贴近 workspace 语义层 |
| Phase 9D | 主线程门禁、FlowAPI、Git 收口 | 9A / 9B / 9C | 代码、文档、计划、任务形成闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 并发调度、集成、门禁、验证、留痕、提交 | 0.3 人日 |
| FE-A | `useTableToolbarPanels` + `TableToolbar.vue` | 0.2 人日 |
| FE-B | table secondary panel semantic token 收口 | 0.2 人日 |
| FE-C | database shell/workspace/status bar semantic token 收口 | 0.2 人日 |

总计 `0.9` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| toolbar composable 抽离后 dropdown 定位错位 | High | ref 绑定或 `nextTick` 时机变化导致 panel 定位异常 | 保持现有定位算法不变，只迁移状态归属；用 `TableToolbar.vue` 原模板直接接入新 composable |
| outside click 收束丢失 | High | 全局事件解绑或 selector 收束逻辑遗漏 | 在 composable 内保留 mount/unmount 生命周期，并沿用现有 `.closest()` 判定 |
| 次级面板切换语义 token 后对比度不足 | Medium | hover、active、focus 都切成过轻 surface | 保留 `border-active`、`surface-selected` 等高层别名，不直接压成单一灰阶 |
| database workspace 动作按钮语义来源切换后层级不清 | Medium | save/delete/cancel 默认来源过于接近 | delete 保留 error 语义，save 保留 accent 语义，cancel 走 workspace raised 语义 |
| 并发结果与主工作区不一致 | Medium | 子代理返回完成但文件未落盘 | 主线程集成前先以 `git diff` 和工作区内容为准，必要时直接 materialize |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| Stylelint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint:style'` |
| table + database 集成测试通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts'` |
| toolbar composable 与本轮高频文件已进入主路径 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"useTableToolbarPanels|TableToolbar|TableFilterPanel|TableColumnManager|DetailSheet|MobileListView|DatabaseViewShell|DatabaseDetailWorkspace|StatusBar\" src/components src/composables dist'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败。
2. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts` 回归。
3. toolbar dropdown、secondary panel、database workspace 或 status bar 出现明显视觉或交互异常。

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/composables src/components/table src/components/database src/components/layout docs/plans
git checkout HEAD -- src/components/table/TableToolbar.vue src/components/table/TableFilterPanel.vue src/components/table/TableColumnManager.vue src/components/table/DetailSheet.vue src/components/table/MobileListView.vue src/components/database/DatabaseViewShell.vue src/components/database/DatabaseDetailWorkspace.vue src/components/layout/StatusBar.vue
rm -f src/composables/useTableToolbarPanels.ts
npm run type-check
```

数据影响边界：

1. 本地代码：将被回滚。
2. 共享数据：未涉及。
3. 测试服务器代码：未涉及。
4. 生产服务器代码：未涉及。

## Part 9: 架构决策记录（ADR）

### ADR-001: `TableToolbar` 状态抽到 composable，而不是继续在 SFC 内堆逻辑

决策：本轮新增 `useTableToolbarPanels.ts`，统一承接显隐、定位与全局事件收束。

原因：toolbar 的交互编排已经独立成一个稳定职责，继续留在 SFC 会拉高后续 dropdown 迭代成本。

### ADR-002: 次级面板与 database workspace 继续走 consumer 收口，而不是先扩 foundation token

决策：本轮优先让 secondary panel、database workspace、status bar 真正消费现有语义层，不继续扩大 foundation。

原因：foundation 和 semantic alias 在前几轮已可用，当前更高 ROI 的工作是让高频 consumer 真正切换默认来源。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableToolbar.vue:94`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableFilterPanel.vue:158`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableColumnManager.vue:103`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:243`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/MobileListView.vue:149`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewShell.vue:73`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailWorkspace.vue:132`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/StatusBar.vue:48`
9. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1`
10. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run lint:style`
4. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts`
5. `rg -n "useTableToolbarPanels|TableToolbar|TableFilterPanel|TableColumnManager|DetailSheet|MobileListView|DatabaseViewShell|DatabaseDetailWorkspace|StatusBar" src/components src/composables dist`
6. 补充执行验证：`npm run build`
