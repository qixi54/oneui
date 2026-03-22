---
生成时间: 2026-03-22 17:10:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-22-release-0.8.5-proof.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.5 的包入口治理、主题入口拆分与外部消费验证
生成模型: GPT-5 Codex
---

# OneUI v0.8.5 — Package Entrypoints & Smoke Coverage

## 版本概述

`0.8.5` 不是视觉层改版，而是一次面向长期演进的包边界治理版本。重点是让 OneUI 从“根入口可用”升级为“入口契约明确、主题注入可解耦、外部消费可验证”的状态。

## 变更清单

1. `package.json`
   - 新增稳定子路径导出：
     - `@oneflowui/ui/composables`
     - `@oneflowui/ui/types`
     - `@oneflowui/ui/theme`
   - 收紧 `sideEffects`，显式保留嵌套 CSS 与 `theme.js` / `plugin.js`。

2. `vite.config.ts`
   - 新增 `composables` 与 `theme` 构建入口，保证构建产物与导出契约对齐。

3. `src/theme.ts`
   - 提供主题 side-effect 入口，统一注入：
     - `variables.css`
     - `neutral.css`
     - `ops-console.css`
     - `markdown.css`

4. `src/tests/package-entrypoints.integration.spec.ts`
   - 校验 `package.json`、`vite.config.ts`、`src/theme.ts` 与 README 文档的一致性。

5. `src/tests/package-exports.integration.spec.ts`
   - 校验 `exports` 与 `sideEffects` 关键项，避免入口漂移。

6. `scripts/consumer-smoke-entrypoints.sh`
   - 新增外部 consumer smoke 脚本，用双宿主矩阵验证根入口、子路径导出与主题入口。

7. `src/dev/DatabaseViewDemo.vue`
   - 将页面级 database demo 从 `App.vue` 中独立出来，进一步降低 dev shell 膨胀。

8. `README.md`, `README.en.md`, `docs/ONEUI-INDEX.md`
   - 补充子路径导入和 `@oneflowui/ui/theme` 的接入说明。

## 发布范围与质量

1. 版本号：`package.json` / `package-lock.json` 更新为 `0.8.5`。
2. 基础门禁：`npm run type-check`、`npm run test`、`npm run lint`、`npm run lint:style`、`npm run build`。
3. 包装与预发布：`npm pack` + `npm publish --dry-run`。
4. 外部消费验证：Vite `5.4.21` 与 `8.0.1`，均使用本地 tarball 作为依赖完成 build。
5. 当前发布状态：已在 `registry.npmjs.org` 真实发布，`npm view @oneflowui/ui@0.8.5` 返回 `0.8.5`。

## 证据索引

1. 发布 proof：[`docs/plans/2026-03-22-release-0.8.5-proof.md`](docs/plans/2026-03-22-release-0.8.5-proof.md)
2. 验收结果：[`docs/plans/2026-03-22-release-0.8.5-verification.md`](docs/plans/2026-03-22-release-0.8.5-verification.md)
3. 版本证据索引：[`docs/plans/2026-03-22-release-0.8.5-evidence-index.md`](docs/plans/2026-03-22-release-0.8.5-evidence-index.md)
4. 子路径入口治理验证：[`docs/plans/2026-03-22-oneui-package-entrypoints-verification.md`](docs/plans/2026-03-22-oneui-package-entrypoints-verification.md)
