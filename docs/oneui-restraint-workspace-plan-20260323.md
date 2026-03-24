---
生成时间: 2026-03-23 02:21:30
参考文档: /opt/Oneflow/flowlab/项目/flow-kanban/code/develop/src/components/TaskDetailModal.tsx
角色定义: ARCH（架构师）
文档生成目的: 固化 OneUI 克制型页面表达标准，并约束 detail/workspace/dev 示例的收敛执行
生成模型: GPT-5
---

# OneUI 克制型页面表达标准与示例收敛计划

## Part 1: 执行摘要

OneUI 当前主要问题不是缺组件，而是页面表达过重。多个示例和复合界面把辅助信息、说明文字、按钮和装饰块提升成了视觉主角，导致主次混乱。

本计划目标是建立一套可复用的“克制型页面表达标准”，先收敛 detail workspace 链路，再反向清理 dev 示例中的复合组合。第一阶段以 `src/components/database/*`、`src/components/workspace/*` 和 `src/dev/App.vue` 为落点，形成可复用的宿主、骨架和内容表达基线。

预期结果不是新增更多组件，而是让页面默认低表达、易组合、可扩展。最终以类型检查、集成测试和 dev 页面可视验证为验收依据。

## Part 2: 需求分析

### 2.1 当前问题

| 问题 | 当前表现 | 影响 |
|---|---|---|
| 重点漂移 | 辅助说明、补充信息、演示文案占用大版面 | 用户无法快速判断主内容 |
| 承载语义混乱 | `drawer` 被实现成右侧抽屉而不是居中弹窗 | 交互预期错误 |
| 组件自我表达过强 | badge、卡片、按钮、说明块存在感过高 | 页面割裂，难以组合 |
| demo 与标准不一致 | `App.vue` 混入架构说明、解释型块 | 示例误导后续复用方式 |
| 宽度与阅读节奏不稳定 | side-panel 拖拽未接通；markdown 字级被全局样式覆盖 | 用户体验不连续 |

### 2.2 范围

P0 范围：

- `src/components/database/DatabaseViewDetailHost.vue`
- `src/components/database/DetailContent.vue`
- `src/components/overlay/SidePanel.vue`
- `src/components/overlay/Modal.vue`
- `src/components/workspace/WorkspaceDetailPreviewBlock.vue`
- `src/components/workspace/WorkspaceActivityFeed.vue`
- `src/components/workspace/WorkspaceDetailActionBar.vue`
- `src/dev/App.vue`

P1 范围：

- dev 复合组件示例的重组
- 形成可复用的 workspace 组合建议

P2 范围：

- 将同一套克制表达规则推广到其他页面示例

## Part 3: 详细方案

### 3.1 页面表达规则

1. 标题区只承载标题、状态、少量动作，不承载解释性文案。
2. 元信息区默认按自然字段排版处理，只有状态和优先级允许轻量强调。
3. 正文区保持自然阅读，不再包装成说明卡、洞察卡、摘要卡。
4. 活动区按记录流表达，条目之间用轻分隔线组织，不使用评论卡外观。
5. 页脚默认弱化，仅保留必要关闭或确认动作。
6. demo 页面不得把“架构说明、可复用性说明、多槽位说明”作为内容区的一部分展示。

### 3.2 承载规则

| presentation | 规则 | 当前落点 |
|---|---|---|
| `side-panel` | 右侧打开，可拖拽宽度 | `src/components/overlay/SidePanel.vue` |
| `drawer` | 居中弹窗，点击空白关闭 | `src/components/overlay/Modal.vue` + `src/components/database/DatabaseViewDetailHost.vue` |
| `fullscreen` | 全屏占据主要工作区，自适应布局，不走遮罩关闭 | `src/components/overlay/Drawer.vue` + `src/components/database/DatabaseViewDetailHost.vue` |

### 3.3 复合组件规则

复合界面必须遵守以下顺序：

1. `WorkspaceHeader`
2. `MetadataGroup`
3. `ContentSection`
4. `ActivityFeed`
5. `ActionRow`

禁止顺序：

1. 说明块先于内容
2. 大色块先于正文
3. 多个同权重卡片并列争夺注意力

### 3.4 参考实现

- React 基线：`/opt/Oneflow/flowlab/项目/flow-kanban/code/develop/src/components/TaskDetailModal.tsx`
- 当前宿主：`src/components/database/DatabaseViewDetailHost.vue`
- 当前内容骨架：`src/components/database/DetailContent.vue`
- 当前 dev 示例：`src/dev/App.vue`

## Part 4: 实现路线图

### Phase 1: Detail Workspace 收敛

- 统一 `side-panel / drawer / fullscreen` 语义与关闭方式
- 收敛 detail 内容区、活动区、页脚区表达
- 修通侧栏拖拽与 markdown 覆盖问题

### Phase 2: Dev 示例收敛

- 删除架构说明型内容块
- 重做复合组件示例，只保留真实组合
- 用克制表达规则反向约束 `App.vue` 示例

### Phase 3: 标准沉淀

- 输出 OneUI 克制型页面表达规则
- 标记哪些示例和组件仍需后续清理

## Part 5: 工作量估计

| 阶段 | 角色 | 估计 |
|---|---|---|
| Phase 1 | FE/ARCH | 0.5 天 |
| Phase 2 | FE/ARCH | 0.5 天 |
| Phase 3 | ARCH | 0.5 天 |

总计：1.5 天，含 20% 缓冲。

## Part 6: 风险评估

| 级别 | 风险 | 应对 |
|---|---|---|
| High | 过度依赖 dev 示例，导致标准被演示页反向污染 | 先冻结表达规则，再改示例 |
| Medium | markdown 全局样式覆盖局部阅读区 | 对 demo 和 workspace 层做明确覆盖 |
| Medium | 拖拽状态只在 demo 层生效，未沉淀到正式调用链 | 同时保留 `DatabaseView` 正式链路验证 |
| Low | 历史复合组件示例仍保留“展示感” | 分阶段清理，不一次性扩散到全仓库 |

## Part 7: 验收标准

1. `src/dev/App.vue` 的详情页中不再出现架构说明型内容区。
   验证：手动打开 `detail` 分区并检查页面内容。
2. `side-panel` 可以拖拽改变宽度，且交互可感知。
   验证：手动拖拽 dev 页右侧详情，观察宽度变化。
3. `drawer` 为居中弹窗，点击遮罩关闭；`fullscreen` 不走遮罩关闭。
   验证：手动切换三种 presentation 并检查行为。
4. markdown 正文阅读区的字号低于元信息标题区，不再显得突兀。
   验证：手动查看 dev 页 detail demo。
5. 活动记录按条目分隔，不使用评论卡外观。
   验证：手动查看 dev 页 activity 区。
6. 代码层无回归。
   验证命令：`pnpm type-check`
   验证命令：`pnpm test -- src/tests/database-view.integration.spec.ts`

## Part 8: 回滚方案

如果局部收敛导致体验退化：

1. 仅回滚 dev 示例层样式，不回滚宿主语义修正。
2. 若 `drawer` 居中弹窗与既有测试或预期冲突，优先保留 `Modal` 路径，补示例说明，不恢复右侧抽屉语义。
3. 若 markdown 阅读区被全局样式再次覆盖，补更高优先级局部选择器，不改全局 markdown 真源。

## Part 9: 架构决策记录

### ADR-001

`detail workspace` 不是单个组件能力，而是“宿主协议 + 内容骨架 + 业务内容”的组合能力。

### ADR-002

dev 页面不再承担架构说明职责，架构说明留在文档与计划，不进入页面内容区。

### ADR-003

OneUI 默认优先沉淀“低表达、可组合的页面骨架”，而不是继续叠加高表现欲组件。

## Part 10: 参考和附录

- `src/components/database/DatabaseViewDetailHost.vue`
- `src/components/database/DetailContent.vue`
- `src/components/workspace/WorkspaceDetailPreviewBlock.vue`
- `src/components/workspace/WorkspaceActivityFeed.vue`
- `src/components/workspace/WorkspaceDetailActionBar.vue`
- `src/components/overlay/SidePanel.vue`
- `src/components/overlay/Modal.vue`
- `src/dev/App.vue`
