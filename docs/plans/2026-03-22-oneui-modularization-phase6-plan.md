---
生成时间: 2026-03-22 10:49:53
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:750, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:768, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:974, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1091, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1267, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:255
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第六阶段的范围、并发拆分、风险、验收与回滚口径，继续降低 DataTable 桌面渲染复杂度并为后续 fixed/standard 子壳继续拆分建立稳定边界
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 6 Plan

## Part 1: 执行摘要

当前 `DataTable.vue` 已经完成状态层的第一轮抽离，但桌面渲染部分仍同时承担 `selection bar`、`fixed columns region`、`scroll region`、`standard mode`、`resize indicator`、`draft toolbar` 以及与这些分支绑定的局部样式。文件主体虽然比之前更清晰，但桌面模板和样式仍是当前最大的复杂度来源。

本阶段目标不是再改状态，不是继续扩主题，而是在保持 `DataTable` props/emit 契约和既有行为不变的前提下，把桌面渲染壳抽成内部 renderer-shell，让 `DataTable.vue` 收敛成“mobile 分支 + 状态编排 + overlay/toolbar 收口”。范围限定为一条主工作流：新增 `DataTableDesktopFrame.vue`，承接桌面三大分支模板与对应局部样式，并将 `DataTable.vue` 改为消费该内部组件。

本阶段只修改本地代码、测试和文档，不改共享数据库、不改服务端、不改外部运行环境。预期结果是显著压缩 `DataTable.vue` 的模板体积，稳定固定列与标准模式的视图边界，并为下一轮继续拆 `fixed-region / scroll-region / standard-grid` 子壳打基础。

资源时间按 `1.3` 人日估算，其中 `0.2` 人日作为桌面壳集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `DataTable.vue` 直接持有完整桌面分支模板 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:750` | 主表格组件仍然既做状态又做复杂桌面视图编排，后续继续拆 fixed/standard 子壳时风险高 | P0 |
| fixed columns 分支和 standard 分支同时留在同一文件 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:768`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1091` | 两套桌面渲染逻辑并存，改一处容易误伤另一处 | P0 |
| scroll region 与 row action 样式和模板耦合在 `DataTable.vue` | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:974`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1267` | 一旦抽子组件，当前 scoped style 不会自动跟随，边界必须显式整理 | P0 |
| `TableDataRow.vue` 已经承担 standard row renderer，但 `DataTable.vue` 仍保留大量 fixed/scrollable 手写行模板 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue:1` | 桌面渲染层级不统一，难以继续内聚复用 | P1 |
| 现有回归用例主要从行为面覆盖 selection/detail | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:255` | 可以支撑本轮抽壳，但必须确保桌面模板与样式迁移不改变行为路径 | P1 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 新增 `DataTableDesktopFrame.vue` | 承接桌面 `selection bar / fixed columns / standard mode / resize indicator / draft toolbar / add-row` 的内部渲染壳 | 是 |
| 更新 `DataTable.vue` 接入 `DataTableDesktopFrame.vue` | 保持对外 props/emit 契约稳定 | 是 |
| 将桌面分支使用的 scoped 样式迁移到新组件 | 避免样式因子组件化而失效 | 是 |
| 保持 mobile 分支留在 `DataTable.vue` | 避免本轮写入面过大 | 是 |
| 新增或复用现有回归验证 | 以桌面 selection/detail 行为不回归为硬门禁 | 是 |
| 再拆 fixed-region / scroll-region 为更小组件 | 适合作为下一轮而不是本轮 | 否 |
| 改 `DataTable` 的公开 props/emit 契约 | 会扩大宿主影响面 | 否 |
| 回头继续扩 theme token | 与本轮目标正交 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 继续只拆 composable，不动桌面模板 | 风险低 | `DataTable.vue` 仍是超大桌面视图文件 | 不选 |
| 一次性拆成 `DesktopFrame + FixedRegion + ScrollRegion + StandardGrid` | 长期最整洁 | 本轮写入面和集成面过大 | 不选 |
| 先抽一个 `DataTableDesktopFrame.vue` 承接整块桌面分支 | 风险可控，收益集中，能立刻降低主组件体积 | 新组件 props 面会偏宽，但仍可接受 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFrame.vue` | renderer-shell | 承接桌面 `selection bar / fixed columns / scroll region / standard mode / draft toolbar / resize indicator / add-row` 模板和对应 scoped 样式 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue` | orchestrator | 保留 mobile 分支、状态编排、schema menu / add-field overlay，不再直接持有大段桌面模板 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts` | regression | 继续作为 selection/detail 行为硬门禁 |

### 3.2 `DataTableDesktopFrame.vue` 方案

输入：

1. `densityClass`
2. `containerWidthClass`
3. `densityStyle`
4. `hasSelectionBar`
5. `selectionCount`
6. `resolvedBulkActionItems`
7. `hasFixedColumns`
8. `fixedCols`
9. `scrollableCols`
10. `effectiveColumns`
11. `groupedItems`
12. `visibleItems`
13. `useVirtual`
14. `fieldDefs`
15. `effectiveSelectable`
16. `effectiveAddable`
17. `showRowActions`
18. `hasDrafts`
19. `draftCount`
20. 各类 render helper / style helper / callback function

输出事件：

1. `selection-bar-action`
2. `select-all`
3. `select-row`
4. `row-click`
5. `row-action`
6. `resize-start`
7. `resize-dblclick`
8. `header-contextmenu`
9. `header-dblclick`
10. `add-field`
11. `add-row`
12. `commit-all`
13. `discard-all`
14. `scroll-region-scroll`
15. `fixed-region-scroll`
16. `dragstart / dragover / drop / dragend`

实现原则：

1. 新组件只负责桌面 renderer，不接管状态。
2. 所有状态写回仍由 `DataTable.vue` 主控。
3. 允许使用函数型 props 传入 `getRowId / bodyCellStyle / groupRowProps / buildRowActionItems` 等 helper，避免为了抽壳再复制一份业务逻辑。
4. `mobile` 分支、列头菜单、添加字段弹层继续保留在 `DataTable.vue`，避免本轮写入面继续扩大。

### 3.3 样式迁移方案

本轮会把仅服务于桌面分支的 scoped 样式迁移到 `DataTableDesktopFrame.vue`，包括：

1. `.of-data-table-body`
2. `.of-data-table-fixed-region`
3. `.of-data-table-scroll-region`
4. `.of-table-row--hover`
5. `.of-table-row__actions`
6. `.of-table-row__action-btn`
7. `.of-resize-indicator`
8. `.of-fixed-shadow`
9. 桌面态相关的 `drag / selected / hover` 视觉反馈

保留在 `DataTable.vue` 的样式：

1. `.of-data-table`
2. mobile list/card/add-btn 密度样式
3. `add-field overlay/popup`
4. 与整个根容器焦点状态相关的样式

### 3.4 测试方案

本轮以现有 `table-detail.integration.spec.ts` 作为主硬门禁，重点覆盖：

1. 桌面态 checkbox 选择后 `selection bar` 出现
2. `clear-selection` 和自定义 bulk action 行为
3. detail 状态相关行为不回归

额外通过静态扫描验证：

1. `DataTable.vue` 已接入 `DataTableDesktopFrame.vue`
2. 新桌面组件已进入主路径

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 6A | 新增 `DataTableDesktopFrame.vue` | 无 | 桌面三大分支模板有独立落点 |
| Phase 6B | 更新 `DataTable.vue` 接入 desktop frame | 6A | `DataTable.vue` 不再直接持有整块桌面模板 |
| Phase 6C | 桌面局部 scoped 样式迁移 | 6A / 6B | 桌面样式在新组件中继续生效 |
| Phase 6D | 自动化验证、FlowAPI closeout、git 提交 | 6A / 6B / 6C | 计划、任务、文档、代码一致闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 计划冻结、FlowAPI 留痕、集成与提交 | 0.4 人日 |
| FE-A | `DataTableDesktopFrame.vue` 模板与样式落地 | 0.4 人日 |
| FE-B | `DataTable.vue` 接线与回归修边 | 0.3 人日 |
| QA | 本轮以自动化验证代替独立 QA | 0.2 人日 |

总计 `1.3` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| scoped style 迁移后桌面样式失效 | High | 样式仍留在 `DataTable.vue`，子组件内部 class 不再命中 | 桌面专属样式显式迁移到 `DataTableDesktopFrame.vue`，并保留行为测试 |
| fixed columns 分支事件桥接漂移 | High | `select / row-click / resize / drag` 在新组件中映射错误 | 主线程保留所有状态和 handler，仅让子组件透传事件 |
| `DataTableDesktopFrame.vue` props 面过宽导致类型噪声 | Medium | 为了抽壳传入大量函数型 props | 本轮接受内部宽 props 面，但不把该组件导出到公开入口 |
| 标准模式和 fixed 模式出现行为不一致 | Medium | 抽壳后两套分支写法再次分叉 | 保持标准模式沿用 `TableDataRow.vue`，fixed/scrollable 分支尽量复用同一 helper |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| Stylelint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint:style'` |
| 表格 detail/selection 回归通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/table-detail.integration.spec.ts'` |
| 新桌面 renderer 已进入主路径 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"DataTableDesktopFrame\" src/components/table src/tests'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败
2. `table-detail.integration.spec.ts` 回归
3. fixed columns 或 standard mode 出现明显样式丢失

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/table docs/plans
git checkout HEAD -- src/components/table/DataTable.vue
rm -f src/components/table/DataTableDesktopFrame.vue
npm run type-check
```

数据影响边界：

1. 本轮只改本地代码，不改共享数据库。
2. 不涉及共享存储、测试服务器、生产服务器配置。

## Part 9: 架构决策记录（ADR）

### ADR-001: 本轮先抽一个桌面总壳，不继续细拆子壳

决策：本轮新增 `DataTableDesktopFrame.vue` 承接整个桌面分支，不继续一次性细拆 `FixedRegion / ScrollRegion / StandardGrid`。

原因：当前最重要的不是把桌面层拆到最细，而是先把大块桌面模板从主组件里拿走，建立稳定的 renderer-shell 边界。

### ADR-002: 函数型 props 可作为本轮内部桥接手段

决策：允许 `DataTableDesktopFrame.vue` 通过函数型 props 消费 `getRowId / bodyCellStyle / buildRowActionItems / onResizeStart` 等 helper。

原因：这是内部组件，不对外暴露。当前优先级是降低主组件复杂度，而不是为了追求最纯粹的 props 形状复制一整层业务逻辑。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:750`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:768`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:974`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1091`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1267`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue:1`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:255`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run lint:style`
4. `npm run test -- src/tests/table-detail.integration.spec.ts`
5. `rg -n "DataTableDesktopFrame" src/components/table src/tests`
6. 补充执行验证：`npm run build`
