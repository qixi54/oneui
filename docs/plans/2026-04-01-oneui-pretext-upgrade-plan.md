---
生成时间: 2026-04-01 11:10:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor/RichTextEditor.vue, issue:ONEUI-ARCH-00063, issue:ONEUI-FE-00147, issue:ONEUI-FE-00149
角色定义: ARCH
文档生成目的: 规划 OneUI 引入 Pretext 文本布局能力，并收口 AI 消息列表与卡片类虚拟布局的首批升级
生成模型: GPT-5 Codex
---

# OneUI Pretext Text Layout Upgrade Plan

## Part 1: 执行摘要

当前 OneUI 已具备虚拟列表与真实行高测量能力，但文本高度预估仍散落在组件侧，未形成统一文本布局内核。证据见 [AiMessageList.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue#L28)、[KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L111)、[GalleryCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue#L74) 与 [useVirtualList.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts#L20)。

本计划统一收口 `ONEUI-ARCH-00063`、`ONEUI-FE-00147`、`ONEUI-FE-00149`，执行顺序冻结为：先补文本布局适配层，再接入 AI 消息列表与 Kanban 虚拟卡片，最后补 Gallery 接口预留、验证与留痕。目标是在不替换现有富文本编辑器、不改变服务器或共享数据的前提下，为 OneUI 增加可复用的文本预测高度与预校验能力。

范围只覆盖本地仓库代码、测试、文档与 FlowAPI 治理留痕，不改服务器代码、不改共享 schema、不触发发版。预计 1.5 天完成实现与验证，额外预留 0.5 天缓冲。

## Part 2: 需求分析

| Issue | 问题定义 | 当前证据 | 优先级 | 解决层级 |
|---|---|---|---|---|
| `ONEUI-ARCH-00063` | OneUI 缺统一文本布局内核，预估逻辑散落在组件中 | [useVirtualList.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts#L20) | P0 | 内核契约 |
| `ONEUI-FE-00147` | AI 消息列表按字符数估高，长文本与多语言场景滚动不稳 | [AiMessageList.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue#L28) | P0 | 首批消费方 |
| `ONEUI-FE-00149` | Kanban 虚拟卡片固定 120px 高度，Gallery 只有展示截断没有预布局入口 | [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L111), [GalleryCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue#L171) | P1 | 卡片视图 |

冻结后的依赖关系：

1. `00063` 必须先落地，否则 `00147` 与 `00149` 会继续重复实现文本高度估算逻辑。
2. `00147` 与 `00149` 可以并行实现，但都基于统一的 adapter/composable。
3. `RichTextEditor` 保持不动，只允许消费纯文本摘要测量能力，不引入富文本排版改造。

## Part 3: 详细方案

### 3.1 核心概念定义

- `Text Layout Adapter`：OneUI 内部对 `@chenglou/pretext` 的薄适配层，负责把 `font`、`lineHeight`、`whiteSpace`、`maxWidth` 映射成高度/行数/行布局结果。
- `Predictive Height`：在组件实际渲染前根据文本、宽度、字体、行高计算出的预测高度，用于减少虚拟滚动的首屏误差。
- `Measured Correction`：组件渲染后继续使用 `ResizeObserver` 或现有测量链路修正实际高度，防止边角场景漂移。
- `Preview Guard`：给按钮、badge、卡片摘要等消费方提供的非侵入预检能力，用于判断潜在溢出或换行。

### 3.2 决策矩阵

| 场景 | 旧行为 | 新行为 | 兼容策略 |
|---|---|---|---|
| AI 消息列表 | 基于 `content.length` 粗估 | 先走 adapter 预测，再保留原有滚动修正 | 保持现有 props / emits 不变 |
| Kanban 虚拟卡片 | 固定 `120px` | 根据标题/摘要/meta 文本预测卡高 | 非虚拟模式不改 DOM 结构 |
| Gallery 卡片 | 仅 CSS clamp | 先补 adapter 接入点和摘要预测工具 | 本轮不强推破坏性视觉变更 |
| RichTextEditor | Quill 自身处理 | 保持不接 pretext | 避免把纯文本内核误用于富文本编辑态 |

### 3.3 方案细节

1. 新增内核层
   - 在 composables 或 utils 层新增 `useTextLayout` / `measureTextBlock` 适配器。
   - 封装 `prepare` 缓存复用、`layout` 调用、locale/cache 清理策略。
   - 明确只支持 `white-space: normal/pre-wrap` 与纯文本段落。

2. 升级 AI 消息列表
   - 在 [AiMessageList.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue#L28) 去掉基于字符数的单独公式。
   - 改为根据消息角色、容器宽度、气泡 padding、字体声明与 line-height 计算预测高度。
   - 保持 `scrollToBottom` 与消息流式更新行为不变。

3. 升级 Kanban / Gallery
   - 在 [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L111) 将虚拟模式卡高改为文本驱动的预测高度。
   - 在 [GalleryCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue#L74) 提取卡片标题/摘要预测工具与接入点。
   - 本轮不改 Gallery 的视觉样式，只为后续卡片统一布局策略留接口。

4. 测试与文档
   - 为 adapter 增加单元或集成测试，覆盖普通文本、中英混排、emoji 与窄宽度。
   - 补 AI 列表与 Kanban 的目标测试。
   - 更新 `README` / `ONEUI-INDEX` 或验证文档，说明文本布局升级边界。

### 3.4 伪代码

```ts
prepared = getPreparedText(text, font, whiteSpace)
metrics = layout(prepared, contentWidth, lineHeight)
predictedHeight = chromeOffset + metrics.height

if (componentHasMeasuredCorrection) {
  use predictedHeight as initial virtual height
  replace with measured height after render
}
```

## Part 4: 实现路线图

### Phase A: Freeze Contract

- 引入 `@chenglou/pretext`
- 新增 OneUI 文本布局 adapter
- 固定 font/lineHeight/whiteSpace 约束与 fallback 规则

### Phase B: Parallel Consumption

- 子任务 1：AI 消息列表接入预测高度
- 子任务 2：Kanban 虚拟卡片接入预测高度
- 主代理：Gallery 接口预留、统一测试与回归

### Phase C: Verification And Closeout

- 跑 targeted vitest、type-check、build
- 如门禁允许，补 lint/stylelint
- 写回 issue/task/plan 证据与验证报告

## Part 5: 工作量估计

| 工作项 | 角色 | 估计 |
|---|---|---|
| 契约冻结、Plan/Issue/Task 留痕 | ARCH | 0.5 天 |
| 文本布局 adapter 实现 | ARCH | 0.5 天 |
| AI 列表与 Kanban 接入 | FE | 0.5 天 |
| 测试、回归、验证文档 | ARCH | 0.5 天 |
| 缓冲 | ARCH | 0.5 天 |

总计：`2.5 天` 预算，其中 `2.0 天` 为执行工作量，`0.5 天` 为缓冲。

## Part 6: 风险评估

| 等级 | 风险 | 触发条件 | 应对方案 |
|---|---|---|---|
| High | `pretext` 只支持纯文本段落，误用到富文本编辑态 | 直接给 Quill 内容做编辑态排版 | 保持 RichTextEditor 非目标，只允许摘要/预览态消费 |
| High | 字体声明与真实 CSS 不一致导致预测高度失真 | adapter 未与 token/font 声明同步 | 在 adapter API 中显式要求 `font` 与 `lineHeight` 参数，并写测试覆盖 |
| Medium | 预测高度与实际气泡 chrome/padding 存在偏差 | 组件侧未把 padding/badge 区域计入高度 | 抽离 `chromeOffset` 常量并保留 measured correction |
| Medium | Kanban 自定义卡片 slot 高度不可预测 | 业务自定义内容改变 DOM 结构 | 自定义 card slot 场景继续禁用虚拟化或退回固定策略 |
| Low | 引入新依赖影响构建边界 | 包体或类型导出变化 | 仅内部消费，不新增 public API 破坏性导出 |

## Part 7: 验收标准

1. criterion: OneUI 内部存在可复用文本布局 adapter，并通过文本测量相关测试
   verify_command: `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npx vitest run src/tests/useTextLayout.integration.spec.ts'`
2. criterion: AiMessageList 不再直接使用字符数估高，且滚动行为回归测试通过
   verify_command: `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npx vitest run src/tests/ai-message-list.integration.spec.ts src/tests/useVirtualList.integration.spec.ts'`
3. criterion: Kanban 虚拟卡片使用文本驱动的预测高度，相关测试通过
   verify_command: `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npx vitest run src/tests/kanban.integration.spec.ts'`
4. criterion: 类型检查与构建通过
   verify_command: `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check && npm run build'`

## Part 8: 回滚方案

1. 若 `pretext` 接入导致预测高度误差过大，先回滚消费方接入，保留 adapter 文件但不启用。
2. 若 adapter 本身引发类型或构建问题，回滚依赖与 adapter 导出，恢复原有估高逻辑。
3. 若 Kanban 自定义卡片场景回归，优先把虚拟模式重新限定为默认卡片模式。
4. 本轮不改共享数据库、测试服务器或生产服务器，因此回滚只需本地仓库代码回退，不需要数据补偿。

## Part 9: 架构决策记录

- ADR-1：先沉淀 adapter，再接入消费方
  原因：避免 AI、Kanban、Gallery 再次复制估高公式。
- ADR-2：保留 measured correction，不把预测高度当成唯一真相
  原因：文本测量只能解决段落高度，组件 chrome 仍需渲染后修正。
- ADR-3：RichTextEditor 不纳入本轮
  原因：`pretext` 不是富文本编辑排版引擎，本轮目标是纯文本预测高度与预检。

## Part 10: 参考和附录

- 相关 issue：`ONEUI-ARCH-00063`、`ONEUI-FE-00147`、`ONEUI-FE-00149`
- 预期执行 task：`ONEUI-ARCH-00064`、`ONEUI-FE-00148`、`ONEUI-FE-00150`
- 关键代码位置：
  - [AiMessageList.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue#L28)
  - [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue#L111)
  - [GalleryCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue#L74)
  - [useVirtualList.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts#L20)
  - [RichTextEditor.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor/RichTextEditor.vue#L132)
  - pretext README: <https://raw.githubusercontent.com/chenglou/pretext/main/README.md>
