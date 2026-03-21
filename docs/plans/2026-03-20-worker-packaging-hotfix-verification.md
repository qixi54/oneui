---
生成时间: 2026-03-20 19:25:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-20-worker-packaging-hotfix-plan.md
角色定义: ARCH（架构师）
文档生成目的: 记录 ONEUI-FE-00084 热修复的验证矩阵、consumer 结果与 0.5.1 发布确认，作为治理型 hotfix plan 的 closeout evidence
生成模型: GPT-5 Codex
---

# Worker Packaging Hotfix Verification

## 结论

`ONEUI-FE-00084` 已在 `@oneflowui/ui@0.5.1` 中完成热修复，当前 npm 主站可查询到 `0.5.1`，consumer 在 Vite `5.4.21` 与 Vite `8.0.1` 宿主中均可完成构建。

## 代码修复锚点

1. `src/composables/useWorkerSort.ts`
2. `src/workers/tableWorkerSource.js`
3. `src/vite-env.d.ts`

## 验证结果

| 项 | 结果 |
|---|---|
| `pnpm type-check` | pass |
| `pnpm build` | pass |
| focused tests | pass |
| `npm publish --dry-run --registry=https://registry.npmjs.org` | pass |
| `npm pack` | pass |
| dist 问题模式扫描 | no hit |
| consumer smoke: Vite `5.4.21` | pass |
| consumer smoke: Vite `8.0.1` | pass |
| `npm publish --registry=https://registry.npmjs.org` | pass |
| `npm view @oneflowui/ui version --registry=https://registry.npmjs.org` | `0.5.1` |

## 发布证据

1. 本地 tarball：`oneflowui-ui-0.5.1.tgz`
2. changelog：`docs/CHANGELOG-v0.5.0.md`
3. release checklist：`docs/PACKAGE-RELEASE-CHECKLIST.md`
4. npm 主站版本确认：`0.5.1`

## 备注

1. 这次问题属于包级缺陷，不要求 consumer 升级到最新 Vite 才能规避。
2. 后续凡是触达 worker / assets / dynamic import / import.meta.url 的改动，必须复用本次双 Vite consumer smoke 基线。
