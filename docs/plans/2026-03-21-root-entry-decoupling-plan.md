---
生成时间: 2026-03-21 12:20:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI 根入口与 plugin 入口解耦修复建立正式规划、任务拆分与回溯依据
生成模型: GPT-5 Codex
---

# OneUI Root Entry / Plugin 解耦与发布边界修复计划

## Part 1: 执行摘要

当前 OneUI 根入口 [`src/index.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts) 同时承载 named exports 与 `plugin` 导出，导致 consumer 在根入口按需导入场景下仍会静态挂到全量插件图谱。目标是在 `0.5.4` 中把插件入口显式拆到 `@oneflowui/ui/plugin`，保持 named exports 根入口干净，并清理不应进入 tarball 的 `dev/tests` 类型产物。范围包括入口导出、构建配置、README、consumer smoke 与发布验证。预期成果是：根入口按需导入继续保持轻量，插件入口可独立使用，并形成 issue/plan/task 级完整留痕。

## Part 2: 需求分析

| 需求 | 优先级 | 当前现状 | 目标状态 |
|------|--------|----------|----------|
| 根入口不再重导出 plugin | P0 | [`src/index.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts) 最后仍重导出 `./plugin` | 根入口仅提供 named exports |
| plugin 子入口可独立消费 | P0 | `package.json` 无稳定 `./plugin` 公开入口 | 提供 `@oneflowui/ui/plugin` |
| 构建产出 plugin.js | P0 | 单入口构建时 `dist/plugin.js` 可能缺失 | 多入口构建稳定产出 `dist/plugin.js` |
| tarball 不携带 dev/tests d.ts | P1 | `dist/dev` / `dist/tests` 进入 tarball | dts 输出排除开发与测试目录 |
| 文档与示例同步 | P0 | README 仍指导 `import OneflowUI from '@oneflowui/ui'` | 改为 `@oneflowui/ui/plugin` |

## Part 3: 详细方案

### 3.1 入口决策矩阵

| 场景 | 入口 | 说明 |
|------|------|------|
| 按需导入组件/composable | `@oneflowui/ui` | 只走 named exports |
| 全局注册全部组件 | `@oneflowui/ui/plugin` | 显式接受全量组件与样式图谱 |
| 样式导入 | `@oneflowui/ui/styles` | 保持独立 |

### 3.2 实现要点

1. 移除 [`src/index.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts) 对 `./plugin` 的重导出。
2. 在 [`package.json`](/opt/Oneflow/flowlab/项目/oneui/code/develop/package.json) 新增 `./plugin` export。
3. 将 [`vite.config.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/vite.config.ts) 改为 `index + plugin` 多入口构建。
4. 在 dts 配置中排除 `src/dev/**`、`src/tests/**`、`*.integration.spec.ts`。
5. 更新 [`README.md`](/opt/Oneflow/flowlab/项目/oneui/code/develop/README.md)、[`README.en.md`](/opt/Oneflow/flowlab/项目/oneui/code/develop/README.en.md)、[`src/dev/main.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/main.ts)。

### 3.3 伪代码

```ts
// root entry
export { Badge, DataTable, useDatabaseView } from "./...";
// no plugin export here

// package exports
exports["."] = "./dist/index.js"
exports["./plugin"] = "./dist/plugin.js"
exports["./styles"] = "./dist/style.css"

// build
lib.entry = {
  index: "src/index.ts",
  plugin: "src/plugin.ts",
}
```

## Part 4: 实现路线图

| 阶段 | 里程碑 | 说明 |
|------|--------|------|
| Phase 1 | 契约冻结 | 明确 root/plugin/styles 三入口边界 |
| Phase 2 | 代码改写 | 入口、exports、build、README 同步修改 |
| Phase 3 | 验证 | `type-check`、`test`、`build`、`npm pack`、`dry-run`、consumer smoke |
| Phase 4 | 发布 | 发出 `0.5.4` 并补 changelog/memo |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 入口边界设计、plan/task 留痕 | 0.5 天 |
| FE | 入口与构建改写、README 更新 | 0.5 天 |
| QA | tarball consumer smoke、发布验证 | 0.5 天 |

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| 旧用法破坏 | High | `import OneflowUI from '@oneflowui/ui'` 将不再成立 | README/CHANGELOG 明确写明迁移方式 |
| plugin 构建缺失 | High | 若 `dist/plugin.js` 未产出，`./plugin` 入口会失效 | 多入口构建 + tarball 校验 |
| dts 排除误伤 | Medium | 排除规则写错会丢类型 | `pnpm type-check` + inspect tarball |
| consumer 宿主兼容 | Medium | 新入口在 Vite 5/8 行为需确认 | 双宿主 smoke |

## Part 7: 验收标准

1. 根入口不再导出 `plugin`
   ```bash
   rg -n 'export \\{ OneflowUI|default \\} from "./plugin"' /opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts && exit 1 || exit 0
   ```
2. tarball 中存在 `dist/plugin.js`
   ```bash
   tar -tf /opt/Oneflow/flowlab/项目/oneui/code/develop/oneflowui-ui-0.5.4.tgz | rg 'dist/plugin.js'
   ```
3. tarball 不再包含 `dist/dev` / `dist/tests`
   ```bash
   tar -tf /opt/Oneflow/flowlab/项目/oneui/code/develop/oneflowui-ui-0.5.4.tgz | rg 'dist/(dev|tests)/' && exit 1 || exit 0
   ```
4. root named import 可在 Vite 5 consumer build 通过
   ```bash
   bash -lc 'test -d /tmp/oneui-root-v5-yxIo1k/dist/assets'
   ```
5. plugin 子入口可在 Vite 8 consumer build 通过
   ```bash
   bash -lc 'test -d /tmp/oneui-plugin-v8-pass/dist/assets'
   ```

## Part 8: 回滚方案

1. 若 `@oneflowui/ui/plugin` 入口无法构建，立即回滚到上一个稳定入口结构，并取消发布 `0.5.4`。
2. 若 consumer smoke 失败，保留本地改动但不执行 `npm publish`。
3. 若发布后发现严重兼容问题，发布紧急补丁恢复根入口默认导出或添加兼容桥。

## Part 9: 架构决策记录

1. 不把 `plugin` 继续留在根入口。
原因：会把全量组件安装图谱静态挂到 named exports 根入口。
2. 不扩大 `sideEffects`。
原因：这会让 tree-shaking 更差，不解决根因。
3. 优先多入口构建，而不是在根入口做兼容重导出。
原因：要保证 `dist/plugin.js` 是真实产物。

## Part 10: 参考和附录

- [`src/index.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts)
- [`src/plugin.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/plugin.ts)
- [`vite.config.ts`](/opt/Oneflow/flowlab/项目/oneui/code/develop/vite.config.ts)
- [`package.json`](/opt/Oneflow/flowlab/项目/oneui/code/develop/package.json)
- [`README.md`](/opt/Oneflow/flowlab/项目/oneui/code/develop/README.md)
- [`README.en.md`](/opt/Oneflow/flowlab/项目/oneui/code/develop/README.en.md)
