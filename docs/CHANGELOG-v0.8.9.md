---
生成时间: 2026-03-23 13:34:30
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.8.8.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/oneui-kanban-ergonomics-verification-20260323.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.9 对 DatabaseView/Kanban ergonomics closeout 的发版内容与验证范围
生成模型: GPT-5 Codex
---

# OneUI v0.8.9 — DatabaseView Kanban Ergonomics

## 版本概述

`0.8.9` 是一轮 patch release，目标是把 `DatabaseView` 的 kanban 定制能力从“局部可用”提升到“业务可直接接入”，重点补齐 slot context、整卡定制与 lifecycle 事件语义。

## 变更清单

1. `src/contracts/database.ts`
   - kanban slot context 直接暴露 `record`、`fields`、列级 `records`
   - 新增 `kanban-card` full slot、`kanbanAppearance`、`kanban-quick-add`、`kanban-card-move` 契约

2. `src/components/kanban/KanbanBoard.vue`, `src/components/kanban/KanbanColumn.vue`, `src/components/kanban/KanbanCard.vue`
   - 补齐 full-card slot forwarding
   - 增加最小 appearance 开关与 card/column variant
   - 发出 quick-add 与 card-move 显式事件

3. `src/components/database/DatabaseViewContent.vue`, `src/components/database/DatabaseView.vue`
   - `DatabaseView -> KanbanBoard` 全链透传 slot / appearance / lifecycle 事件
   - 页面级 actions 可以直接消费 quick-add / move-card 语义

4. `src/tests/database-view.integration.spec.ts`
   - 补齐 record/fields slot context、full-card slot、quick-add / move 事件回归测试

5. `docs/oneui-kanban-ergonomics-verification-20260323.md`
   - 记录本轮 lint、stylelint、全量测试、type-check、build 验收结果

## 关联 issue

1. `ONEUI-ARCH-00054`
2. `ONEUI-ARCH-00056`
3. `ONEUI-ARCH-00058`

