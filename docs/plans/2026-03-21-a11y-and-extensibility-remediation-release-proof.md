---
生成时间: 2026-03-21 12:52:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-a11y-and-extensibility-remediation-verification.md
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI 0.5.6 发版与治理收口证据
生成模型: GPT-5 Codex
---

# OneUI 0.5.6 发布证据

## 发布信息

- 包名：`@oneflowui/ui`
- 版本：`0.5.6`
- 发布目标：`https://registry.npmjs.org`

## 发布前门禁

1. `pnpm type-check` 通过
2. `pnpm test` 通过
3. `pnpm build` 通过
4. `pnpm lint` 无 error
5. `npm publish --dry-run --registry=https://registry.npmjs.org` 通过
6. `npm pack` 通过
7. tarball 外部 consumer smoke 通过

## 发布结果

执行 `npm publish --registry=https://registry.npmjs.org` 后，registry 返回：

```text
+ @oneflowui/ui@0.5.6
```

随后查询确认线上版本为：

```text
0.5.6
```

## 关联 issue

1. `ONEUI-FE-00067`
2. `ONEUI-FE-00068`
3. `ONEUI-ARCH-00020`
4. `ONEUI-FE-00072`

## 关联资料

1. `docs/CHANGELOG-v0.5.0.md`
2. `docs/plans/2026-03-21-a11y-and-extensibility-remediation-plan.md`
3. `docs/plans/2026-03-21-a11y-and-extensibility-remediation-verification.md`
4. `oneflowui-ui-0.5.6.tgz`
