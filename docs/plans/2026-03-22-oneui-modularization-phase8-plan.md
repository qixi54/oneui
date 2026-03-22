---
生成时间: 2026-03-22 11:49:39
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:666, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewDetailHost.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableHeaderRow.vue:198, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableSelectionBar.vue:36, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/ColumnHeaderMenu.vue:205, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDraftToolbar.vue:33, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFixedRegion.vue:99, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/index.vue:180, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/NumberCard.vue:45, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/TableChart.vue:68, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/BarChart.vue:52, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/PieChart.vue:73, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第八阶段的并发改写范围、风险、验收与回滚口径，继续降低 DatabaseView 详情适配耦合并扩大 semantic token 在 table/dashboard 高频组件中的覆盖
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 8 Plan

## Part 1: 执行摘要

phase7 已经把 `DataTable` 桌面子区域、`DatabaseView` toolbar adapter 和 layout/base 高频 token 覆盖收了一轮，但 `DatabaseView.vue` 仍然直接挂 detail presenter 适配，`table` 与 `dashboard` 高频壳层也仍有一批旧 token fallback 没被压到语义层。

本阶段目标不是扩新功能，而是在保持 `@oneflowui/ui` 对外导出、props、emits 和行为语义稳定的前提下，继续做三件高 ROI 的事情：为 `DatabaseView` 新增 detail host 适配层、把 table 高频壳层优先切到 semantic token、把 dashboard 高频容器和图表默认样式继续中性化。

本阶段只修改本地代码、测试和文档，不改共享数据库、不改服务端、不改外部运行环境。执行方式继续采用并发子代理，主线程只负责兜底实现、集成、验证、FlowAPI 和 Git 收口。

资源时间按 `1.0` 人日估算，其中 `0.2` 人日作为并发集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `DatabaseView.vue` 仍直接承接 detail presenter 适配 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:744` | database 场景层虽然已拆 toolbar，但 detail 层仍有内联桥接逻辑 | P0 |
| table 高频壳层仍混用旧 token fallback | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableHeaderRow.vue:198`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableSelectionBar.vue:36`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/ColumnHeaderMenu.vue:205` | neutral 与 ops-console 的语义层已经存在，但 table 默认表现还不够统一 | P0 |
| dashboard 高频容器和图表默认样式仍含旧 token 回退 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/index.vue:180`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/NumberCard.vue:45`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/TableChart.vue:68` | dashboard 默认质感还没有完全融到中性主题层 | P1 |
| 用户要求继续并发自代理推进 | 当前改写范围可自然拆成 database / table / dashboard 三个互斥写域 | 若不冻结写域，容易出现并发覆盖 | P0 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 新增 `DatabaseViewDetailHost.vue` | 承接 detail presenter 事件桥接和宽度分流 | 是 |
| 更新 `DatabaseView.vue` 接入 detail host | 保持对外行为稳定 | 是 |
| table 高频壳层 semantic token 清理 | 覆盖 `TableHeaderRow`、`DataTableSelectionBar`、`ColumnHeaderMenu`、`DataTableDraftToolbar`、`DataTableDesktopFixedRegion` | 是 |
| dashboard 高频容器和图表 semantic token 清理 | 覆盖 `Dashboard/index.vue`、`NumberCard.vue`、`TableChart.vue`，并微调 `BarChart.vue`、`PieChart.vue` 的默认语义来源 | 是 |
| 扩大包公开导出面 | 与本轮目标无关 | 否 |
| 改共享数据、服务端、发布版本号 | 与本轮目标无关 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 只做 `DatabaseView` host 抽离 | 改动面最小 | 不能顺手消化 table/dashboard 的高频 token debt | 不选 |
| 只做 token 清理，不碰 `DatabaseView` | 风险低 | database 场景层仍然残留 detail 适配耦合 | 不选 |
| 并发推进 database / table / dashboard 三条互斥写域 | 收益集中、集成风险可控、符合当前提速目标 | 需要主线程统一收口验证 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewDetailHost.vue` | detail adapter | 把 detail presenter 的宽度事件与 close/save/delete/commit 桥接从 `DatabaseView.vue` 中拿走 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue` | orchestrator | 保留状态编排，不再内联 detail presenter 宽度分流逻辑 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableHeaderRow.vue` 等 table 高频壳层 | token consumer | 默认优先消费 `surface / text / border / elevation` 语义层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/index.vue` 与 charts | token consumer | 默认优先消费 workspace/card/elevation/border 语义层 |

### 3.2 并发执行伪代码

```text
freeze write scopes
parallel:
  FE-DATABASE -> extract DatabaseView detail host
  FE-TABLE -> clean high-frequency table shells to semantic tokens
  FE-DASHBOARD -> clean dashboard containers/charts to semantic tokens
main-thread:
  materialize any missing patch
  review diffs
  run gates
  write docs
  update FlowAPI
  commit git
```

### 3.3 实现原则

1. 所有新增组件维持内部组件定位，不新增公共导出。
2. semantic token 清理优先收口默认值来源，不追求删光全部兼容 fallback。
3. `DatabaseViewDetailHost.vue` 只做 adapter，不接管状态。
4. 并发子代理只写冻结写域，主线程保留最终集成权。

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 8A | 新增 `DatabaseViewDetailHost.vue` 并接入 `DatabaseView.vue` | 无 | database detail adapter 独立落点形成 |
| Phase 8B | table 高频壳层 semantic token 清理 | 无 | 高频 table 容器默认更统一 |
| Phase 8C | dashboard 高频容器和图表 semantic token 清理 | 无 | dashboard 默认更中性化 |
| Phase 8D | 主线程门禁、FlowAPI、Git 收口 | 8A / 8B / 8C | 代码、文档、计划、任务一致闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 并发调度、兜底实现、集成、验证、留痕、提交 | 0.4 人日 |
| FE-A | Database detail host adapter | 0.2 人日 |
| FE-B | table semantic token 清理 | 0.2 人日 |
| FE-C | dashboard semantic token 清理 | 0.2 人日 |

总计 `1.0` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| detail host 抽离后宽度更新分流错误 | High | side-panel 与 drawer 共用 `update:width` 时桥接错误 | 用内部 host 组件显式分流 `update:side-panel-width` 与 `update:drawer-width` |
| table token 清理后交互反馈变淡 | Medium | hover/focus/selection 都被过度灰化 | 保留 `row-action`、`status-active` 等更高层语义别名 |
| dashboard 图表默认语义修改后对比度下降 | Medium | 轴线、描边、卡片渐变层级过弱 | 只改默认来源，不改组件 props API，保留 accent/status 色差 |
| 并发结果未完全落盘 | Medium | 子代理报告完成但主工作区未看到对应改动 | 主线程以工作区落盘为准，必要时直接 materialize 最终 patch |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| Stylelint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint:style'` |
| table + database 集成测试通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts'` |
| 新 detail host 与本轮高频组件已进入主路径 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "DatabaseViewDetailHost|TableHeaderRow|DataTableSelectionBar|ColumnHeaderMenu|Dashboard/index.vue|NumberCard.vue|TableChart.vue" src/components dist'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败。
2. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts` 回归。
3. `DatabaseView` detail overlay、table selection bar 或 dashboard 默认卡片视觉出现明显异常。

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/database src/components/table src/components/Dashboard docs/plans
git checkout HEAD -- src/components/database/DatabaseView.vue src/components/table src/components/Dashboard
rm -f src/components/database/DatabaseViewDetailHost.vue
npm run type-check
```

数据影响边界：

1. 本地代码：将被回滚。
2. 共享数据：未涉及。
3. 测试服务器代码：未涉及。
4. 生产服务器代码：未涉及。

## Part 9: 架构决策记录（ADR）

### ADR-001: 本轮允许主线程兜底 materialize 子代理未落盘结果

决策：如果子代理报告完成但主工作区未出现对应改动，主线程直接补齐最终 patch。

原因：对当前目标来说，稳定交付比等待代理状态一致性更重要。

### ADR-002: semantic token 清理优先覆盖高频 consumer，而不是继续扩 foundation

决策：本轮优先改高频 `table` 与 `dashboard` consumer 层，不继续扩大 `variables.css` 的 foundation 范围。

原因：foundation 层在 phase7 已够用，本轮更高 ROI 的事情是把 consumer 真正切过去。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:666`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewDetailHost.vue:1`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableHeaderRow.vue:198`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableSelectionBar.vue:36`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/ColumnHeaderMenu.vue:205`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDraftToolbar.vue:33`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFixedRegion.vue:99`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/index.vue:180`
9. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/NumberCard.vue:45`
10. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/TableChart.vue:68`
11. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/BarChart.vue:52`
12. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/Dashboard/charts/PieChart.vue:73`
13. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1`
14. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run lint:style`
4. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts`
5. `rg -n "DatabaseViewDetailHost|TableHeaderRow|DataTableSelectionBar|ColumnHeaderMenu|Dashboard/index.vue|NumberCard.vue|TableChart.vue" src/components dist`
6. 补充执行验证：`npm run build`
