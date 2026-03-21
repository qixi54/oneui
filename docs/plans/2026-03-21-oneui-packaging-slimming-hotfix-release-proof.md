---
生成时间: 2026-03-21 12:03:37
参考文档: docs/plans/2026-03-21-oneui-packaging-slimming-hotfix-verification.md
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI packaging hotfix 的 npm 发布事实与版本确认，供 FlowAPI hotfix closeout 使用
生成模型: GPT-5 Codex
---

# OneUI Packaging Slimming Hotfix Release Proof

## 发布事实

1. 包名：`@oneflowui/ui`
2. 发布版本：`0.5.3`
3. 发布目标：`https://registry.npmjs.org`
4. 发布命令：`npm publish --registry=https://registry.npmjs.org`
5. 发布结果：成功

## 查询确认

1. `npm view @oneflowui/ui@0.5.3 version --registry=https://registry.npmjs.org`
   - 返回：`0.5.3`
2. `npm view @oneflowui/ui versions --json --registry=https://registry.npmjs.org`
   - 包含：`0.5.3`

## 关联证据

1. issue：`ONEUI-FE-00086`
2. plan 文档：`docs/plans/2026-03-21-oneui-packaging-slimming-hotfix-plan.md`
3. verification：`docs/plans/2026-03-21-oneui-packaging-slimming-hotfix-verification.md`
4. changelog：`docs/CHANGELOG-v0.5.0.md`
