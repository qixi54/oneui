---
生成时间: 2026-03-21 13:05:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI 剩余 open issue 的可访问性、默认样式和 DataTable 可扩展性修复建立执行与回溯依据
生成模型: GPT-5 Codex
---

# OneUI A11y / Contrast / Extensibility 修复计划

## Part 1: 执行摘要

当前 OneUI 发布阻塞链路已完成，但仍有 4 个 open issue 未闭环：`ONEUI-FE-00067`、`ONEUI-FE-00068`、`ONEUI-FE-00072`、`ONEUI-ARCH-00020`。本轮目标是收掉真正的默认缺陷，并同步清理治理状态落后于代码事实的问题。范围包括 DataTable ARIA 结构、Breadcrumb/Badge 默认对比度、DataTable cell slot forwarding，以及 DatabaseView issue 的状态同步。

## Part 2: 需求分析

| Issue | 优先级 | 当前问题 | 目标状态 |
|------|--------|----------|----------|
| `ONEUI-FE-00067` | P1 | DataTable `role=grid` 结构不合法 | 表头/行/单元格语义合法，Lighthouse 不再命中 aria-required-parent/children |
| `ONEUI-FE-00068` | P1 | Breadcrumb/Badge 默认对比度不足 | 默认 token 满足常规文本 WCAG 4.5:1 |
| `ONEUI-ARCH-00020` | P2 | DataTable 未透传 `#cell` | 消费侧可用统一 cell slot 自定义渲染 |
| `ONEUI-FE-00072` | P2 | DatabaseView issue 仍 open | 若代码已满足，则同步 resolve；若有缺口则补齐后 resolve |

## Part 3: 详细方案

1. 修正 `DataTable`、`TableHeaderRow`、`TableDataRow` 的 ARIA 结构，使 grid/header/row/cell 语义一致。
2. 调整 `Breadcrumb` 默认链接色和 `Badge` token，使默认组合在 12px/14px 常规文本尺寸下通过对比度要求。
3. 在 `DataTable` 层透传外部 `#cell` 插槽，不再因内部 `FieldCell` 分支吞掉消费侧自定义渲染。
4. 核对 `DatabaseView + useDatabaseView`、README、CHANGELOG、integration test 与 `ONEUI-FE-00072` 的期望是否一致；若一致则直接做 issue 治理收口。

## Part 4: 实现路线图

| 阶段 | 里程碑 | 说明 |
|------|--------|------|
| Phase 1 | 并发代码修复 | `00067` / `00068` / `00020` 分别并发处理 |
| Phase 2 | DatabaseView 状态核对 | 主线程核对 `00072` 是否已被代码事实覆盖 |
| Phase 3 | 集成验证 | `type-check`、`test`、必要 smoke |
| Phase 4 | 治理收口 | issue resolve、artifact、verification、plan complete |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 问题编排、`00072` 状态同步、治理收口 | 0.5 天 |
| FE | `00067` ARIA 修复 | 0.5 天 |
| FE | `00068` contrast 修复 | 0.5 天 |
| FE | `00020` slot forwarding 修复 | 0.5 天 |
| QA | 回归验证 | 0.5 天 |

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| DataTable 结构改动引起现有样式抖动 | Medium | row/header 包裹层变化可能影响布局 | 用最小 DOM 变更并跑现有测试 |
| 对比度修复改变视觉习惯 | Low | 默认色会略深 | 仅调整前景/边框 token，保留原有语义色方向 |
| slot forwarding 与内部 `FieldCell` 冲突 | Medium | 可能出现消费侧插槽与默认渲染的优先级争议 | 明确“外部 slot 优先，内部默认兜底” |
| `00072` 与代码事实判断不一致 | Low | issue 可能部分落后 | 先核对代码与测试证据，再决定 resolve |

## Part 7: 验收标准

1. DataTable grid 结构合法
   ```bash
   cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n 'role="grid"|role="row"|role="columnheader"|role="gridcell"' src/components/table
   ```
2. 默认样式通过基础回归
   ```bash
   cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm test
   ```
3. cell slot forwarding 已存在
   ```bash
   cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n '<slot name="cell"' src/components/table/DataTable.vue src/components/table/TableDataRow.vue
   ```
4. DatabaseView 入口、文档、测试已存在
   ```bash
   cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n 'DatabaseView|useDatabaseView' src/components/database src/composables src/tests README.md docs/CHANGELOG-v0.5.0.md
   ```

## Part 8: 回滚方案

1. 若 ARIA 结构修复造成布局回归，回滚到上一个稳定 DOM 结构并保留最小语义修复。
2. 若对比度修复影响过大，仅保留文本 token 变更，背景色延后处理。
3. 若 slot forwarding 导致内部渲染冲突，优先保证外部 slot 覆盖能力，内部默认作为 fallback。

## Part 9: 架构决策记录

1. `DataTable` 继续保留 `grid` 语义，而不是退回纯装饰性 div。
原因：组件已有键盘导航、选择和单元格交互，语义上更接近 grid。
2. 外部 `#cell` slot 优先于内部 `FieldCell`。
原因：组件库扩展性应由消费侧显式覆盖默认渲染。
3. `ONEUI-FE-00072` 优先按代码事实收口。
原因：避免继续维持“代码已做完、issue 仍 open”的治理失真。

## Part 10: 参考和附录

- `src/components/table/DataTable.vue`
- `src/components/table/TableHeaderRow.vue`
- `src/components/table/TableDataRow.vue`
- `src/components/breadcrumb/Breadcrumb.vue`
- `src/components/base/Badge.vue`
- `src/styles/variables.css`
- `src/components/database/DatabaseView.vue`
- `src/composables/useDatabaseView.ts`
