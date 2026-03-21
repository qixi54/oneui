---
生成时间: 2026-03-21 12:03:37
参考文档: docs/plans/2026-03-21-oneui-packaging-slimming-hotfix-plan.md
角色定义: ARCH（架构师）
文档生成目的: 记录 ONEUI-FE-00086 的 packaging hotfix 验证矩阵、consumer smoke 结果与 0.5.3 发布确认
生成模型: GPT-5 Codex
---

# OneUI Packaging Slimming Hotfix Verification

## 结论

`ONEUI-FE-00086` 已在 `@oneflowui/ui@0.5.3` 中完成修复闭环。`Dashboard` consumer 的 `echarts` 已从首包拆成异步 chunk；`DataTable` consumer 路径未误入 `echarts`；Vite `5.4.21` 与 `8.0.1` 外部 tarball smoke 均通过。

## 代码修复锚点

1. `src/components/Dashboard/index.vue`
2. `src/utils/icon.ts`
3. `src/vite-env.d.ts`
4. `docs/CHANGELOG-v0.5.0.md`

## 验证结果

| 项 | 结果 |
|---|---|
| `pnpm type-check` | pass |
| `pnpm build` | pass |
| `pnpm test` | pass（44/44） |
| `npm publish --dry-run --registry=https://registry.npmjs.org` | pass |
| `npm pack` | pass |
| consumer smoke: Vite `5.4.21` / `DataTable` | pass |
| consumer smoke: Vite `5.4.21` / `Dashboard` | pass，`echarts` 独立 chunk |
| consumer smoke: Vite `8.0.1` / `DataTable` | pass |
| consumer smoke: Vite `8.0.1` / `Dashboard` | pass，`echarts` 独立 chunk |
| `npm publish --registry=https://registry.npmjs.org` | pass |
| `npm view @oneflowui/ui@0.5.3 version --registry=https://registry.npmjs.org` | `0.5.3` |

## 外部 smoke 摘要

### Vite 5.4.21

| 引入方式 | 结果 |
|---|---|
| `DataTable` | 主 chunk `255.67 kB`，未命中 `echarts` |
| `Dashboard` | 主 chunk `67.34 kB`，`echarts` 独立 `273.61 kB` |

### Vite 8.0.1

| 引入方式 | 结果 |
|---|---|
| `DataTable` | 主 chunk `62.37 kB`，辅助 chunk `_plugin-vue_export-helper 68.60 kB`，未命中 `echarts` |
| `Dashboard` | 主 chunk `65.74 kB`，`echarts` 独立 `273.97 kB` |

## 发布证据

1. 本地 tarball：`oneflowui-ui-0.5.3.tgz`
2. changelog：`docs/CHANGELOG-v0.5.0.md`
3. npm 主站版本确认：`0.5.3`

## 备注

1. `npm view @oneflowui/ui version` 存在短暂 query lag，使用 `npm view @oneflowui/ui@0.5.3 version` 进行版本存在性确认。
2. `pnpm test` 仍有仓库既有 `useVirtualList` Vue warning，不影响本次 hotfix 结论。
