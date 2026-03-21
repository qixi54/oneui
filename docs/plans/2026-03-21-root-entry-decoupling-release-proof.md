---
生成时间: 2026-03-21 12:56:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-root-entry-decoupling-verification.md
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI 0.5.4 root/plugin 解耦修复的发布证据
生成模型: GPT-5 Codex
---

# OneUI 0.5.4 发布证据

## 发布信息

- 包名：`@oneflowui/ui`
- 版本：`0.5.4`
- 发布目标：`https://registry.npmjs.org`

## 发布前门禁

1. `pnpm type-check` 通过
2. `pnpm test` 通过
3. `pnpm build` 通过
4. `pnpm lint:style` 通过
5. `npm publish --dry-run --registry=https://registry.npmjs.org` 通过
6. tarball 外部 consumer smoke 通过

## 发布结果

执行 `npm publish --registry=https://registry.npmjs.org` 后，registry 返回：

```text
+ @oneflowui/ui@0.5.4
```

后续查询确认当前线上版本为：

```text
0.5.4
```

## 关联资料

1. `docs/CHANGELOG-v0.5.0.md`
2. `docs/PACKAGE-RELEASE-CHECKLIST.md`
3. `oneflowui-ui-0.5.4.tgz`
4. `docs/plans/2026-03-21-root-entry-decoupling-plan.md`
5. `docs/plans/2026-03-21-root-entry-decoupling-verification.md`
