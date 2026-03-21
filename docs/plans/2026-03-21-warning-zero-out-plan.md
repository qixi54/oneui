---
生成时间: 2026-03-21 13:09:30
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-warning-governance-verification.md
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI 剩余 lint warning 清零建立执行与回溯依据
生成模型: GPT-5 Codex
---

# OneUI Warning Zero-Out 计划

## Part 1: 执行摘要

上一轮 warning 治理已把 `pnpm lint` warning 从 `336` 压到 `86`，主干也已经恢复到 `type-check / focused tests / build` 全绿。当前目标不再是“大幅降噪”，而是把剩余 warning 收敛到 `0`，让 OneUI 的静态质量信号彻底干净。

## Part 2: 需求分析

当前剩余 warning 已经聚类清楚：

| 类别 | 数量 | 主要范围 |
|------|------|----------|
| a11y | 48 | 表单 label、静态元素交互、键盘事件 |
| `vue/define-macros-order` | 15 | `base/layout/table` 中少量宏顺序 |
| `vue/attributes-order` / closing bracket | 8 | `field/tabs/table` |
| `@typescript-eslint/no-explicit-any` | 6 | `Dashboard/RichTextEditor/MermaidChart` |
| `vue/require-default-prop` | 6 | `editor/kanban/overlay` |
| 其他 | 3 | `v-html` 风险说明、无效 eslint-disable 等 |

## Part 3: 详细方案

1. 把剩余 warning 按性质拆成 3 组：
   - A 组：a11y 与表单标签治理
   - B 组：宏顺序、属性顺序、默认 prop 治理
   - C 组：显式 `any`、`v-html`、无效 eslint-disable 等尾项治理
2. 每组限定明确文件边界，避免交叉改动。
3. 在所有改动合并后，跑整库 `pnpm type-check`、`pnpm lint`、`pnpm test`、`pnpm build`。
4. 只有 `pnpm lint` warning 为 `0` 才视为本轮完成。

## Part 4: 实现路线图

| 阶段 | 里程碑 | 说明 |
|------|--------|------|
| Phase 1 | 聚类完成 | 已完成，剩余 warning 已分类 |
| Phase 2 | 三组并行清理 | 实现层面并发推进 |
| Phase 3 | 整库验证 | 必须拿到 lint=0 |
| Phase 4 | 写回 verification 与 plan closeout | 保证可追溯 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| FE | a11y 治理 | 0.5 天 |
| FE | 宏顺序/属性顺序/默认 prop 治理 | 0.5 天 |
| ARCH | 类型尾项与整体集成 | 0.5 天 |
| QA | 整库回归与清零确认 | 0.5 天 |

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| a11y 修复影响 DOM 行为 | Medium | button 化、label 绑定会影响交互节点 | 每轮都跑 focused test 与整库 type-check |
| 为清零而引入过度默认值 | Medium | `require-default-prop` 可能改变对外语义 | 仅补安全默认值或转为明确可选处理 |
| `v-html` 类规则存在 intentional 用法 | Low | markdown 渲染可能需要保留 | 只在有明确 sanitize 前提或局部 disable 说明时收口 |

## Part 7: 验收标准

1. 整库 `type-check` 通过
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm type-check'
   ```
2. 整库 `lint` warning 清零
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm lint --format json --output-file /tmp/oneui-eslint-zero.json'
   ```
3. 整库 `test` 通过
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm test'
   ```
4. 整库 `build` 通过
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm build'
   ```

## Part 8: 回滚方案

1. 若某一组清零动作引入回归，只回滚对应文件组，不回滚整轮 warning 治理成果。
2. 若 `v-html` 或 a11y 规则的清零需要改变既有设计，优先改成有注释的局部豁免，而不是破坏组件行为。

## Part 9: 架构决策记录

1. 这一轮不再按目录粗切，而是按 warning 性质切。
2. `lint = 0` 是强验收，不接受“显著下降但未清零”的 closeout。

## Part 10: 参考和附录

- `/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-warning-governance-verification.md`
- `/tmp/oneui-eslint-latest2.json`
