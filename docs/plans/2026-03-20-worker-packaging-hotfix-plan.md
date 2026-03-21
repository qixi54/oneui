---
生成时间: 2026-03-20 19:20:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/PACKAGE-RELEASE-CHECKLIST.md, issue:ONEUI-FE-00084
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI worker packaging 回归修复与 0.5.1 热修复发布补齐可回溯的治理计划、验证证据与发布闭环
生成模型: GPT-5 Codex
---

# OneUI Worker Packaging Hotfix Plan v1.0

## Part 1: 执行摘要

### 现状

`@oneflowui/ui@0.4.4` 与 `@oneflowui/ui@0.5.0` 在发布产物中把 `useWorkerSort` 的 worker 打成绝对 `/assets/tableWorker-*.js` 路径，导致部分 consumer 在 Vite 宿主中构建失败。源码锚点位于 `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useWorkerSort.ts:1`，发布前 smoke 与产物扫描规则锚点位于 `/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/PACKAGE-RELEASE-CHECKLIST.md:1`。

### 问题

当前热修复代码与 npm 发布已经完成，但治理层缺少一条独立的 hotfix plan 来承接 `issue -> 修复 -> 验证 -> 发版` 的完整证据链，后续回溯会断在 memo 和 changelog 上。

### 目标

补齐一条治理型 hotfix plan，明确记录 `ONEUI-FE-00084` 的根因、修复策略、consumer 验证矩阵、`0.5.1` 发布结果以及回滚口径。

### 范围

本计划只覆盖 worker packaging 回归的治理与收口，不重复承接页面级方案或其他未解决 issue。

### 预期成果

1. 形成独立的 hotfix plan 文档与 FlowAPI plan 实体
2. 绑定 `ONEUI-FE-00084`
3. 写回结构化 verification report
4. 将 `0.5.1` 发布和验证矩阵纳入同一条可查询证据链

### 资源时间

ARCH 主控，采用治理型 closeout 路径，预计 0.5 人日，缓冲 20%，总计 0.6 人日。

## Part 2: 需求分析

### 功能差异对比

| 项 | 当前已发生事实 | 需要补齐的治理动作 |
|---|---|---|
| 缺陷识别 | issue `ONEUI-FE-00084` 已创建 | 将 issue 与热修复 plan 建立稳定关联 |
| 代码修复 | `useWorkerSort` 已改为 Blob worker | 在 Plan 中明确根因与修复决策 |
| 包验证 | 仓库内门禁和 consumer smoke 已执行 | 写回结构化 verification report |
| npm 发布 | `@oneflowui/ui@0.5.1` 已发布 | 将 release evidence 收口到 Plan |
| 过程固化 | `PACKAGE-RELEASE-CHECKLIST` 与 `~/.codex/AGENTS.md` 已更新 | 以治理结论形式纳入 Plan closeout |

### 优先级

- P0: 建立 issue 到 hotfix 发布的治理证据链
- P0: 写回 verification report 并完成 Plan closeout
- P1: 将发布前 smoke 与产物扫描规则纳入长期基线

## Part 3: 详细方案

### 3.1 方案概述

采用治理型 Plan，而不是伪造回补 plan-bound task。原因是热修复代码、验证和发版已经通过 direct 执行完成，当前 FlowAPI 没有公开 owner path 将既有 direct 执行过程 retro-bind 到新 plan 上。

### 3.2 根因矩阵

| 层级 | 事实 | 结论 |
|---|---|---|
| 源码层 | `new Worker(new URL(\"../workers/tableWorker.ts\", import.meta.url), { type: \"module\" })` | 源码写法本身在库模式下存在被绝对化打包的风险 |
| 产物层 | dist 中出现 `/assets/tableWorker-*.js` | 发布产物对宿主路径敏感 |
| 宿主层 | Vite 5 / Vite 8 consumer 可复现构建失败 | 问题属于包级缺陷，不是 consumer 必须升级 |

### 3.3 修复策略

| 文件 | 动作 | 目的 |
|---|---|---|
| `src/composables/useWorkerSort.ts` | 改为 `Blob + URL.createObjectURL()` | 避免库模式产出绝对 worker 资源路径 |
| `src/workers/tableWorkerSource.js` | 新增内联 worker source | 将 worker runtime 变为包内可控资源 |
| `src/vite-env.d.ts` | 补 `vite/client` | 提供 `?raw` 导入类型声明 |
| `docs/PACKAGE-RELEASE-CHECKLIST.md` | 新增发版前消费侧 smoke 规则 | 防止同类回归再次漏发 |

### 3.4 验证矩阵

| 验证层级 | 命令 / 证据 | 判定 |
|---|---|---|
| 仓库内类型 | `pnpm type-check` | 必须通过 |
| 仓库内构建 | `pnpm build` | 必须通过 |
| focused tests | `pnpm test -- src/tests/database-view.integration.spec.ts src/tests/gantt.integration.spec.ts src/tests/table-detail.integration.spec.ts` | 必须通过 |
| 发包门禁 | `npm publish --dry-run --registry=https://registry.npmjs.org` | 必须通过 |
| tarball | `npm pack` | 必须生成 |
| dist 扫描 | `grep -RFn '/assets/' dist` 等 | 不得命中问题模式 |
| consumer smoke A | Vite `5.4.21` build | 必须通过 |
| consumer smoke B | Vite `8.0.1` build | 必须通过 |
| registry 确认 | `npm view @oneflowui/ui version --registry=https://registry.npmjs.org` | 必须返回 `0.5.1` |

### 3.5 伪代码

```text
issue ONEUI-FE-00084
  -> root-cause confirmation
  -> source fix to Blob worker
  -> internal verification
  -> tarball verification
  -> external consumer verification (Vite 5 / Vite 8)
  -> npm publish 0.5.1
  -> changelog + checklist update
  -> verification-report/upsert
  -> plan complete
```

### 3.6 决策记录

1. 不要求 consumer 升级到最新 Vite 才能规避问题，修复目标是让 `Vite 5.4.x` 与最新稳定 Vite 都可正常消费。
2. 不伪造 retro task 绑定；治理 Plan 采用 `artifact_verification_only` closeout。

## Part 4: 实现路线图

1. 写入治理型 hotfix plan 文档
2. 创建 Plan 并完成 review / approve / start
3. 写回 verification report 与 release evidence
4. 完成 Plan closeout

## Part 5: 工作量估计

| 角色 | 工作 | 估计 |
|---|---|---|
| ARCH | 文档、plan gate、verification、closeout | 0.5 天 |
| QA | 复用已完成验证证据，无新增执行 | 0 天 |

## Part 6: 风险评估

### High

1. 若不补治理 Plan，后续只能从 issue、memo、changelog 拼接事实，无法一跳回溯完整热修复链路。应对：本次即补 governance plan 并完成 closeout。

### Medium

1. npm registry 查询存在短暂 query lag。应对：publish success 以后再补一次 `npm view` 确认。
2. 未来若再次改动 worker / assets / import meta 相关逻辑，仓库内 build 仍有概率掩盖 consumer 风险。应对：固定执行外部 consumer smoke。

## Part 7: 验收标准

1. hotfix plan 已在 `oneui/main` 创建并完成 closeout
2. verification report 已写回，且 evidence 包含 issue、changelog、checklist、发布确认
3. `npm view @oneflowui/ui version --registry=https://registry.npmjs.org` 返回 `0.5.1`
4. `ONEUI-FE-00084` 可通过 plan + memo + changelog 三层追溯到修复和发版

## Part 8: 回滚方案

1. 若后续确认 `0.5.1` 仍存在宿主构建问题，立即创建新的 hotfix issue，不篡改本 Plan 的已验证结论。
2. 若 npm 发布元数据与本地验证不一致，以新 issue 和新 release plan 继续推进，不回写伪造成功状态。

## Part 9: 架构决策记录

### ADR-1

采用治理型 Plan 承接已完成的 direct 热修复，而不是回填伪造 task 关联。

### ADR-2

将“consumer tarball smoke + 双 Vite 矩阵”提升为发版基线，而不是临时经验。

## Part 10: 参考和附录

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useWorkerSort.ts:1`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/workers/tableWorkerSource.js:1`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/vite-env.d.ts:1`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md:1`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/PACKAGE-RELEASE-CHECKLIST.md:1`
6. `issue:ONEUI-FE-00084`
