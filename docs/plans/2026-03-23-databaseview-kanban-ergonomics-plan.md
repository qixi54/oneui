---
生成时间: 2026-03-23 13:32:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanBoard.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanCard.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts/database.ts
角色定义: ARCH
文档生成目的: 规划 DatabaseView/Kanban 第二阶段增强，统一收口 ONEUI-ARCH-00054 / 00056 / 00058
生成模型: GPT-5 Codex
---

# DatabaseView / Kanban Ergonomics Plan

## Part 1: 执行摘要

当前 `DatabaseView` 已透传 `kanban-column-header`、`kanban-card-title`、`kanban-card-meta`、`kanban-card-tags` 与 `priorityColorMap / statusColorMap`，但业务级接入仍存在三处摩擦：slot context 太瘦、无法整卡接管、事件语义不够直接。现状可见 [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue#L727) 、 [DatabaseViewContent.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue#L77) 、 [KanbanBoard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanBoard.vue#L135) 、 [KanbanCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanCard.vue#L39) 、 [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L38) 与 [database.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts/database.ts#L252)。

本计划把 `ONEUI-ARCH-00054`、`ONEUI-ARCH-00056`、`ONEUI-ARCH-00058` 合并为一条标准交付链，执行顺序冻结为：先补数据契约，再补视图契约，最后补交互契约。目标是在不破坏现有 API 的前提下，让业务侧可以直接在 `DatabaseView` 层完成复杂卡片渲染、精确持久化和审计日志编排。

范围只覆盖 `DatabaseView/Kanban` 契约、对应实现、集成测试与文档留痕，不改动服务器代码、共享 schema 或 npm 发版链路。预计 0.5 天可完成实现与验证，额外预留 0.5 天缓冲用于契约回看与证据整理。

## Part 2: 需求分析

| Issue | 问题定义 | 当前证据 | 优先级 | 解决层级 |
|---|---|---|---|---|
| `ONEUI-ARCH-00056` | slot context 只暴露压缩 `task`，业务仍需 `task.id -> recordMap` 回查 | [database.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts/database.ts#L259) | P0 | 数据契约 |
| `ONEUI-ARCH-00054` | 只有分段 slot，无法完整接管 card body 与常见 appearance | [KanbanCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanCard.vue#L102) | P1 | 视图契约 |
| `ONEUI-ARCH-00058` | quick add / 拖拽只走 `update:columns`，业务要自己 diff 语义 | [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue#L567) | P1 | 交互契约 |

冻结后的依赖关系：

1. `00056` 必须先落地，否则 `00054` 的 full-card slot 与 `00058` 的 lifecycle payload 都会继续缺业务字段。
2. `00054` 与 `00058` 可以在同一轮实现，但都基于新 slot context。
3. 本轮保持 non-breaking：旧 slot 和旧 `update:columns` 行为继续保留。

## Part 3: 详细方案

### 3.1 核心概念定义

- `Kanban Slot Context`：`DatabaseView` 向业务 slot 暴露的上下文对象，必须同时覆盖显示字段与原始数据字段。
- `Full Card Slot`：允许业务完整替换默认 card body 的高阶 slot；旧的 title/meta/tags slot 继续保留。
- `Kanban Lifecycle Event`：对 quick add、card move 这类业务语义动作做显式事件建模，而不是只返回状态回流结果。

### 3.2 决策矩阵

| 场景 | 旧行为 | 新行为 | 兼容策略 |
|---|---|---|---|
| 业务只想改标题、meta、tags | 继续使用分段 slot | 保持不变 | 完全兼容 |
| 业务要重写整卡结构 | 无正式入口 | 新增 `kanban-card` slot | 只有定义该 slot 时才覆盖默认 DOM |
| 业务要拿原始字段 | 自己维护 `recordMap` | slot context 直接给 `record` / `fields` | 旧 `task` 不移除 |
| 业务要区分快速创建和拖拽 | 自己 diff `records` | 新增 `kanban-quick-add` / `kanban-card-move` | `update:columns` 保留 |

### 3.3 方案细节

1. 扩展契约层
   - 在 [database.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts/database.ts#L252) 为 column/card slot context 补 `record`、`fields`、`records`、`tasks`。
   - 新增 `kanban-card` slot 类型。
   - 新增 `kanbanAppearance` prop，首轮只包含 `cardVariant`、`columnVariant`、`quickAddVisible`、`showColumnCount`。
   - 新增 `kanban-quick-add` 与 `kanban-card-move` emits。

2. 扩展底层 Kanban 组件
   - 在 [KanbanBoard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanBoard.vue#L43) 新增 lifecycle emits 和 appearance props。
   - Quick add 在本地更新列数据前，先生成结构化事件 payload。
   - 拖拽变更在列更新时比较前后列位置，输出 `fromColumnId / toColumnId / task`。
   - 在 [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L135) 与 [KanbanCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanCard.vue#L103) 增加 full-card slot 接管点。

3. 扩展 DatabaseView 透传链
   - 在 [DatabaseViewContent.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue#L77) 透传新 prop、slot 与 emits。
   - 在 [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue#L727) 把底层 lifecycle 事件转成页面级 emit，并在 payload 中回填 `record`。
   - 保持 [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue#L567) 的 `update:columns -> records` 持久化链不变，只是在其前增加显式语义事件。

### 3.4 伪代码

```ts
for each kanban column update:
  compare previous task positions with next positions
  if new task id not in previous map and source is quick-add:
    emit kanban-quick-add({ columnId, title, task, record })
  if task existed and column changed:
    emit kanban-card-move({ recordId, fromColumnId, toColumnId, task, record })
  continue existing update:columns -> records persistence flow
```

## Part 4: 实现路线图

### Phase A: Freeze Contract

- 扩 `DatabaseViewKanban*SlotContext`
- 增 `kanban-card` slot
- 增 `kanbanAppearance` / lifecycle emits

### Phase B: Bottom-Up Implementation

- 先改 `KanbanCard / KanbanColumn / KanbanBoard`
- 再改 `DatabaseViewContent`
- 最后改 `DatabaseView`

### Phase C: Verification

- 补集成测试覆盖 context、full-card slot、lifecycle emits
- 跑 targeted + 全量门禁
- 写回 issue/task/plan evidence

## Part 5: 工作量估计

| 工作项 | 角色 | 估计 |
|---|---|---|
| 契约冻结与 plan 留痕 | ARCH | 0.5 天 |
| Kanban 底层与 DatabaseView 透传实现 | ARCH | 0.5 天 |
| 集成测试与验证文档 | ARCH | 0.5 天 |
| 缓冲 | ARCH | 0.5 天 |

总计：`2.0 天` 预算，其中 `1.5 天` 为可执行工作量，`0.5 天` 为风险缓冲。

## Part 6: 风险评估

| 等级 | 风险 | 触发条件 | 应对方案 |
|---|---|---|---|
| High | full-card slot 破坏旧 DOM 结构 | 直接替换默认 card 节点 | 仅在显式定义 `kanban-card` 时启用 |
| High | 拖拽事件误判 move 语义 | 缺少前后列快照 | 在 `KanbanBoard` 层保留前态映射并比较 |
| Medium | slot context 过大导致类型复杂 | 同时暴露 `task/record/fields` | 用可复用 context type 收束，避免 ad-hoc payload |
| Medium | 事件透传过多导致 DatabaseView 复杂度上升 | 直接把底层事件全部暴露 | 只开放 `quick-add` 和 `card-move` 两个高价值事件 |
| Low | 文档与实现漂移 | 只改代码不补示例 | 同步更新验收文档与 plan evidence |

## Part 7: 验收标准

1. criterion: `DatabaseView` kanban slots 可直接拿到 `record` / `fields`
   verify_command: `pnpm vitest run src/tests/database-view.integration.spec.ts`
2. criterion: `DatabaseView` 支持完整 `kanban-card` slot 且旧分段 slot 不回归
   verify_command: `pnpm vitest run src/tests/database-view.integration.spec.ts`
3. criterion: quick add 与 card move 会发出显式 lifecycle 事件，payload 含 `record/task/fromColumnId/toColumnId`
   verify_command: `pnpm vitest run src/tests/database-view.integration.spec.ts`
4. criterion: 类型、lint、构建门禁全部通过
   verify_command: `pnpm lint && pnpm lint:style && pnpm type-check && pnpm build`

## Part 8: 回滚方案

1. 若 full-card slot 影响既有消费方，先回滚 `kanban-card` slot 渲染入口，保留分段 slot。
2. 若 lifecycle 事件 payload 不稳定，先回滚新 emits，恢复仅 `update:columns` 状态回流。
3. 若 slot context 新字段影响类型推断，回滚 `record/fields` 暴露并保留旧 `task` 结构。
4. 本轮只改本地仓库代码，不涉及共享 schema 或服务器代码，因此回滚只需 Git 级代码回退，不需要数据补偿。

## Part 9: 架构决策记录

- ADR-1：优先补 `slot context`，再补 `full-card slot`，最后补 `lifecycle events`
  原因：先冻结数据真相，再冻结视图与交互真相，避免同一轮重复改 payload。
- ADR-2：保持 non-breaking
  原因：oneui 当前已有消费方，直接替换旧 slot 或旧状态回流会引入不必要回归。
- ADR-3：appearance 首轮只做最小集合
  原因：当前目标是降低业务接入成本，不是建立新的大体量皮肤系统。

## Part 10: 参考和附录

- 相关 issue：`ONEUI-ARCH-00054`、`ONEUI-ARCH-00056`、`ONEUI-ARCH-00058`
- 相关 task：`ONEUI-ARCH-00055`、`ONEUI-ARCH-00057`、`ONEUI-ARCH-00059`
- 关键代码位置：
  - [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue#L567)
  - [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue#L727)
  - [DatabaseViewContent.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue#L77)
  - [KanbanBoard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanBoard.vue#L43)
  - [KanbanBoard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanBoard.vue#L135)
  - [KanbanCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanCard.vue#L39)
  - [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L38)
  - [database.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts/database.ts#L252)
