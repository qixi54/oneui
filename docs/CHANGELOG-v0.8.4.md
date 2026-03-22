---
生成时间: 2026-03-23 14:20:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-23-release-0.8.4-proof.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.4 的编辑态交互修复与命令中枢能力
生成模型: GPT-5 Codex
---

# OneUI v0.8.4 — DataTable 交互闭环与 Ops 命令中枢

## 版本概述

`0.8.4` 将 0.8.3 的中控台骨架继续收口到“交互闭环可用”：修复了表格内单元格编辑态链路，并将命令中心能力独立为可测试、可复用的 registry 模块。同时补齐验收与双宿主消费端构建证据，形成可追溯交付。

## 变更清单

1. `src/components/table/DataTable.vue`
   - 对 `FieldCell` 新增 `request-edit` / `request-cancel` 事件上抛接收。
   - 新增 `isCellEditing` 判断与 `onCellRequestEdit / onCellRequestCancel` 分发，修复“行级编辑按钮点击后无进入编辑态”的链路。
   - 仅在启用键盘模式时同步 `setActiveCell`，避免非键盘场景回灌状态冲突。

2. `src/components/table/FieldCell.vue`
   - 增加 `editing` 外部受控 prop：支持由 `DataTable` 统一托管编辑态。
   - 新增 `request-edit`、`request-cancel` 事件，并将 `cancel` 始终上抛给外层。
   - 编辑态样式与交互计算改为受控优先，减少内外状态不一致。

3. `src/tests/table-detail.integration.spec.ts`
   - 新增行动作回归测试：
     - “详情”按钮触发 `row-click`。
     - “编辑”按钮能使首行进入 `FieldCell` 编辑态。

4. `src/dev/opsCommandRegistry.ts`（新文件）
   - 提炼命令定义为 `createOpsCommands` 工厂，涵盖新建任务 / 查看日志 / 配置中心 / 数据总览 4 个常用命令。
   - 定义统一的命令 workspace 结构（标题、上下文、动作列表），支持 Drawer/SidePanel 不同展示方式。

5. `src/tests/ops-command-registry.integration.spec.ts`（新文件）
   - 覆盖命令集合长度、快捷入口、section 切换、动作执行副作用与收起行为。

6. `src/dev/App.vue`
   - 接入 `opsCommandRegistry`，新增顶部“全局命令中枢”与工作区展示（Drawer/SidePanel）。
   - 保留原有功能区布局，在不影响现有演示页功能的情况下补齐可操作路径。

7. `src/styles/variables.css`, `src/styles/themes/neutral.css`, `src/styles/themes/ops-console.css`
   - 增加/补齐与 0.8.3 相关的 shell token 与视觉 token，减少命令中枢与内容区视觉割裂。

## 发布范围与质量

1. 版本号：`package.json` / `package-lock.json` 更新为 `0.8.4`。
2. 基础门禁：`npm run type-check`、`npm run test`、`npm run lint`、`npm run lint:style`、`npm run build`。
3. 包装与预发布：`npm pack` + `npm publish --dry-run` + `tar` 清单计数。
4. 外部消费验证：Vite 5.4.0 与 Vite 8.0.1，均使用本地 tarball 作为 `@oneflowui/ui` 依赖。
5. 当前发布状态：已在 `registry.npmjs.org` 真实发布，`npm view @oneflowui/ui@0.8.4` 返回 `0.8.4`。
