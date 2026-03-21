---
生成时间: 2026-03-21 14:55:00
参考文档: docs/CHANGELOG-v0.5.0.md
角色定义: ARCH
文档生成目的: 为 OneUI 下一轮包边界、chunk 体积与发布治理建立可执行计划
生成模型: GPT-5 Codex
---

# OneUI Package Boundary Governance Plan

## Part 1: 执行摘要

`0.5.8` 已经完成 Database UX 对齐并发布，但发布侧仍暴露出下一轮治理目标：`npm pack` 产物体积仍偏大，`Vite 8` plugin consumer smoke 出现 chunk size warning，当前包边界、入口分层和重依赖加载策略仍有继续收紧空间。本轮治理目标不是修页面交互，而是继续提升 OneUI 的发布质量和 consumer 体验。

## Part 2: 需求分析

当前治理聚焦三件事：

1. 收紧根入口、插件入口与重依赖之间的耦合，降低轻量 consumer 的非必要首包体积。
2. 明确并治理 `Vite 8` plugin smoke 的大 chunk 触发点，避免后续再次出现“能构建但质量偏差”的发布回归。
3. 补齐 `0.5.8` 这一轮 release 的回溯材料，让 release、task、verification 与后续治理 plan 形成连续链路。

## Part 3: 详细方案

1. 审计 [`src/index.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts)、[`src/plugin.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts)、[`vite.config.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/vite.config.ts) 和 `dist` 产物，确认根入口、插件入口和动态依赖的耦合点。
2. 调整入口导出与延迟加载策略，优先把重依赖链路压回按需路径，避免 plugin/root 入口把不需要的模块带入首包。
3. 继续用 tarball 外部 consumer smoke 验证 `Vite 5.x + 当前最新稳定 Vite` 两条 host 矩阵，并把体积/警告结果落到验证文档。
4. 对 `0.5.8` release 的本地文档和 FlowAPI 留痕做补齐，避免版本、changelog、plan、verification 之间出现断档。

## Part 4: 实现路线图

Phase 1：冻结治理范围与 `0.5.8` 留痕缺口。  
Phase 2：实现入口和重依赖的包边界收紧。  
Phase 3：执行 host matrix、tarball、skill review 与 release 级验证。  
Phase 4：补 release closeout 证据并完成 plan 收口。

## Part 5: 工作量估计

- ARCH：0.5 天
- FE：1 天
- QA：0.5 天

## Part 6: 风险评估

1. [`src/plugin.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts) 若为方便全量注册而继续静态拉入重依赖，consumer 首包体积会持续偏大。
2. [`vite.config.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/vite.config.ts) 和发布产物若没有与入口策略同步，源码优化可能无法在 tarball 中真正体现。
3. 若 `0.5.8` 发布回溯材料不补齐，后续再做 `0.5.9` 或 `0.6.0` 时会出现 release 证据链断裂。

## Part 7: 验收标准

1. `Vite 8` plugin consumer smoke 不再出现当前的 chunk size warning，或者验证文档中给出明确、可接受且已知的剩余原因。
2. `npm publish --dry-run`、`npm pack`、`Vite 5.x` consumer smoke、`当前最新稳定 Vite` consumer smoke 全部通过。
3. `0.5.8` 的本地 release/verification/closeout 文档和 FlowAPI 留痕补齐。

## Part 8: 回滚方案

若入口收紧引起 plugin 或 root import 回归，则保留当前入口契约，先退回只补文档与验证证据的治理范围，不在未通过 consumer smoke 的前提下继续发版。

## Part 9: 架构决策记录

1. 发布治理优先以 consumer 侧结果为准，而不是只看库内 `build` 是否通过。
2. 根入口与 plugin 入口必须继续区分职责，不回退到单入口承载所有消费模式。
3. 版本发布和治理留痕必须一起推进，不能先发包、后补证据。

## Part 10: 参考和附录

- [`docs/CHANGELOG-v0.5.0.md`](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md)
- [`package.json`](/opt/Oneflow/flowlab/项目/oneui/code/develop/package.json)
- [`src/index.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts)
- [`src/plugin.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts)
- [`vite.config.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/vite.config.ts)
