---
生成时间: 2026-03-22 09:50:31
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:66, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:213, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:641, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:868, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:41, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/index.ts:1
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI DataTable 模块化第三阶段的范围、实现路径、风险、验收与回滚口径，确保本轮改造可追溯、可验证、可回滚
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 3 Plan

## Part 1: 执行摘要

当前 `DataTable.vue` 仍是单文件高耦合实现，脚本区同时持有容器感知布局、批量选择、字段管理、移动端 detail sheet、草稿工具条和模板渲染，导致文件规模达到 `1892` 行，后续继续做 table scene 扩展时，改动面仍然过大。

本阶段目标不是重写 `DataTable`，而是在保持现有 props/emit 契约不变的前提下，把最重的布局状态和 renderer 片段抽离出来。具体范围限定为四件事：抽离纯函数与样式辅助逻辑、抽离容器布局 composable、抽离 selection/draft/mobile 三个 renderer 子模块、收敛 `DataTable.vue` 为 orchestrator。

本阶段只修改 `table` 域本地代码和文档，不改共享数据库、不改发布物、不改 `DatabaseView` 对 `DataTable` 的消费契约。预期结果是显著降低 `DataTable.vue` 的脚本和模板复杂度，并保持现有集成测试和构建门禁通过。

资源时间按 1 名 ARCH/FE 角色估算 `1.5` 人日，其中 `0.3` 人日作为集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| 容器感知布局状态与主组件混放 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:213` | 后续 density/container query 扩展必须进入主文件 | P0 |
| 批量操作条状态与模板混放 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:641` | selection bar 无法独立复用与测试 | P0 |
| 移动端 detail sheet 分支与桌面表格混放 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:868` | mobile/desktop 双分支修改容易互相污染 | P0 |
| 草稿工具条与表格主体绑定过紧 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1364` | draft 流程后续扩展时缺乏独立边界 | P1 |
| 纯函数与样式构造分散在主文件 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:706` | 类型漂移和视觉回归风险上升 | P1 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 抽离 `DataTable` 纯函数工具模块 | 收敛 row id、field def、density/body style、bulk action 解析等纯逻辑 | 是 |
| 抽离布局 composable | 收敛 `ResizeObserver`、container density、density style | 是 |
| 抽离 selection/draft/mobile renderer | 让 `DataTable.vue` 不再直接持有完整模板块 | 是 |
| 修改对外 props/emit 契约 | 会扩大验证面 | 否 |
| 引入新的公开导出 | 会锁死尚未成熟的内部边界 | 否 |
| 重写 fixed columns/virtual scroll 核心算法 | 风险过高，超出本阶段 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 只抽 utils | 风险低 | 模板仍然臃肿，mobile/selection/draft 仍耦合 | 不选 |
| 直接拆完整 desktop/fixed/standard 双 renderer | 模块最彻底 | 模板事件桥接面过大，本轮回归成本高 | 不选 |
| 抽 utils + layout composable + 3 个轻量 renderer | 风险可控，能显著降低主文件复杂度 | fixed/standard 桌面渲染仍保留在主文件 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/dataTableUtils.ts` | pure utils | 保存不依赖 Vue 生命周期的辅助函数 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useDataTableLayout.ts` | engine-support composable | 收敛容器宽度观测、density 派生、CSS variable 输出 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableSelectionBar.vue` | renderer | 只渲染选择摘要与批量动作按钮 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDraftToolbar.vue` | renderer | 只渲染草稿数量与 commit/discard 动作 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableMobilePanel.vue` | renderer | 只承载 `MobileListView + DetailSheet` 分支 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue` | orchestrator | 保留 props/emit、table brains、row drag、keyboard、desktop shell 集成 |

### 3.2 utils 抽离范围

本轮进入 `dataTableUtils.ts` 的函数：

1. `TABLE_DENSITY_METRICS`
2. `normalizeFieldType`
3. `resolveRowId`
4. `resolveFieldDef`
5. `resolveFirstEditableFieldKey`
6. `buildResolvedBulkActionItems`
7. `getDensityCellPadding`
8. `buildDataRowStyle`
9. `buildBodyCellStyle`
10. `buildGroupSpacerStyle`

保留在 `DataTable.vue` 的函数：

1. `handleInlineEdit`
2. `handleRowClick`
3. `handleBulkAction`
4. `handleSelect*`
5. `onDrag*`
6. `onHeader*`

原因：这些函数与 `emit`、`inlineEdit`、`selectedRows`、`props.enableKeyboard` 或 drag handler 深度耦合，抽出去不会形成稳定边界。

### 3.3 layout composable 方案

`useDataTableLayout.ts` 输入：

1. `tableContainerRef`
2. `density`
3. `containerResponsive`
4. `isMobile`

输出：

1. `tableContainerWidth`
2. `containerDensity`
3. `densityMetrics`
4. `densityClass`
5. `containerWidthClass`
6. `densityStyle`
7. `syncTableContainerWidth`

伪代码：

```text
onMounted -> 读取 container 宽度 -> 若存在 ResizeObserver 则监听
onBeforeUnmount -> disconnect observer
if !containerResponsive or isMobile -> 返回原 density
if width <= 860 -> compact
if width <= 1080 and density=comfortable -> standard
else -> 原 density
根据 densityMetrics 派生 CSS variable style
```

### 3.4 renderer 抽离方案

#### 3.4.1 `DataTableSelectionBar.vue`

输入：

1. `selectionCount`
2. `items`

输出事件：

1. `action`

该组件不关心 `selectedRows`、`clearSelection`、`emit("bulk-action")`，只负责按钮渲染和事件透传。

#### 3.4.2 `DataTableDraftToolbar.vue`

输入：

1. `draftCount`

输出事件：

1. `commit-all`
2. `discard-all`

#### 3.4.3 `DataTableMobilePanel.vue`

输入：

1. `rows`
2. `columns`
3. `fieldDefs`
4. `selectable`
5. `addable`
6. `readonly`
7. `statusColorMap`
8. `densityClass`
9. `densityStyle`

输出事件：

1. `row-click`
2. `add-row`
3. `close-detail`
4. `delete-row`
5. `cell-edit`

说明：

1. `detailSheetVisible` 与 `detailSheetRow` 仍由父组件持有，避免子组件再次吸纳状态编排。
2. `cell` slot 继续向下透传，保证现有测试契约不变。

### 3.5 非目标边界

本阶段明确不做：

1. fixed columns 与 standard desktop table 的整块模板拆分
2. `useTable` / `useVirtualList` / `useRowDrag` 的重写
3. `DataTableProps` 和 `src/types/index.ts` 的公开类型扩展
4. `table/index.ts` 或根入口的新增导出

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 3A | 新增 `dataTableUtils.ts` 与 `useDataTableLayout.ts` | 无 | `DataTable.vue` 脚本区明显收缩 |
| Phase 3B | 新增 `DataTableSelectionBar.vue` 与 `DataTableDraftToolbar.vue` | 3A | selection/draft 模板独立 |
| Phase 3C | 新增 `DataTableMobilePanel.vue` 并接入主组件 | 3A | mobile 分支独立且 slot 透传保持 |
| Phase 3D | 集成、验证、FlowAPI closeout、git 提交 | 3B / 3C | 所有门禁通过并补文档记录 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 方案冻结、FlowAPI plan/task、集成与提交 | 0.5 人日 |
| FE | utils/composable/renderer 实现 | 0.7 人日 |
| QA | 本轮以自动化验证代替独立 QA | 0.3 人日 |

总计 `1.5` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| mobile slot 透传回归 | High | `DataTableMobilePanel.vue` 没有完整转发 `cell` slot | 以 `table-detail.integration.spec.ts` 中移动端 slot 用例做硬门禁 |
| selection bar 行为漂移 | High | 子组件只迁移模板但按钮事件映射错误 | 保持 `action` 事件透传，批量动作解析仍由父组件控制 |
| density 样式回归 | Medium | `useDataTableLayout.ts` 中 CSS variable 计算出错 | 用现有 `density=compact` 用例和 `fill` 列样式用例做回归 |
| 类型漂移 | Medium | `dataTableUtils.ts` 对 `CellFieldDef` / `TableColumn` / `BulkActionItem` 依赖错配 | 不引入 `any`，抽离后立即跑 `npm run type-check` |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| 表格与详情集成测试通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- database-view.integration.spec.ts table-detail.integration.spec.ts'` |
| 新模块已被主组件消费 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"useDataTableLayout|DataTableSelectionBar|DataTableDraftToolbar|DataTableMobilePanel|dataTableUtils\" src/components/table src/composables'` |

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败
2. `table-detail` 或 `database-view` 集成测试回归
3. `DataTable` 的移动端 slot、selection bar、草稿条行为与现有契约不一致

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/table src/composables/useDataTableLayout.ts docs/plans
git checkout HEAD -- src/components/table/DataTable.vue
rm -f src/components/table/dataTableUtils.ts
rm -f src/components/table/DataTableSelectionBar.vue
rm -f src/components/table/DataTableDraftToolbar.vue
rm -f src/components/table/DataTableMobilePanel.vue
rm -f src/composables/useDataTableLayout.ts
npm run type-check
```

数据影响边界：

1. 本轮只改本地代码，不改共享数据库。
2. 不涉及共享存储、测试服务器、生产服务器配置。

## Part 9: 架构决策记录（ADR）

### ADR-001: 本轮只抽“轻量 renderer”，不拆桌面主表格壳

决策：fixed/standard desktop 渲染仍由 `DataTable.vue` 直接持有。

原因：这一块事件桥接最密，贸然拆分会把 `drag/keyboard/virtual/fixed` 同时带入回归面。本轮优先把低风险收益块抽掉。

### ADR-002: `useDataTableLayout` 放在 `src/composables`

决策：布局逻辑作为 engine-support composable 放入 `src/composables/useDataTableLayout.ts`，而不是写成组件私有 util。

原因：容器宽度、density 计算是稳定行为边界，未来 table-like renderer 仍可复用。

### ADR-003: 不扩大 `table/index.ts` 导出面

决策：本轮新增子组件默认只供 `DataTable.vue` 内部消费，不追加到 `table/index.ts`。

原因：模块化目标是降低内部耦合，不是发布更多公开组件。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:213`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:641`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:868`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:1364`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:84`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:255`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run test -- database-view.integration.spec.ts table-detail.integration.spec.ts`
4. `rg -n "useDataTableLayout|DataTableSelectionBar|DataTableDraftToolbar|DataTableMobilePanel|dataTableUtils" src/components/table src/composables`

### 10.3 补充人工验证

1. `npm run build`
