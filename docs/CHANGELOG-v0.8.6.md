---
生成时间: 2026-03-22 17:57:53
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-22-release-0.8.6-proof.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.6 的 scene/preset demo 收口、examples 结构治理与 metadata registry 演进
生成模型: GPT-5 Codex
---

# OneUI v0.8.6 — Examples Structure & Metadata Registry

## 版本概述

`0.8.6` 不是新增一批组件，而是把前几轮已经落下来的 dev/examples 能力正式收口成可维护结构。重点是三件事：scene/preset demo 成体系、examples 按领域分组、App shell 改为 metadata registry 驱动。

## 变更清单

1. `src/components/common/ThemeScopeScene.vue`
   - 正式保留为公共场景壳层组件，继续基于 `ThemeScope` 提供局部主题 + 标题 + 说明 + meta/footer 插槽能力。

2. `src/dev/examples/theme/ThemeScopeDemo.vue`
   - 收口为 ThemeScope / ThemeScopeScene 的轻量参考实现。

3. `src/dev/examples/database/DatabaseEnterpriseDemo.vue`
   - 保留为更完整的企业级组合示例，展示 `ThemeScopeScene + DatabaseView + middleware presets`。

4. `src/dev/examples/database/DatabasePresetDemo.vue`
   - 保留为 `createDatabaseViewPresetBundle` / `actions.middleware` 的官方短路径示例。

5. `src/dev/examples/database/DatabaseViewDemo.vue`
   - 作为页面级 database 工作区容器，承接 enterprise demo 与 preset demo。

6. `src/dev/examples/registry.ts`
   - 新增 dev example metadata registry。
   - 每个示例具备 `group`、`order`、`title`、`summary`、`section`、`when` 与 `props`。

7. `src/dev/App.vue`
   - 不再直接硬编码示例组件。
   - 改为按 registry 结果渲染 shell/section 级示例。

8. `README.md`, `README.en.md`, `docs/ONEUI-INDEX.md`
   - 同步更新 examples 路径、scene/preset demo 说明与当前 release 证据索引。

## 发布范围与质量

1. 版本号：`package.json` / `package-lock.json` 更新为 `0.8.6`。
2. 基础门禁：`npm run type-check`、`npm run test`、`npm run lint`、`npm run lint:style`、`npm run build`。
3. 包装与预发布：`npm pack` + `npm publish --dry-run`。
4. 外部消费验证：Vite `5.4.21` 与 `8.0.1`，均使用本地 tarball 完成 build smoke。
5. 当前发布状态：以 `docs/plans/2026-03-22-release-0.8.6-proof.md` 为准。

## 证据索引

1. 发布 proof：[`docs/plans/2026-03-22-release-0.8.6-proof.md`](docs/plans/2026-03-22-release-0.8.6-proof.md)
2. 验收结果：[`docs/plans/2026-03-22-release-0.8.6-verification.md`](docs/plans/2026-03-22-release-0.8.6-verification.md)
3. 版本证据索引：[`docs/plans/2026-03-22-release-0.8.6-evidence-index.md`](docs/plans/2026-03-22-release-0.8.6-evidence-index.md)
4. examples 收口验证：[`docs/plans/2026-03-22-oneui-scene-preset-demo-verification.md`](docs/plans/2026-03-22-oneui-scene-preset-demo-verification.md)
