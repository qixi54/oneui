---
生成时间: 2026-03-22 16:38:27
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/ONEUI-INDEX.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/README.en.md
角色定义: ARCH
文档生成目的: 为 ThemeScope + middleware composer + enterprise demo 抽离这批提交提供不发版前的 smoke / pack / dry-run 验证口径与留痕标准
生成模型: GPT-5 Codex
---

# OneUI Pre-release Verification: ThemeScope + Middleware Composer + Enterprise Demo

## 1. 背景

本轮变更围绕 DatabaseView 的真实消费链路展开，核心包含：

- `ThemeScope` 在企业场景中的局部主题包裹与可视化展示。
- DatabaseView action middleware 的 preset 化与 composer 组合能力。
- 企业 demo 从原始展示壳中抽离，形成更接近业务方的组合消费样例。

本文件只定义发版前验证口径，不作为发布成功证明，也不替代实际 `proof` 文档。

## 2. 验证目标

1. 确认本批提交在当前仓库状态下可通过基础类型检查与单测。
2. 确认 npm 产物在 `pack` 与 `dry-run` 阶段没有暴露出打包结构异常。
3. 确认外部 consumer 在至少两个宿主矩阵下可以正常安装、构建与引用。
4. 确认该批变更不依赖真实后端发布即可完成预发布门禁判断。

## 3. 验证顺序

建议按下列顺序执行，避免先做高成本 smoke 再回头修低成本错误：

1. `npm run type-check`
2. `npm run test -- src/tests/database-view-middleware.integration.spec.ts src/tests/database-view.integration.spec.ts`
3. `npm run build`
4. `npm pack`
5. `npm publish --dry-run --access public --registry=https://registry.npmjs.org`
6. 外部 consumer smoke
   - Vite 5.x
   - 当前最新稳定 Vite

## 4. 判定标准

- `type-check` 无新增错误。
- middleware 相关测试覆盖成功路径与错误路径，composer 组合行为不回退。
- `build` 产物可生成，且不引入主题或 virtualization 之外的异常副作用。
- `npm pack` 与 `npm publish --dry-run` 均通过，产物清单与预期一致。
- 外部 consumer 能完成安装与构建，且能引用本批导出的 middleware preset / composer。

## 5. 预发布关注点

1. 如果后续引入 `worker`、`assets`、`dynamic import`、`import.meta.url` 或样式路径变化，需要额外做 dist 扫描。
2. 如果包内入口或导出面发生变化，需要同步补双宿主 consumer smoke。
3. 如果 middleware composer 的输入签名或 preset 类型继续扩展，需要在文档里同步更新示例和验证命令。

## 6. 留痕建议

- 本地验证日志建议统一落到临时目录或任务目录，确保可回溯。
- 若最终确认可发版，应另写 proof 文档保存实际 `pack` / `dry-run` / consumer smoke 结果。
- 若验证期间发现契约变更，仅更新本文件的验证口径，不在此文档里记录源码改动细节。

