---
生成时间: 2026-03-22 02:39:04
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:184, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:200, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:558, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:612, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:733, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:75, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:87, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:197, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:271, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:346
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第五阶段的范围、并发拆分、风险、验收与回滚口径，在不改公开 API 的前提下继续收敛 DataTable 状态职责，并补齐 theme token 的语义别名层
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 5 Plan

## Part 1: 执行摘要

当前 `DatabaseView` 和 plugin registry 的边界已经收口，但 `DataTable.vue` 仍同时承担移动端 detail sheet 状态、selection/bulk action 状态、row click 分流和模板渲染接线。与此同时，`src/styles/themes/neutral.css` 与 `src/styles/themes/ops-console.css` 已经开始消费 `--of-surface-*`、`--of-text-*`、`--of-border-*` 语义变量，而 `src/styles/variables.css` 仍以旧的 `--of-color-*` 命名为主，主题层和 foundation 层的命名契约尚未完全闭合。

本阶段目标不是重写表格，也不是大面积换肤，而是在保持 `DataTable` props/emit 契约和现有主题行为不变的前提下，先把最重的两块页面状态抽成 composable，并在 token 层补一个“旧名兼容、新名可用”的语义别名层。范围限定为两条并行工作流：`DataTable` 的 selection/detail-sheet 状态抽离，以及 `variables.css` 的 semantic alias layer。

本阶段只修改本地代码、测试和文档，不改共享数据库、不改服务端、不改外部运行环境。预期结果是进一步压缩 `DataTable.vue` 的状态密度，稳定移动端 detail sheet/selection 行为，同时让 neutral / ops-console 两套 theme 有完整的语义 token 落点。

资源时间按 `1.6` 人日估算，其中 `0.3` 人日作为并发集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `DataTable.vue` 同时维护移动端 detail sheet 状态 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:200` | 移动端与桌面事件分流耦合在页面组件里，后续抽 renderer 或 scene 容易误伤 | P0 |
| `DataTable.vue` 同时维护 selection/bulk action 状态 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:558` | 表格状态继续膨胀，selection bar 和 bulk action 无法独立复用 | P0 |
| row click 与 mobile detail 分流共处单文件 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:612` | `row-click`、`row-click-record`、移动端详情入口混在一起，行为边界不清晰 | P1 |
| `variables.css` 仍以旧色彩变量为主 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:75`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:87`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:197` | theme 层和 foundation 层之间缺少稳定语义桥接，后续换 skin 时需要重复补变量 | P0 |
| scene theme 已经在用新语义，但基础层未形成完整 alias | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1` | neutral / ops-console 的命名方向正确，但主题覆盖来源不完整 | P1 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 新增 `useDataTableSelection.ts` | 收敛 selection ids、bulk action context、selection-change 事件桥接 | 是 |
| 新增 `useDataTableDetailSheet.ts` | 收敛移动端 detail sheet 的显隐、row payload、save 事件桥接 | 是 |
| 更新 `DataTable.vue` 接入上述 composable | 保持 props/emit 契约稳定 | 是 |
| 为 `variables.css` 建立 semantic alias layer | 新增 `--of-surface-*`、`--of-text-*`、`--of-border-*`、`--of-elevation-*` 的兼容层 | 是 |
| 调整 neutral / ops-console theme 的入口一致性 | 仅做必要的 alias 对齐，不改主题语义 | 视需要纳入 |
| 改 `DataTable` 的公开 props/emit 契约 | 会扩大验证面并影响宿主 | 否 |
| 重写固定列、虚拟滚动、键盘导航 | 风险高且与本轮主要收益不匹配 | 否 |
| 大面积替换组件内所有旧 token 引用 | 写入面过大，不利于快速收口 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 全量重写 `DataTable` engine | 理论上最整洁 | 风险高，回归面过大 | 不选 |
| 只补 theme alias layer | 风险低 | 表格状态复杂度不下降 | 不选 |
| 先拆 `selection/detail-sheet` 两个状态模块，再补 token alias layer | 改动边界清晰，收益集中，写入集合可并行 | 集成阶段要做一轮表格回归 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useDataTableSelection.ts` | state-engine | 承接 selection ids、selected rows、bulk action context、selection emit/watch |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useDataTableDetailSheet.ts` | state-engine | 承接移动端 detail sheet 显隐、当前 row、open/close/save 逻辑 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue` | orchestrator | 保留表格主渲染、现有 props/emit 对外契约，不再直接持有大段 selection/detail-sheet 状态 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/index.ts` | export surface | 暴露新增 composable，保持内部模块可复用 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css` | foundation + semantic bridge | 建立 foundation token 到 semantic token 的兼容别名层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts` | regression | 继续作为 selection bar / mobile detail 的硬门禁 |

### 3.2 `useDataTableSelection` 方案

输入：

1. `sortedData`
2. `selectedRows`
3. `isAllSelected`
4. `toggleSelectAll`
5. `toggleRowSelection`
6. `clearSelection`
7. `rowKey`
8. `showSelectionBar`
9. `selectable`
10. `bulkActionItems`
11. `emit`

输出：

1. `selectedIdsArray`
2. `selectedDataRows`
3. `indeterminate`
4. `bulkActionContext`
5. `resolvedBulkActionItems`
6. `hasSelectionBar`
7. `handleSelectAll`
8. `handleSelect`
9. `handleBulkAction`

伪代码：

```text
selectedIdsArray := Array.from(selectedRows)
selectedDataRows := sortedData.filter(row => selectedRows.has(resolveRowId(row)))
bulkActionContext := { selectionCount, rowIds, rows }
resolvedBulkActionItems := buildResolvedBulkActionItems(items, bulkActionContext)
watch(selectedIdsArray) -> emit("selection-change", ids)
handleBulkAction(action) -> emit("bulk-action", payload) -> clearSelection if needed
```

实现原则：

1. 不新增新的外部事件名。
2. `bulk-action` 的 payload 结构保持不变。
3. `selectedRows` 仍由 `useTable` 主控，本 composable 只消费并桥接。

### 3.3 `useDataTableDetailSheet` 方案

输入：

1. `isMobile`
2. `emit`
3. `getRowId`

输出：

1. `detailSheetVisible`
2. `detailSheetRow`
3. `detailSheetTableRow`
4. `handleRowClick`
5. `handleMobileRowClick`
6. `handleDetailSave`
7. `closeDetailSheet`

伪代码：

```text
if isMobile and row clicked -> detailSheetRow=row; detailSheetVisible=true
if desktop and row has __record -> emit("row-click-record", record) + emit("row-click", record)
else emit("row-click", row)
handleDetailSave(fields) -> emit("cell-edit", { rowId, fieldId, value }) for each field
close -> detailSheetVisible=false
```

实现原则：

1. 只抽状态和事件桥接，不触碰 `DataTableMobilePanel` 和桌面模板结构。
2. `row-click` / `row-click-record` 的对外语义保持原样。

### 3.4 semantic alias layer 方案

本轮在 `src/styles/variables.css` 内增加三层语义：

1. `--of-surface-*`
2. `--of-text-*`
3. `--of-border-*`
4. `--of-elevation-*`

桥接规则：

1. 旧名继续保留，用于兼容现有组件。
2. 新语义名直接映射到 foundation 色板或阴影。
3. neutral / ops-console scene 文件继续覆盖新语义名，不要求一次性改写所有业务组件。

示例：

```text
--of-surface-canvas -> foundation gray / scene override
--of-text-primary -> foundation gray-900 / scene override
--of-border-subtle -> alpha border / scene override
--of-elevation-card -> card shadow
old --of-color-bg-canvas -> alias to --of-surface-canvas
old --of-color-text-primary -> alias to --of-text-primary
```

### 3.5 测试方案

本轮沿用 `table-detail.integration.spec.ts` 作为硬门禁，重点覆盖：

1. selection bar 显示与 bulk action 行为
2. 多选时自定义 bulk action 的 disabled / label 逻辑
3. detail 状态渲染与移动端 detail sheet 入口

theme alias layer 通过静态扫描与样式 lint 验证：

1. 新旧变量同时存在
2. neutral / ops-console 继续覆盖 `--of-surface-*` / `--of-text-*` / `--of-border-*`

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 5A | 新增 `useDataTableSelection.ts` | 无 | selection/bulk action 状态从 `DataTable.vue` 抽离 |
| Phase 5B | 新增 `useDataTableDetailSheet.ts` 并接线 `DataTable.vue` | 5A 可并行 | 移动端 detail sheet 状态从页面组件抽离 |
| Phase 5C | 在 `variables.css` 中补 semantic alias layer | 无 | scene theme 有稳定的语义 token 着陆点 |
| Phase 5D | 自动化验证、FlowAPI closeout、git 提交 | 5A / 5B / 5C | 计划、任务、文档、代码一致闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 计划冻结、FlowAPI 留痕、DataTable 集成、提交 | 0.5 人日 |
| FE-A | `useDataTableSelection.ts` | 0.3 人日 |
| FE-B | `useDataTableDetailSheet.ts` | 0.3 人日 |
| FE-C | semantic alias layer | 0.2 人日 |
| QA | 本轮以自动化验证代替独立 QA | 0.3 人日 |

总计 `1.6` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| selection emit 顺序漂移 | High | `selection-change` 或 `bulk-action` 触发时机与旧逻辑不一致 | 以 `table-detail.integration.spec.ts` 的 selection 用例做硬门禁 |
| 移动端 detail row payload 漂移 | High | detail composable 改写了 `row-click` / `row-click-record` 路径 | 保持 record 判断和 emit 顺序不变，先抽状态不改模板 |
| alias layer 覆盖方向写反 | Medium | 旧变量覆盖新变量导致 theme scene 失效 | 统一以新语义为主，旧变量只做 alias，不反向覆盖 scene 文件 |
| composable 过度泛化 | Medium | 为了复用引入过多泛型和配置项 | 只封装当前 `DataTable` 所需最小输入输出，不抽成全局表格框架 |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| Stylelint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint:style'` |
| 表格 detail/selection 回归通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/table-detail.integration.spec.ts'` |
| 新 composable 与 token 已进入主路径 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"useDataTableSelection|useDataTableDetailSheet|--of-surface-canvas|--of-text-primary|--of-border-subtle\" src'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败
2. `table-detail.integration.spec.ts` 回归
3. neutral / ops-console theme 出现变量缺口导致样式异常

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/table src/composables src/styles docs/plans
git checkout HEAD -- src/components/table/DataTable.vue src/composables/index.ts src/styles/variables.css
rm -f src/composables/useDataTableSelection.ts
rm -f src/composables/useDataTableDetailSheet.ts
npm run type-check
```

数据影响边界：

1. 本轮只改本地代码，不改共享数据库。
2. 不涉及共享存储、测试服务器、生产服务器配置。

## Part 9: 架构决策记录（ADR）

### ADR-001: 先拆 `selection/detail-sheet`，暂不下钻 fixed/virtual/keyboard

决策：本轮优先抽离 `selection/bulk action` 与 `detail sheet` 两个状态模块，不改 fixed columns、virtual list、keyboard navigation、row drag 的底座。

原因：这两块状态收益最大、回归边界最清晰，且与现有 `table-detail.integration.spec.ts` 的验证面直接对应。

### ADR-002: token 先补 alias layer，不大面积改组件

决策：本轮先在 `variables.css` 建立 semantic alias layer，保留旧变量兼容，不一次性改写组件里的旧 token 名。

原因：当前 neutral / ops-console scene 已经使用语义 token，最短路径是先补 bridge，再逐步去旧名，避免一次性扩大样式回归面。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:184`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:200`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:558`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:612`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:733`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:75`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:87`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:197`
9. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css:1`
10. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css:1`
11. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:271`
12. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:346`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run lint:style`
4. `npm run test -- src/tests/table-detail.integration.spec.ts`
5. `rg -n "useDataTableSelection|useDataTableDetailSheet|--of-surface-canvas|--of-text-primary|--of-border-subtle" src`
6. 补充执行验证：`npm run build`
