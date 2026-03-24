---
生成时间: 2026-03-23 13:31:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-23-databaseview-kanban-ergonomics-plan.md
角色定义: ARCH
文档生成目的: 验证 DatabaseView/Kanban 第二阶段增强已收口 ONEUI-ARCH-00054 / 00056 / 00058
生成模型: GPT-5 Codex
---

# OneUI Kanban Ergonomics Verification

## 1. 交付范围

- issue: `ONEUI-ARCH-00054`
- issue: `ONEUI-ARCH-00056`
- issue: `ONEUI-ARCH-00058`
- plan: `68e60a53-9190-43d8-aa5b-27112bbdb1f9`
- execution task: `ONEUI-ARCH-00060`

## 2. 代码变更

- [database.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/contracts/database.ts)
  暴露 `record/fields`、`kanban-card`、`kanbanAppearance`、`kanban-quick-add`、`kanban-card-move`
- [KanbanBoard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanBoard.vue)
  增加 full-card slot、appearance 透传、quick-add 与 card-move 事件
- [KanbanCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanCard.vue)
  增加 `card` slot 与 variant class/data attr
- [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue)
  暴露 header `tasks`、转发 `card` slot、最小 column/card variant
- [DatabaseViewContent.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewContent.vue)
  在透传链中为 slot context 回填 `record/fields`，并转发 lifecycle 事件
- [DatabaseView.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue)
  页面级透传 `kanbanAppearance`、`kanban-card` 与 lifecycle 事件，并支持 actions callback
- [database-view.integration.spec.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts)
  验证 slot context、full-card slot、appearance、quick-add/card-move 和页面级 actions

## 3. 验收结果

### 3.1 定向集成

命令：

```bash
npx vitest run src/tests/database-view.integration.spec.ts
```

结果：

- 通过
- `17 tests` 全部通过

### 3.2 全量测试

命令：

```bash
npm test
```

结果：

- 通过
- `21 files / 92 tests` 全部通过

### 3.3 静态门禁

命令：

```bash
npm run lint
npm run lint:style
npm run type-check
```

结果：

- 全部通过

### 3.4 构建门禁

命令：

```bash
npm run build
```

结果：

- 通过
- `vue-tsc && vite build` 完成

## 4. 结论

`ONEUI-ARCH-00056` 的数据契约缺口已关闭：业务 slot 可以直接访问 `record/fields`。

`ONEUI-ARCH-00054` 的视图契约缺口已关闭：`DatabaseView` 现已公开 `kanban-card` full slot，并保留旧分段 slot 兼容。

`ONEUI-ARCH-00058` 的交互契约缺口已关闭：`DatabaseView` 现已公开 `kanban-quick-add` 与 `kanban-card-move`，业务层不再需要只靠 diff `records` 判断语义动作。
