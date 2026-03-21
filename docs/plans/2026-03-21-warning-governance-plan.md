---
生成时间: 2026-03-21 12:55:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI eslint warning 治理与 useVirtualList 测试噪音修复建立执行与回溯依据
生成模型: GPT-5 Codex
---

# OneUI Warning Governance 计划

## Part 1: 执行摘要

当前 OneUI 的功能缺陷与发布缺陷已经收口，但仓库仍有高量级静态质量噪音：`pnpm lint` 仍有 `336` 条 warning，另有 `useVirtualList` 相关测试噪音。目标是把 warning 治理从“零散修补”变成一条正式主线，先收掉最密集、最影响后续维护的规则簇，再继续推进后续瘦身与质量治理。

## Part 2: 需求分析

| 问题 | 当前数量 | 目标 |
|------|----------|------|
| `vue/require-default-prop` | 81 | 收掉高频组件中的默认值缺失 |
| `vue/attributes-order` | 41 | 收掉高频组件中的模板属性顺序噪音 |
| `@typescript-eslint/no-explicit-any` | 36 | 收掉明显可替换的 `any` |
| `vue/define-macros-order` | 35 | 收掉 `<script setup>` 宏顺序噪音 |
| a11y 交互/label 类 warning | 125+ | 优先收表格与高频交互组件 |
| `useVirtualList` Vue warning | 1 条测试簇 | 改为 scope-safe，不再污染测试输出 |

## Part 3: 详细方案

1. 先修 `useVirtualList` 的生命周期绑定，让 composable 在测试环境下不再调用非法 `onUnmounted`。
2. 按写入边界拆 3 组并行治理：
   - 表格与交互组件：`DataTable`、`TableHeaderRow`、`TableGroupRow`、`MobileListView`
   - 基础/字段组件：`base/*`、`breadcrumb/*`、`field/*`
   - TS/composables：`composables/*`、`utils/*` 中的 `any`
3. 每轮并发后做整库 `type-check / lint / test / build`。
4. 不追求一轮清零全部 warning，先打掉最大头和高频噪音，再决定是否继续下一轮。

## Part 4: 实现路线图

| 阶段 | 里程碑 | 说明 |
|------|--------|------|
| Phase 1 | 修掉 `useVirtualList` 测试噪音 | 确保测试信号干净 |
| Phase 2 | 并发表格/基础/TS 三组 warning 治理 | 减少 warning 总量 |
| Phase 3 | 跑整库验证并记录 warning 降幅 | 形成可量化结果 |
| Phase 4 | 决定下一轮 warning 收敛范围 | 继续压剩余噪音 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 规则聚类、任务编排、验证收口 | 0.5 天 |
| FE | 表格组件 warning 治理 | 0.5 天 |
| FE | 基础/字段组件 warning 治理 | 0.5 天 |
| FE | TS/composables warning 治理 | 0.5 天 |
| QA | 整库验证 | 0.5 天 |

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| warning 治理引起行为回归 | Medium | 某些 a11y 修正会改变 DOM/交互 | 每组改动后跑整库验证 |
| 大面积改默认值导致 API 行为变化 | Medium | `require-default-prop` 修复可能改变 props 行为 | 只在可安全默认化的组件先处理 |
| 规则量太大导致一轮无法清零 | Low | warning 总量较大 | 先打高频簇，不承诺一轮清零 |

## Part 7: 验收标准

1. `useVirtualList` 测试不再输出生命周期 warning
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm test -- src/tests/useVirtualList.integration.spec.ts'
   ```
2. 整库 `type-check` 通过
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm type-check'
   ```
3. 整库 `lint` 通过且 warning 总量下降
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm lint'
   ```
4. 整库 `test` 与 `build` 通过
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm test && pnpm build'
   ```

## Part 8: 回滚方案

1. 若 warning 治理引入行为回归，按任务边界回滚对应文件组。
2. 若默认值修复引发对外 API 变化，保留局部 warning，不强行消灭。

## Part 9: 架构决策记录

1. warning 治理按规则簇与文件边界推进，而不是全仓一把梭。
2. 优先修测试噪音和高频 warning，再处理低频样式噪音。

## Part 10: 参考和附录

- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/useVirtualList.integration.spec.ts`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/base/InfoCard.vue`
