---
生成时间: 2026-03-21 12:03:37
参考文档: docs/CHANGELOG-v0.5.0.md, docs/PACKAGE-RELEASE-CHECKLIST.md, issue:ONEUI-FE-00086
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI 0.5.3 packaging hotfix 的问题归因、修复动作、验证矩阵与发版收口依据
生成模型: GPT-5 Codex
---

# OneUI 0.5.3 Packaging Slimming Hotfix Plan

## 1. 背景

`ONEUI-FE-00086` 指向 consumer 打包体积异常。实际核查后确认，问题分成两类：

1. `Dashboard` 静态导入全部图表 widget，导致 `echarts` 被直接焊进首包
2. 字符串图标解析采用集中静态 registry，引入页面级组件时会同步吸入一组 `lucide-vue-next` 图标实现

## 2. 问题定义

目标不是抽象层面的“优化体积”，而是明确修复：

1. `Dashboard` consumer 首包不再直接包含 `echarts`
2. 图标字符串解析不再通过集中静态 import 同步吸入整组 registry 图标
3. Vite `5.4.x` 与当前最新稳定 Vite host 均需外部 tarball smoke 通过

## 3. 影响范围

受影响对象：

1. 通过 npm 包消费 `@oneflowui/ui`
2. 直接引入 `Dashboard` 的页面级 consumer
3. 使用字符串 icon 的页面组件 consumer

## 4. 根因

实际根因不是 issue 初稿里提到的“所有 consumer 都会被 `echarts` 整包拖大”，而是：

1. `Dashboard/index.vue` 静态导入全部 chart widget，`BarChart/PieChart` 会继续静态带入 `echarts`
2. `src/utils/icon.ts` 采用集中静态 import registry，字符串 icon 解析会同步吸入一组 `lucide-vue-next` 图标实现
3. `ONEUI-FE-00086` 初稿中的 `DataTable + echarts` 结论已过时，需要以当前代码事实修正治理口径

## 5. 修复策略

1. 将 `Dashboard` 的图表 widget 改为 `defineAsyncComponent`
2. 将字符串图标解析改为 `lucide` 子路径懒加载
3. 补齐 lucide async icon 子路径声明，保证 type-check/build 可恢复
4. 用外部 tarball smoke 验证 `Dashboard` 首包拆分与 `DataTable` 普通消费路径无 `echarts` 误入

## 6. 目标文件

1. `src/components/Dashboard/index.vue`
2. `src/utils/icon.ts`
3. `src/vite-env.d.ts`
4. `package.json`
5. `docs/CHANGELOG-v0.5.0.md`
6. `docs/PACKAGE-RELEASE-CHECKLIST.md`

## 7. 验收标准

1. `pnpm type-check` 通过
2. `pnpm build` 通过
3. `npm publish --dry-run --registry=https://registry.npmjs.org` 通过
4. `npm pack --registry=https://registry.npmjs.org` 通过
5. Vite `5.4.21` consumer `Dashboard` smoke 通过，且 `echarts` 独立为异步 chunk
6. Vite `8.0.1` consumer `Dashboard` smoke 通过，且 `echarts` 独立为异步 chunk
7. Vite `5.4.21` / `8.0.1` 下 `DataTable` consumer 均不误入 `echarts`
8. npm 主站可查询到 `@oneflowui/ui@0.5.3`

## 8. 验证矩阵

1. OneUI 仓库内：`type-check/build`
2. 外部 consumer:
   - Vite `5.4.21`
   - Vite `8.0.1`
3. 引入方式：
   - `import { Dashboard } from '@oneflowui/ui'`
   - `import { DataTable } from '@oneflowui/ui'`
   - 必带 `@oneflowui/ui/styles`

## 9. 风险与回滚

风险：

1. async component 可能带来首帧图表 widget 的轻微延后
2. `lucide` 子路径懒加载必须保持现有 icon 字符串兼容

回滚：

1. 保留当前 `Dashboard` 对外 API，不改变 widget 契约
2. 若 consumer 发现行为回归，回退到 `0.5.1` 并重新评估异步边界

## 10. 结论

该 hotfix 属于可独立发布的 packaging 修复，应以 `0.5.3` 发版并与 `ONEUI-FE-00086` 建立直接回溯关系。
