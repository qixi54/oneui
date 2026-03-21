---
生成时间: 2026-03-22 00:42:00
参考文档: docs/plans/2026-03-22-release-0.8.1-proof.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.1 贴补与交付收口
生成模型: GPT-5 Codex
---

# OneUI v0.8.1 — Release Follow-up

## 版本概述

`0.8.1` 作为 `0.8.0` 发布闭环的补齐版本，主要目标是完成发布链路的最终可追溯性与消费侧双宿主复验：

1. 完成 `@oneflowui/ui` 的实际发布动作（已成功发布到 npm）。
2. 修正并完成 Vite 8.0.1 外部 consumer 路径问题，确保 tarball 在双宿主均可构建通过。
3. 补齐发布留痕材料，与计划/验证文档形成可追溯闭环。

## 关键交付

1. 发布与消费侧验收
   - `npm publish --access public --registry=https://registry.npmjs.org`
   - Vite `5.4.21`/`8.0.1` 外部 consumer build smoke
2. 留痕补齐
   - `docs/plans/2026-03-22-release-0.8.1-proof.md`
   - closeout 证据文件位于 `/tmp/closeout-evidence-2026-03-22-0.8.1/`
3. 仓库基础质量门禁
   - `type-check` / `test` / `build` / `lint` / `lint:style` 全部通过

## 说明

本次版本不涉及功能回归修复，仅用于补齐发布质量闭环与证据链完整性。如需继续进入下一迭代的交互增强（如 Drawer/行内编辑密集场景）请基于新计划单独起一个版本发布。
