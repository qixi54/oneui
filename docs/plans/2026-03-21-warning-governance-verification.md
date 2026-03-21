---
生成时间: 2026-03-21 13:06:10
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-warning-governance-plan.md
角色定义: ARCH（架构师）
文档生成目的: 记录 OneUI warning 治理执行结果、验证命令与剩余风险
生成模型: GPT-5 Codex
---

# OneUI Warning Governance 验证报告

## 结果摘要

- `useVirtualList` 的测试噪音已修复，focused test 不再出现组合式 API 生命周期 warning。
- `pnpm lint` warning 总量从 `336` 下降到 `86`，净减少 `250`。
- 表格、基础组件、字段组件和 composables 的高频 warning 已完成一轮集中治理。
- 当前主干已通过 `type-check`、focused test、`build`。

## 验证命令

1. `pnpm test -- src/tests/useVirtualList.integration.spec.ts`
   - 结果：通过
2. `pnpm test -- src/tests/table-detail.integration.spec.ts src/tests/useVirtualList.integration.spec.ts`
   - 结果：通过，`11` 个 test files、`50` 个 tests 全部通过
3. `pnpm type-check`
   - 结果：通过
4. `pnpm build`
   - 结果：通过
5. `pnpm lint --format json --output-file /tmp/oneui-eslint-latest2.json`
   - 结果：通过，warning `86`

## 关键改动范围

- `src/composables/useVirtualList.ts`
- `src/composables/useKeyboardNavigation.ts`
- `src/composables/useRowDrag.ts`
- `src/composables/useSupabaseProvider.ts`
- `src/composables/useTableData.ts`
- `src/composables/useTableGroup.ts`
- `src/composables/useViewPersistence.ts`
- `src/utils/supabaseSchema.ts`
- `src/plugin.ts`
- `src/vite-env.d.ts`
- `src/components/table/*`
- `src/components/base/*`
- `src/components/breadcrumb/*`
- `src/components/field/*`

## 当前剩余 warning 概览

### 按规则

- `vuejs-accessibility/no-static-element-interactions`: `16`
- `vue/define-macros-order`: `15`
- `vuejs-accessibility/form-control-has-label`: `13`
- `vuejs-accessibility/click-events-have-key-events`: `11`
- `vuejs-accessibility/label-has-for`: `8`
- `vue/attributes-order`: `7`
- `@typescript-eslint/no-explicit-any`: `6`
- `vue/require-default-prop`: `6`

### 高位文件

- `src/components/table/DetailSheet.vue`: `5`
- `src/components/editor/BlockQuote.vue`: `4`
- `src/components/editor/ContentBlock.vue`: `4`
- `src/components/form/FormDesigner.vue`: `4`
- `src/components/timeline/GanttRow.vue`: `4`

## 判断

本轮目标已经达成：

1. 测试噪音已移除。
2. warning 总量显著下降，且主干验证通过。
3. warning 治理已经从“阻塞信号”降到“可继续分批清理”的状态。

剩余 `86` 条 warning 仍值得继续治理，但不再属于“当前主线不稳定”问题。
