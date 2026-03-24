---
生成时间: 2026-03-23 12:53:21
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.8.7.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/oneui-arch-00053-verification-20260323.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.8 对 DatabaseView kanban 定制能力补齐与发布验证收口
生成模型: GPT-5 Codex
---

# OneUI v0.8.8 — DatabaseView Kanban Customization Closeout

## 版本概述

`0.8.8` 是一轮 patch release，目标是把 `KanbanBoard` 已具备的定制能力正式抬升到 `DatabaseView` 这一层，避免业务仓为了自定义列头、卡片模板或颜色映射而绕开页面级入口。

## 变更清单

1. `src/contracts/database.ts`
   - `DatabaseViewProps` 新增 `priorityColorMap`、`statusColorMap`
   - `DatabaseViewSlots` 扩展出 `kanban-column-header`、`kanban-card-title`、`kanban-card-meta`、`kanban-card-tags`

2. `src/components/database/DatabaseViewContent.vue`
   - 将 kanban slots 与 `priorityColorMap/statusColorMap` 透传到 `KanbanBoard`
   - 继续保留 `update:columns` 逐层转发

3. `src/components/database/DatabaseView.vue`
   - 业务页面可直接在 `DatabaseView` 上定义 kanban slot
   - 页面级 `priorityColorMap/statusColorMap` 已接入 `DatabaseViewContent`

4. `src/tests/database-view.integration.spec.ts`
   - 新增 `DatabaseViewContent` 级 passthrough 测试
   - 新增“业务页面直接使用 `DatabaseView` 自定义 kanban slots / colorMap”回归测试

5. `src/components/database/DatabaseDetailPresenter.vue`
   - 调整 `<script setup>` 宏顺序，清理发布前 lint warning

6. `docs/oneui-arch-00053-verification-20260323.md`
   - 补齐本轮 lint / stylelint / 全量测试 / build / quick review canary 验证结果

## 关联 issue

1. `ONEUI-ARCH-00052`
2. `ONEUI-ARCH-00053`
