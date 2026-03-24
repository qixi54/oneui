---
生成时间: 2026-03-23 12:28:52
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.8.6.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/ONEUI-INDEX.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.7 的 kanban integration closeout、DatabaseView action contract 补齐与公开文档同步
生成模型: GPT-5 Codex
---

# OneUI v0.8.7 — Kanban Integration Closeout

## 版本概述

`0.8.7` 是一轮以 kanban integration 为核心的 patch release。目标不是新增组件，而是把 `DatabaseView -> KanbanBoard -> KanbanColumn -> KanbanCard` 这条链路补到“可扩展、可持久化、可验证、文档一致”的状态。

## 变更清单

1. `src/components/kanban/KanbanBoard.vue`
   - 新增 board-level slot forwarding：`column-header`、`card-title`、`card-meta`、`card-tags`
   - 补齐 `priorityColorMap/statusColorMap` 透传

2. `src/components/kanban/KanbanColumn.vue`
   - 支持 header/card slot forwarding
   - 当启用自定义 card slot 时自动关闭虚拟滚动，避免可变高度卡片导致布局错位
   - 增加稳定的 `data-kanban-*` 属性

3. `src/components/kanban/KanbanCard.vue`
   - 新增 `title/meta/tags` slots
   - 增加稳定的 `data-kanban-card-*` 属性

4. `src/components/database/DatabaseViewContent.vue`, `src/components/database/DatabaseView.vue`
   - 打通 kanban `update:columns` 事件链
   - `DatabaseView` 在 kanban 更新时按 `record.id` 合并原记录字段，保留非看板字段
   - quick-add / move-card 对应的 create/update/delete 动作可回传到页面级 actions

5. `src/composables/useDatabaseView.ts`, `src/composables/useDatabaseViewMiddleware.ts`, `src/contracts/database.ts`
   - 新增 `create-record / update-record / delete-record` action 语义
   - 让 toast / analytics / optimistic middleware 能覆盖看板持久化动作
   - 清理 database contract 中遗留的类型噪点

6. `src/tests/database-view.integration.spec.ts`, `src/tests/database-view-middleware.integration.spec.ts`
   - 新增 record preservation、slot forwarding、virtualization guard 和 middleware coverage 回归测试

7. `README.md`, `docs/ONEUI-INDEX.md`
   - 同步公开 actions 契约、KanbanBoard slot 用法、自定义 card slot 下的 virtualization 运行规则

## 关联 issue

1. `ONEUI-ARCH-00048`
2. `ONEUI-ARCH-00050`
