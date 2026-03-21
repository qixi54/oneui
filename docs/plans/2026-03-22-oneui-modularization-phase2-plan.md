---
生成时间: 2026-03-22 11:05:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:104, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:666, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1127, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/index.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts:93
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI DatabaseView 模块化第二阶段的范围、实现路径、风险、验收与回滚口径，确保本轮改动可追溯、可验证、可回滚
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 2 Plan

## Part 1: 执行摘要

当前 `DatabaseView.vue` 虽然已经把 contract 与 workspace state 从主文件中抽出，但主组件仍同时承载了三类责任：纯函数工具集、主内容视图切换、详情工作区渲染。结果是 `DatabaseView.vue` 仍维持在超长单文件状态，后续继续做 workspace、overlay、view renderer 扩展时，改动面仍然过大。

本阶段目标是把 `DatabaseView` 从“页面编排器 + 纯函数库 + 详情模板集合体”收敛成“页面编排器”。具体只做三件事：抽离纯函数到 `databaseViewUtils.ts`、抽离详情工作区到 `DatabaseDetailWorkspace.vue`、抽离主内容渲染到 `DatabaseViewContent.vue`。

本阶段范围严格限制在 `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database` 域，不重写 `DataTable` engine，不扩展根级公开 API，不改变现有 `DatabaseViewProps` 契约。预期成果是降低 `DatabaseView.vue` 的耦合度、消除 side-panel / drawer 的重复模板，并保持既有集成测试和构建门禁通过。

资源时间按 1 名 ARCH/FE 角色估算 1.5 人日，其中 0.5 人日作为集成与验证缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| 纯函数与页面状态混放 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:104` | 纯逻辑无法独立复用，单测和后续抽象成本高 | P0 |
| 主内容 renderer 与 orchestration 混放 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1127` | 新增 view type 或调整渲染策略时必须进入主组件 | P0 |
| 详情工作区模板重复 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1188` | side-panel 与 drawer 双份维护，后续样式和行为容易漂移 | P0 |
| detail workspace 样式依附主文件 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1406` | 详情工作区无法作为稳定子模块演进 | P1 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 抽离纯函数工具模块 | 把 view/field/filter/detail 派生相关纯函数从 `DatabaseView.vue` 移出 | 是 |
| 抽离详情工作区组件 | 消除 side-panel 与 drawer 的重复 `DetailLayout` 模板 | 是 |
| 抽离主内容组件 | 让 table / kanban / gallery / timeline / detail-anchor 渲染独立 | 是 |
| 调整 `DatabaseViewProps` 公共契约 | 影响根出口稳定性 | 否 |
| 拆 `DataTable` engine | 属于下一阶段 | 否 |
| 重做视觉样式 | 会扩大验证面 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 仅抽 utils，不拆 renderer | 风险最小 | 重复模板仍在，主文件仍然过长 | 不选 |
| 直接拆 4-5 个组件 | 模块最细 | 改动面过大，当前验证面不足 | 不选 |
| 抽 1 个 utils + 2 个 renderer | 可以同时解决职责混放与模板重复，风险可控 | 仍保留少量桥接逻辑在主组件 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/databaseViewUtils.ts` | pure utils | 只保留纯函数，不依赖 Vue 实例状态 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue` | renderer | 承载 table / kanban / gallery / timeline / detail-anchor 分支 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailWorkspace.vue` | renderer | 承载 detail workspace 的 `DetailLayout`、字段渲染、footer action |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue` | orchestrator | 保留 props/emit、状态桥接、watch、事件分发、overlay 壳拼装 |

### 3.2 utils 抽离范围

本轮抽离以下纯函数：

1. `cloneView`
2. `inferFieldIdsFromRecords`
3. `getViewTypeIcon`
4. `buildFallbackView`
5. `buildVirtualDetailView`
6. `getFieldLabel`
7. `resolveColumnType`
8. `resolveCellFieldType`
9. `buildTableColumns`
10. `buildDetailColumns`
11. `buildDetailFieldDefs`
12. `normalizeCellValue`
13. `compareCellValues`
14. `evaluateFilterCondition`
15. `buildEmptyFilter`
16. `convertViewFiltersToToolbarFilters`
17. `convertToolbarFiltersToViewFilters`
18. `getVisibleFieldIds`
19. `toDetailRow`

保留在 `DatabaseView.vue` 的函数：

1. `openRecord`
2. `handleToolbar*`
3. `handleDetail*`
4. `patchRecordField`
5. `forwardSchemaEvent`

原因：这些函数与 `databaseView` 实例、`emit`、`props.actions`、本地 `ref` 状态耦合，抽离后不会带来真实收益。

### 3.3 renderer 抽离方案

#### 3.3.1 `DatabaseViewContent.vue`

输入：

1. `viewType`
2. `records`
3. `schema`
4. `view`
5. `columns`
6. `readonly`
7. `enableFieldManagement`

输出事件：

1. `cell-edit`
2. `schema-*`
3. `row-click`
4. `row-click-record`
5. `card-click`
6. `add`
7. `add-column`
8. `record-change`
9. `update:records`

伪代码：

```text
if viewType === table -> 渲染 DataTable
if viewType === kanban -> 渲染 KanbanBoard
if viewType === gallery -> 渲染 GalleryView
if viewType === timeline -> 渲染 GanttTimeline
else -> 渲染 detail anchor
```

#### 3.3.2 `DatabaseDetailWorkspace.vue`

输入：

1. `rowId`
2. `title`
3. `description`
4. `readonly`
5. `fieldDefs`
6. `propertyColumns`
7. `workspaceRow`
8. `activeViewType`
9. `detailPresentation`
10. `canSwitchPresentation`
11. `workspaceModes`
12. `hasDraftChanges`

输出事件：

1. `commit`
2. `save`
3. `close`
4. `delete`
5. `update:presentation`

说明：

1. 该组件只负责 `DetailLayout` 内部内容，不负责 `SidePanel` / `Drawer` 外壳。
2. `FieldCell` 继续在子组件内渲染，父组件只传字段定义和当前值读取函数。
3. side-panel 与 drawer 共用同一组件实例模板，避免双份维护。

### 3.4 主组件整合策略

`DatabaseView.vue` 调整后的职责边界：

1. 仍负责 `useDatabaseView` 与 `useDatabaseWorkspaceState` 的状态接线。
2. 仍负责 `watch`、`emit`、`props.actions` 调度。
3. 使用 `DatabaseViewContent` 承载主内容渲染。
4. 使用 `DatabaseDetailWorkspace` 作为 `SidePanel` 与 `Drawer` 的共同内容体。
5. 样式上只保留主容器与状态态样式；detail workspace 专属样式迁移到子组件。

### 3.5 非目标边界

本阶段明确不做：

1. `DataTable.vue` engine 重构
2. `DatabaseView` 公共 prop/emit 破坏性变更
3. 新增 root export
4. 视觉 token 重设计

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 2A | 新增 `databaseViewUtils.ts`，替换主文件内纯函数调用 | 无 | `DatabaseView.vue` script 区明显收缩 |
| Phase 2B | 新增 `DatabaseDetailWorkspace.vue`，迁移 detail workspace 模板与样式 | 2A | side-panel / drawer 重复模板归一 |
| Phase 2C | 新增 `DatabaseViewContent.vue`，迁移主内容分支渲染 | 2A | 主内容 view switch 独立 |
| Phase 2D | 集成、类型校验、构建、测试、留痕 | 2B / 2C | 所有门禁通过并补文档记录 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 方案冻结、FlowAPI plan、集成与验证 | 0.5 人日 |
| FE | utils/renderer 模块实现 | 0.7 人日 |
| QA | 本轮以自动化验证代替独立 QA | 0.3 人日 |

总计 1.5 人日，其中包含约 20% 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| 子组件 props 设计过细导致父子耦合反而上升 | High | 一次性把过多业务分支塞进 `DatabaseDetailWorkspace` | 严格限制为 renderer props，不传 `databaseView` 实例 |
| utils 抽离后类型漂移 | High | `CellFieldDef` / `TableColumn` / `ViewConfig` 泛型不一致 | 抽离后立即跑 `type-check`，不引入 `any` 逃逸 |
| 样式迁移导致视觉回归 | Medium | detail workspace class 改名或遗漏 | 保留现有 class naming，不做视觉重写 |
| 主组件事件桥接断链 | Medium | `DatabaseViewContent` emit 名称与原事件不一致 | 保持事件名称完全同名转发，并用集成测试覆盖 |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| 数据库页集成测试通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- database-view.integration.spec.ts table-detail.integration.spec.ts'` |
| Phase 2 新模块已落地并被主组件消费 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"DatabaseViewContent|DatabaseDetailWorkspace|databaseViewUtils\" src/components/database'` |

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败
2. `database-view` / `table-detail` 集成测试出现回归
3. `DatabaseView` 事件桥接与既有契约不兼容

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database /opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables /opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts /opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts
git checkout HEAD -- /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/index.ts /opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/index.ts /opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts
rm -f /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue
rm -f /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseDetailWorkspace.vue
rm -f /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/databaseViewUtils.ts
npm run type-check
```

数据影响边界：

1. 本轮只改本地代码，不改共享数据库。
2. 不涉及共享存储、测试服务器、生产服务器配置。

## Part 9: 架构决策记录（ADR）

### ADR-001: 详情工作区只抽内容体，不抽 overlay 壳

决策：`SidePanel` 与 `Drawer` 仍由 `DatabaseView.vue` 持有，子组件只负责内部 `DetailLayout` 内容。

原因：overlay 壳的宽度、fullscreen、presentation fallback 与 workspace state 高度耦合，提前下沉会把状态职责重新拉进子组件。

### ADR-002: 不扩大 public export surface

决策：Phase 2 新增模块默认只作为 `database` 域内部文件使用，不写入根导出。

原因：本轮目标是降低内部耦合，不是新增公开 API；避免后续为了兼容外部使用而锁死不成熟边界。

### ADR-003: 工具函数按“纯函数”而不是按“功能块”抽离

决策：凡依赖 `ref`、`emit`、`props.actions` 的桥接逻辑均留在主组件，只有输入输出稳定的函数进入 `databaseViewUtils.ts`。

原因：如果把半状态函数也硬拆出去，会得到更难维护的“假模块化”。

## Part 10: 参考与附录

### 10.1 代码位置索引

| 路径 | 当前用途 |
|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:104` | 纯函数与 filter/sort/detail 派生逻辑 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:666` | detail workspace 派生 state |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:752` | 本地搜索、过滤、排序后的渲染记录 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1127` | table/kanban/gallery/timeline 主内容渲染 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1188` | side-panel / drawer 详情工作区模板 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1406` | 详情工作区样式 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/index.ts:1` | database 域当前公开出口 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts:93` | 根级 database 导出入口 |

### 10.2 本轮完成定义

1. `DatabaseView.vue` 从“大而全组件”收敛为 orchestration 组件。
2. detail workspace 不再有双份模板。
3. 纯函数可被后续 `DatabaseView` / `DataTable` Phase 3 继续复用。
