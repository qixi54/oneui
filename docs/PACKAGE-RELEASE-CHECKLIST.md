---
生成时间: 2026-03-20 18:20:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/package.json, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md, issue:ONEUI-FE-00084
角色定义: ARCH（架构师）
文档生成目的: 固化 OneUI npm 包发版前检查规则，避免 worker/assets/import-meta-url 等消费侧构建回归再次漏发
生成模型: GPT-5 Codex
---

# OneUI Package Release Checklist

## 适用范围

适用于 `@oneflowui/ui` 的所有 npm 发版，包括 feature release、hotfix release、回归修复版。

## 必跑检查

### 1. 仓库内基础门禁

```bash
pnpm type-check
pnpm test
pnpm build
pnpm lint:style
pnpm lint
```

说明：

1. `lint` 允许 warning，但不允许 error
2. 若本次改动涉及打包、worker、dynamic import、styles 路径，不能只停在这一步

### 2. 发包前产物检查

```bash
npm publish --dry-run --registry=https://registry.npmjs.org
npm pack
```

必须确认：

1. tarball 可生成
2. 入口、样式和 d.ts 都在 tarball 内
3. 没有异常绝对路径或宿主依赖路径写进发布产物

### 3. 产物内容扫描

至少执行一次：

```bash
rg -n "/assets/|new Worker\\(new URL\\(|import.meta.url" dist
```

判定规则：

1. 若改动涉及 worker，不能出现宿主敏感的绝对 `/assets/...` worker 路径
2. 若出现 `new Worker(new URL(..., import.meta.url))`，必须确认它不会在库模式下被打成绝对资产路径

### 4. Consumer build smoke

必须使用 `npm pack` 生成的本地 tarball，在外部最小 consumer 中验证，而不是只在仓库内验证。

最低矩阵：

1. Vite `5.4.x`
2. 当前 npm 最新稳定 Vite

最小 smoke 规则：

1. 新建空白 Vue + Vite 工程
2. 安装本地 tarball
3. 至少引入一个会触发相关打包路径的组件或 composable
4. 运行 `vite build`

若改动涉及打包瘦身、dynamic import、编辑器、markdown、图标、图表等可选重依赖，还必须额外确认：

1. 基础使用场景的主 chunk 没有继续吸入无关重依赖
2. 重依赖已经落到独立 async chunk，而不是基础首包
3. 至少记录一组 `修复前 / 修复后` 的 chunk 对比证据

若改动涉及 `exports`、入口拆分、plugin 子路径、根入口 barrel 调整，还必须额外确认：

1. 根入口 named import smoke 通过
2. 新增子入口 smoke 通过
3. tarball 中确实包含对应入口文件
4. README / README.en 的导入示例已经同步

### 5. Registry 检查

发布前必须确认当前机器的 registry 和 token 对应的是同一个站点：

```bash
npm whoami --registry=https://registry.npmjs.org
```

若默认 registry 指向镜像站，不得直接裸跑 `npm publish`。

## 发版结论模板

只有同时满足以下条件，才允许发版：

1. 仓库内基础门禁通过
2. `npm publish --dry-run` 通过
3. `npm pack` 通过
4. consumer build smoke 通过
5. changelog 已同步到当前真实状态

## 本文档对应回归样例

`ONEUI-FE-00084`

该问题证明：

1. 仓库内 `build` 通过，不代表 npm 包可被 consumer 正常消费
2. worker / assets / import-meta-url 相关问题，必须用 tarball + 外部 host 验证
