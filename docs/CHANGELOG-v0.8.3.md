---
生成时间: 2026-03-22 19:00:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-23-ops-console-unification-plan.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-23-ops-console-unification-verification.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.3 的 Ops Console 视觉统一与命令中枢改造
生成模型: GPT-5 Codex
---

# OneUI v0.8.3 — Ops Console Consolidation

## 版本概述

`0.8.3` 聚焦在中控台演示页可视化与高频操作入口收口，保持 API 与运行时行为兼容。目标是通过 `App.vue` 命令中枢与 `ops-shell` 主题变量化，提升演示交互连贯性，同时为后续交互增强保留扩展结构。

## 变更清单

1. `src/dev/App.vue`
   - 新增 `OpsCommand` 模型与 `commandDeck`（4 个默认命令入口）。
   - 新增 `commandShortcuts` 与键盘分发逻辑（`⌘N`、`⌘L`、`⌘,`、`⌘D`）。
   - 新增 `ops-command-panel` 区块和对应样式（`ops-command-chip*`、`ops-main-shell`、`ops-command-panel__*`）。
   - 使用现有 toast API 串联命令动作反馈。
2. `src/styles/variables.css`
   - 新增 `--of-color-surface-2` / `--of-surface-hover` / `--of-shell-*` / `--of-shell-ops-accent*` 变量。
3. `src/styles/themes/neutral.css`
   - 增补中性主题 `ops-shell` 相关 token。
4. `src/styles/themes/ops-console.css`
   - 增补 ops-console 主题 `--of-shell-*` 与 `--of-color-surface-2` / `--of-surface-hover`。
5. `src/tests/ops-command-registry.integration.spec.ts`
   - 为命令注册与动作链路补充回归测试（command 创建、快捷入口、仪表盘动作、关闭动作）。

## 发布范围

1. 版本号：`package.json` 与 `package-lock.json` 提升为 `0.8.3`。
2. 对外说明：补充 `docs/CHANGELOG-v0.8.3.md` 与 release proof。
3. 质量闭环：基于 `docs/plans/2026-03-23-release-0.8.3-verification.md` 与 `docs/plans/2026-03-23-release-0.8.3-proof.md`。
4. 发行状态：主站 npm 已发布 `@oneflowui/ui@0.8.3`，并通过 Vite 5 与 Vite latest 的双宿主 smoke。
