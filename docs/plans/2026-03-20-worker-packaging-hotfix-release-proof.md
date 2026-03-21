---
生成时间: 2026-03-20 19:27:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-20-worker-packaging-hotfix-verification.md
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI worker packaging hotfix plan 提供结构化 release evidence，记录 0.5.1 已发布到 npm 主站
生成模型: GPT-5 Codex
---

# Release Proof

## 包信息

1. package: `@oneflowui/ui`
2. version: `0.5.1`
3. registry: `https://registry.npmjs.org`

## 结果

1. `npm publish --registry=https://registry.npmjs.org` 已成功执行
2. `npm view @oneflowui/ui version --registry=https://registry.npmjs.org` 已返回 `0.5.1`

## 关联证据

1. `docs/plans/2026-03-20-worker-packaging-hotfix-verification.md`
2. `docs/CHANGELOG-v0.5.0.md`
3. `docs/PACKAGE-RELEASE-CHECKLIST.md`
