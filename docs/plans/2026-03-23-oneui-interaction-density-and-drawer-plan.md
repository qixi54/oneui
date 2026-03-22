---
生成时间: 2026-03-23 10:32:00
参考文档: docs/plans/2026-03-21-oneui-productivity-upgrade-plan.md, docs/plans/2026-03-21-a11y-and-extensibility-remediation-plan.md, docs/plans/2026-03-23-ops-console-unification-plan.md
角色定义: ARCH
文档生成目的: 建立 One UI 交互密度提升与单页闭环，减少页面跳转，提升中控台级操作效率。
生成模型: GPT-5 Codex
---

# OneUI 交互密度提升与单页闭环 Plan

## 一、问题定义

当前系统的交互骨架已具备，真正“企业级感觉”缺口不在页面能否展示，而在“动作执行成本”：

1. 当前任务明细与错误追踪仍然偏页面跳转，流程碎片化。
2. 表格与列表交互缺少 hover-action 和高频快捷动作。
3. 错误状态、加载与空态切换缺乏统一动作编排，用户要花更多点击确认。

## 二、目标

1. 在不改动核心域模型的前提下，先做“原地处理”能力。
2. 将常见的详情、日志、配置修改迁移到右侧 Drawer 或统一的 Detail 区域。
3. 建立“行级动作显现机制”，降低点击层级。

## 三、工作范围

1. `src/components/table/DataTable.vue`
2. `src/components/database/DatabaseView.vue`
3. `src/components/overlay/Drawer.vue`
4. `src/components/overlay/SidePanel.vue`
5. `src/dev/App.vue`（演示页内的组件行为联调）

## 四、执行分解

### 1. Drawer 原子动作规范（P0）

1. 定义统一动作入口：`view / edit / run / trace / export`。
2. 每个动作绑定键盘触发路径，默认只触发轻量预览面板。
3. Drawer 内支持三级信息：摘要卡片、可读字段、可直接执行控件。

### 2. 行内操作和悬停动作（P0）

1. 在表格行 hover 时显示 2~3 个高频按钮。
2. 对行内编辑场景设置只读-编辑-提交三态，减少导航。
3. 对异常状态行支持“快速修复入口”徽标。

### 3. 视图动作协议与中间层事件（P1）

1. 约束动作 payload：`actionId + entity + target + origin`。
2. 在 DatabaseView / Drawer / SidePanel 之间建立统一事件总线。
3. 保持单元回退能力：所有行内动作必须有二次确认或 toast 回执。

## 五、并行实施（可并发）

1. **Overlay Agent**：负责编排 Drawer / SidePanel 协议与细节。
2. **Table Agent**：负责表格 hover 行动与行内编辑状态。
3. **Database Agent**：对 DatabaseView 的 action mapping 与 detail 状态进行统一封装。
4. **Docs & QA 预置 Agent**：准备验证项与可回滚记录。

## 六、验收标准

1. 表格行内可无新页完成至少 2 个核心动作。
2. 常用详情类入口默认不离开当前页面。
3. `npm run test` 能覆盖新增动作分支。
4. 交互变更不影响现有 `sections` 布局状态与快捷键绑定。

## 七、风险与控制

1. 行内编辑与 detail state 混用可能引入双写突变，必须通过 action-id 去重。
2. Drawer 过载会拖慢首屏，限制默认渲染体积。
3. 若覆盖面过大，可先从 `App.vue` 演示流和 `DataTable` 表格路径切入，保留其余路径回收。

## 八、收口

1. 阶段成果先形成 `verification` 文档。
2. 与 theme 计划并行执行，避免样式与交互双向回归。
3. 与发布计划衔接前先做一次交互 smoke。
