---
生成时间: 2026-03-22 16:16:20
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useDatabaseViewMiddleware.ts, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/common/ThemeScope.vue
角色定义: ARCH
文档生成目的: 记录 OneUI 本轮并发增强的中间件组合器、ThemeScope 包装组件与虚拟列表状态缓存的验证口径
生成模型: GPT-5 Codex
---

# OneUI 并发增强补充验证

## 范围

本轮在已完成的 middleware preset、局部主题作用域与 virtualization 抽象基础上，继续补三项对业务消费更直接的增强：

1. `composeDatabaseViewMiddlewares(...)`
2. `ThemeScope`
3. `useVirtualListStateCache(...)`

目标不是改现有契约，而是在不破坏现有 API 的前提下，把“组合能力”与“复制即用”体验补齐。

## 变更点

1. `src/composables/useDatabaseViewMiddleware.ts`
   - 新增 `DatabaseViewMiddlewareInput`
   - 新增 `composeDatabaseViewMiddlewares(...)`
   - 支持嵌套数组、空值跳过、`before` 正序执行、`after/error` 逆序回放

2. `src/components/common/ThemeScope.vue`
   - 新增 ThemeScope 包装组件
   - 自动下发 `data-of-theme` 与 `data-of-theme-scope`
   - 保持组件层 API 非 breaking

3. `src/composables/useVirtualList.ts`
   - 新增 `useVirtualListStateCache(cacheKey)`
   - 允许同 key 状态跨 remount 保留 `scrollTop`、`containerHeight` 与 `invalidateVersion`

4. 文档与 demo
   - `README.md`
   - `README.en.md`
   - `src/dev/App.vue`
   - `docs/ONEUI-INDEX.md`

5. 测试
   - `src/tests/database-view-middleware.integration.spec.ts`
   - `src/tests/theme-scope.integration.spec.ts`
   - `src/tests/useVirtualList.integration.spec.ts`

## 验证命令

1. `npm run test -- src/tests/database-view-middleware.integration.spec.ts`
2. `npm run test -- src/tests/theme-scope.integration.spec.ts`
3. `npm run test -- src/tests/useVirtualList.integration.spec.ts`
4. `npm run type-check`
5. `npm run test`
6. `npm run lint`
7. `npm run lint:style`
8. `npm run build`

## 验收结论

通过标准：

1. `ThemeScope` 能以组件方式稳定承载 scoped theme，而不是要求业务方手写 attribute
2. `composeDatabaseViewMiddlewares(...)` 能将 toast / analytics / optimistic preset 组合为单一 middleware
3. `useVirtualListStateCache(...)` 能在相同 `cacheKey` 下跨 remount 保持虚拟列表状态
4. 根入口与 composables 入口都能对外导出新增能力
