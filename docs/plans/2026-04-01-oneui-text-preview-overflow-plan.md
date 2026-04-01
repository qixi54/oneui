---
生成时间: 2026-04-01 13:36:32
参考文档: /opt/Oneflow/SOP/规划文档写作标准.md
角色定义: ARCH
文档生成目的: 为 OneUI 下一批文本预览与溢出检测优化建立可执行计划、并行任务边界与回溯依据
生成模型: GPT-5 Codex
---

# Part 1: 执行摘要

OneUI 已完成第一批 `pretext` 文本布局接入，但展示态文本仍存在三类未收口问题：Markdown 预览仍按字符数判断截断、InfoCard 仍完全依赖 CSS clamp、表格 `FieldCell` 缺少真实溢出状态。证据见 `src/components/field/FieldMarkdownPreview.vue:31`、`src/components/base/InfoCard.vue:268`、`src/components/table/FieldCell.vue:156`。本计划收口 `ONEUI-FE-00153`、`ONEUI-FE-00155`、`ONEUI-FE-00157`，目标是为展示态文本补统一的真实溢出检测和可观测层，不改富文本编辑器本体。执行顺序固定为：先冻结展示态 contract 与测试口径，再并行实现 Markdown 预览、InfoCard、FieldCell 三块，最后做验证与留痕。

# Part 2: 需求分析

| 优先级 | 需求 | 当前问题 | 目标结果 |
|---|---|---|---|
| P0 | Markdown 预览截断判断 | `FieldMarkdownPreview` 通过 `content.length > 100` 或换行判断是否截断，和真实列宽不一致 | 改为基于真实宽度和文本布局结果判断截断 |
| P0 | InfoCard 文本可观测性 | 标题/摘要仅依赖 `ellipsis` / `line-clamp`，后续卡片列表无法感知是否溢出 | 增加统一文本布局接入点与可观测属性 |
| P1 | FieldCell 展示态统一溢出规则 | 普通文本与 richtext 预览分流，缺少统一溢出状态 | 补统一 overflow-check 入口且不影响 inline edit |

决策矩阵：

| 场景 | 采用策略 | 非目标 |
|---|---|---|
| 展示态纯文本 / markdown 预览 | 优先真实溢出检测，必要时结合 `measureTextBlock` 预测 | 不在本轮引入复杂 tooltip 系统 |
| 富文本编辑态 | 保持 Quill 方案 | 不替换 `RichTextEditor` |
| 表格虚拟滚动行高 | 保持现有 `measureRow` 修正 | 不重做 `DataTable` 主体虚拟化 |

# Part 3: 详细方案

## 3.1 统一展示态文本检测 contract

新增一个轻量展示态文本检测 composable，职责限定为：

1. 读取容器实际宽度与文本样式。
2. 输出 `isOverflowing`、预测高度或相关 `data-*` 属性。
3. 允许 `FieldMarkdownPreview`、`InfoCard`、`FieldCell` 复用。

伪代码：

```ts
const { targetRef, isOverflowing, predictedHeight, refresh } = useTextOverflow({
  text,
  font,
  lineHeight,
  maxLines,
  mode: "single-line" | "multi-line",
});

if (mode === "single-line") {
  isOverflowing = scrollWidth > clientWidth;
} else {
  predictedHeight = measureTextBlock(...);
  isOverflowing = predictedHeight > clampHeight;
}
```

## 3.2 Markdown 预览

修改 `src/components/field/FieldMarkdownPreview.vue`：

1. 保留 `stripMarkdown()` 和 expanded 模式。
2. collapsed 模式下根据真实宽度和文本布局结果决定 `isTruncated`。
3. 只在真实溢出时显示 `...` 或相关标记。

## 3.3 InfoCard

修改 `src/components/base/InfoCard.vue`：

1. 标题和内容增加展示态溢出检测。
2. 暴露 `data-info-card-title-overflow`、`data-info-card-content-overflow` 或等效变量。
3. 维持 `memo / notify / history` 三个 variant 现有 API。

## 3.4 FieldCell

修改 `src/components/table/FieldCell.vue`：

1. 普通文本场景增加真实单行溢出检测。
2. richtext 继续复用 `FieldMarkdownPreview`，但对齐展示态可观测属性。
3. 不修改 inline edit、commit/cancel、异步 editor map。

# Part 4: 实现路线图

## Phase A: Contract 冻结

1. 明确展示态文本检测 composable 的输入输出。
2. 冻结三个消费方的目标属性与测试口径。

## Phase B: 并行实现

1. Worker A：`FieldMarkdownPreview` + 相关测试。
2. Worker B：`InfoCard` + 相关测试。
3. Worker C：`FieldCell` + 表格相关测试。

## Phase C: 集成与回填

1. 主代理整合公共 composable。
2. 跑 targeted vitest、`npm run type-check`、必要 build。
3. 回填 issue / task / plan / verification report。

# Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|---|---|---|
| ARCH | 收敛 contract、计划、任务、整合与回填 | 0.5 天 |
| FE | Markdown 预览实现与测试 | 0.5 天 |
| FE | InfoCard 实现与测试 | 0.5 天 |
| FE | FieldCell 实现与测试 | 0.5 天 |
| 缓冲 | 整合冲突、样式修正、测试补强 | 0.5 天 |

总计：约 2.5 天。

# Part 6: 风险评估

| 等级 | 风险 | 影响 | 缓解动作 |
|---|---|---|---|
| High | 真实溢出检测依赖 DOM 尺寸，测试环境不稳定 | 集成测试脆弱 | 在测试中 mock `ResizeObserver` / DOM metrics |
| High | 多处共享新 composable，容易和用户现有改动冲突 | 合并风险上升 | 拆成三条独立写入边界，公共层由主代理整合 |
| Medium | `InfoCard` 可观测属性命名不稳定 | 后续复用成本上升 | 先冻结 `data-*` 命名，再进入并发实现 |
| Low | 表格展示态改动影响 hover / click 行为 | 轻微交互回归 | 保持 `FieldCell` 根节点与点击逻辑不变 |

# Part 7: 验收标准

1. `npx vitest run src/tests/field-markdown-preview.integration.spec.ts`
2. `npx vitest run src/tests/info-card.integration.spec.ts`
3. `npx vitest run src/tests/table-detail.integration.spec.ts`
4. `npm run type-check`
5. 验证文档中记录展示态文本可观测属性与影响边界

# Part 8: 回滚方案

1. 若公共 composable 引入不稳定，先回滚消费方接入，保留已存在的 `useTextLayout`。
2. 若单个消费方回归，只回滚该组件及对应测试，不整链回退。
3. 本轮不改服务器代码，不改共享数据库；回滚仅限本地代码与 FlowAPI 留痕更新。

# Part 9: 架构决策记录

1. 不把 `pretext` 直接推进到富文本编辑器，而是继续限制在展示态文本预测。
2. `DataTable` 主虚拟化链路保持现状，只补 `FieldCell` 展示态溢出感知。
3. 并行实现以消费方为边界，共享 composable 最终由主代理收口。

# Part 10: 参考和附录

1. Issue：`ONEUI-FE-00153`、`ONEUI-FE-00155`、`ONEUI-FE-00157`
2. 代码位置：
   - `src/components/field/FieldMarkdownPreview.vue:31`
   - `src/components/base/InfoCard.vue:268`
   - `src/components/table/FieldCell.vue:156`
   - `src/components/table/DataTable.vue:409`
3. 相关基建：
   - `src/composables/useTextLayout.ts`
   - `src/composables/useVirtualList.ts`
