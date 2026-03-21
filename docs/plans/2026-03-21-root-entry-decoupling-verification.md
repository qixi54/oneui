---
生成时间: 2026-03-21 12:55:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-root-entry-decoupling-plan.md
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI 0.5.4 root/plugin 解耦修复的结构化验证结果
生成模型: GPT-5 Codex
---

# OneUI 0.5.4 Root Entry / Plugin 解耦验证报告

## 验证结论

本次修复通过。根入口已不再重导出 plugin；`@oneflowui/ui/plugin` 已作为独立子入口稳定产出并可在外部 consumer 中构建通过。

## 验证范围

1. 根入口导出边界
2. `plugin` 子入口产物
3. tarball 内容洁净度
4. 仓库内构建与测试
5. 外部 consumer smoke
6. npm 发布前门禁

## 执行结果

| 检查项 | 命令 / 方式 | 结果 |
|--------|-------------|------|
| TypeScript 类型检查 | `pnpm type-check` | 通过 |
| 测试 | `pnpm test` | 通过，`44/44` |
| 构建 | `pnpm build` | 通过 |
| 样式检查 | `pnpm lint:style` | 通过 |
| 发布前 dry-run | `npm publish --dry-run --registry=https://registry.npmjs.org` | 通过 |
| 根入口轻量 smoke | Vite 5.4.21 consumer 导入 `Badge` | 通过 |
| plugin 子入口 smoke | Vite 8.0.1 consumer 导入 `@oneflowui/ui/plugin` | 通过 |
| tarball 产物检查 | `tar -tf oneflowui-ui-0.5.4.tgz` | 通过 |

## 关键证据

1. `dist/plugin.js` 已进入 tarball。
2. tarball 中不再包含 `dist/dev` 与 `dist/tests`。
3. Vite 5 root named import 构建通过，主包大小约 `62.28 kB`。
4. Vite 8 plugin 子入口构建通过。
5. `npm publish --dry-run` 成功，说明包契约与 registry 侧检查通过。

## 备注

1. `pnpm test` 仍会出现仓库既有的 `useVirtualList` Vue warning，但不阻塞本次修复结论。
2. 本次验证聚焦在入口边界与发布产物，不覆盖后续业务功能回归。
