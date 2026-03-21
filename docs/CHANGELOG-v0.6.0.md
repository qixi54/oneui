---
生成时间: 2026-03-21 16:50:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/package.json, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-neutral-theme-architecture-plan.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-neutral-theme-architecture-verification.md
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI v0.6.0 的主题中性化、可选皮肤分层、release 验证与发布范围
生成模型: GPT-5 Codex
---

# OneUI v0.6.0 — Neutral Theme Refactor

## 版本概述

`v0.6.0` 的目标不是继续叠加某个业务风格，而是把 OneUI 从“默认自带明显产品气质的组件集合”收敛成“默认中性的基础组件库 + 可选主题皮肤”。

本轮完成后：

1. OneUI 默认视觉回到中性语义 token 主路径。
2. `ops-console` 作为可选皮肤存在，不再写死进组件默认样式。
3. 高可见组件的主路径默认色、边界色、选中态、强调态进一步统一到语义层。
4. dev demo 默认跟随 neutral 主题，并支持显式切换 `ops-console`。

## 关键变更

### 1. 主题分层

新增并接入以下主题文件：

1. `src/styles/themes/neutral.css`
2. `src/styles/themes/ops-console.css`
3. `src/plugin.ts`

默认主题语义包括：

1. `surface`
2. `text`
3. `border`
4. `accent`
5. `chart series`

### 2. 高可见组件中性化收口

本轮重点覆盖以下范围：

1. `layout`
2. `dashboard`
3. `base`
4. `overlay`
5. `table`
6. `gallery`
7. `kanban`
8. `timeline`
9. `field`
10. `editor`
11. `ai`
12. `toast`
13. `database`
14. `breadcrumb`
15. `mermaid`
16. `split`

### 3. Demo 与文档

1. `src/dev/App.vue` 清理了直接产品色主路径，改为语义 token 驱动。
2. `README.md` / `README.en.md` 补了主题接入说明。
3. `docs/plans/2026-03-21-oneui-neutral-theme-architecture-verification.md` 固化了 final sweep 与验证结论。

## 验证

仓库内验证：

1. `npm run type-check`
2. `npm run test`
3. `npm run build`
4. `npm run lint`
5. `npm run lint:style`

发版验证：

1. `npm publish --dry-run --registry=https://registry.npmjs.org`
2. `npm pack`
3. `rg -n "/assets/|new Worker\\(new URL\\(|import.meta.url" dist`
4. tarball 外部 consumer smoke
   - Vite `5.4.21`
   - 当前 npm 最新稳定 Vite

## 溯源资料

1. [theme architecture plan](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-neutral-theme-architecture-plan.md)
2. [theme architecture verification](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-neutral-theme-architecture-verification.md)

## 结论

`0.6.0` 取代 `0.5.9` 作为当前推荐版本，用于对齐：

1. neutral default / ops-console skin 的主题分层
2. 组件默认视觉的中性化
3. FlowAPI 计划与验证留痕
4. npm release 准备链路
