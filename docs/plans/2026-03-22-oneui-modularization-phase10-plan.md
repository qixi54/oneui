---
生成时间: 2026-03-22 12:15:27
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:101, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue:149, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableGroupRow.vue:60, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/FieldTypePicker.vue:105, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:326, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/databaseViewUtils.ts:450, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第十阶段的并发改写范围、风险、验收与回滚口径，继续压缩 DetailSheet 模板重复、收紧行级 table 语义层，并把 DatabaseView 的 detail/workspace 派生状态下沉到 composable
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 10 Plan

## Part 1: 执行摘要

phase9 已经把 `TableToolbar` 面板状态抽成 composable，并把次级 panel 与 database workspace 的语义层继续收紧，但三个高 ROI 残项还在：`DetailSheet.vue` 仍保留双模板重复，`TableDataRow / TableGroupRow / FieldTypePicker` 仍混用旧灰阶 fallback，`DatabaseView.vue` 里 detail/workspace 派生状态仍然堆在主 orchestrator 内。

本阶段目标只做三件事：去掉 `DetailSheet` 的重复 renderer、继续把行级 table 组件切到 semantic/workspace token、把 `DatabaseView` 的 detail/workspace 派生状态和行为下沉到独立 composable。

本阶段不新增共享数据、不改服务端、不改版本号、不扩 public API。执行方式继续采用并发子代理，主线程负责集成、门禁、FlowAPI 和 Git 收口。

资源时间按 `1.0` 人日估算，其中 `0.2` 人日作为并发集成和回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `DetailSheet.vue` 保留 embedded / overlay 两套重复主体模板 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:101` | 同一份内容结构维护两套 DOM，后续每次字段区或 footer 改动都要双改 | P0 |
| `TableDataRow.vue`、`TableGroupRow.vue`、`FieldTypePicker.vue` 仍有较多旧灰阶 fallback | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue:279`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableGroupRow.vue:109`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/FieldTypePicker.vue:148` | 行级默认视觉在 neutral / ops-console 下还不够统一 | P0 |
| `DatabaseView.vue` 中 detail/workspace 派生状态块仍过大 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:326` | orchestrator 同时维护 detail 计算、draft、presentation 和 empty action，后续迭代 detail 区会继续膨胀 | P0 |
| detail/workspace 相关 utils 已稳定，但未形成状态模块 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/databaseViewUtils.ts:450` | 现有 util 只提供纯函数，缺少面向 `DatabaseView` 的编排层 | P1 |
| 用户要求继续把能收掉的高 ROI 项都收掉 | 当前可自然拆成 detail-sheet / row-theme / database-detail-state 三个互斥写域 | 若不冻结写域直接并发，容易造成覆盖与重复修改 | P0 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 去重 `DetailSheet.vue` 主体模板 | 允许新增内部子组件，但不改变 public props / emits | 是 |
| 行级 table 语义层收口 | 覆盖 `TableDataRow.vue`、`TableGroupRow.vue`、`FieldTypePicker.vue` | 是 |
| 新增 `useDatabaseDetailWorkspace.ts` 一类 composable | 承接 detail/workspace 的派生状态和相关行为 | 是 |
| 更新 `DatabaseView.vue` 接入新的 detail/workspace composable | 保持对外行为稳定 | 是 |
| 调整 `DataTable.vue` 主结构 | 涉及面更大，留给后续阶段 | 否 |
| 新增 public export 或主题 preset | 与本轮目标无关 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 只做 DetailSheet 去重 | 实现风险最小 | 无法顺手清掉行级视觉债和 DatabaseView detail 块膨胀 | 不选 |
| 只做 DatabaseView composable 抽离 | 结构收益明显 | 行级视觉仍不统一，DetailSheet 重复也继续存在 | 不选 |
| 并发推进 `detail-sheet / row-theme / database-detail-state` 三个互斥写域 | 结构和视觉收益同时落地，适合继续提速 | 主线程需要统一门禁和收口 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue` | detail renderer shell | 去掉 overlay / embedded 双模板重复，只保留壳层差异与共享主体 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue` | row renderer | 默认更明确地消费 workspace / border / row-action / text 语义层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableGroupRow.vue` | group row renderer | 默认更明确地消费 workspace / selected / divider 语义层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/FieldTypePicker.vue` | field type popover | 默认更明确地消费 workspace-raised / elevation / selected 语义层 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useDatabaseDetailWorkspace.ts` | detail state engine | 承接 detailRow、detailWorkspaceRow、detail title/description/items、presentation 和 detail draft 相关行为 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue` | orchestrator | 继续保留总编排，但不再直接堆放完整 detail/workspace 派生状态块 |

### 3.2 并发执行伪代码

```text
freeze phase10 write scopes
parallel:
  FE-DETAIL-SHEET -> deduplicate DetailSheet renderer
  FE-ROW-THEME -> retarget row/group/type-picker surfaces to semantic tokens
  FE-DATABASE-DETAIL-STATE -> extract DatabaseView detail/workspace state composable and wire it in
main-thread:
  review landed diffs
  materialize missing changes if any agent result is not in workspace
  run type/lint/style/test/build gates
  write verification doc
  update FlowAPI evidence
  commit git
```

### 3.3 实现原则

1. `DetailSheet` 去重时不改变 `visible / embedded / fullPage / readonly / save / delete / close` 的外部语义。
2. 行级 table 组件优先替换默认来源，不追求删除所有 fallback。
3. `useDatabaseDetailWorkspace.ts` 只承接 detail/workspace 派生状态和相关行为，不接管 `useDatabaseView` 的 provider、view CRUD 或 toolbar/filter 编排。
4. 主线程以工作区实际落盘结果为准；若子代理只返回方案未落盘，由主线程补齐最终 patch。

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 10A | 去重 `DetailSheet.vue` 主体 renderer | 无 | detail sheet 主体结构只保留一套 |
| Phase 10B | 行级 table 语义层收口 | 无 | row/group/type-picker 默认视觉更统一 |
| Phase 10C | 新增 detail/workspace composable 并接回 `DatabaseView.vue` | 无 | `DatabaseView` detail 块显著变薄 |
| Phase 10D | 主线程门禁、FlowAPI、Git 收口 | 10A / 10B / 10C | 代码、文档、计划、任务形成闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 并发调度、集成、门禁、验证、留痕、提交 | 0.3 人日 |
| FE-A | `DetailSheet` 去重复 | 0.2 人日 |
| FE-B | 行级 table semantic token 收口 | 0.2 人日 |
| FE-C | `DatabaseView` detail/workspace composable 抽离 | 0.3 人日 |

总计 `1.0` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| `DetailSheet` 去重后 overlay 与 embedded 的行为出现偏差 | High | 抽共享主体时遗漏 hitarea、shell 或 footer 行为差异 | 保留外层 overlay/shell 分支，只抽共享主体内容 |
| 行级 table 语义来源切换后 hover/selection 对比不足 | Medium | `selected`、`focus-visible`、row action 使用了过轻 surface | 保留 `border-active`、`surface-selected`、`row-action-*` 高层别名 |
| `DatabaseView` composable 抽离后 detail 草稿或 close/save 行为回归 | High | draft 状态、selectedRecord、presentation 相关行为分层不清 | 抽离时保留现有输入输出契约，先迁移派生状态与小型行为，不碰 provider 和 toolbar 主链 |
| 并发写域结果未完全落盘 | Medium | 子代理报告完成但主工作区未出现对应改动 | 主线程以工作区为准，必要时直接 materialize |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| Stylelint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint:style'` |
| table + database 集成测试通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts'` |
| phase10 关键路径已进入源码或产物 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "DetailSheet|TableDataRow|TableGroupRow|FieldTypePicker|useDatabaseDetailWorkspace|DatabaseView" src/components src/composables dist'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败。
2. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts` 回归。
3. detail sheet、table row 交互态或 database detail workspace 行为出现明显异常。

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/table src/components/database src/composables docs/plans
git checkout HEAD -- src/components/table/DetailSheet.vue src/components/table/TableDataRow.vue src/components/table/TableGroupRow.vue src/components/table/FieldTypePicker.vue src/components/database/DatabaseView.vue
rm -f src/composables/useDatabaseDetailWorkspace.ts
npm run type-check
```

数据影响边界：

1. 本地代码：将被回滚。
2. 共享数据：未涉及。
3. 测试服务器代码：未涉及。
4. 生产服务器代码：未涉及。

## Part 9: 架构决策记录（ADR）

### ADR-001: `DetailSheet` 本轮优先去重复，而不是继续堆更多分支

决策：本轮允许为 `DetailSheet` 新增内部抽象，但不改对外 API。

原因：当前最大的维护成本来自重复模板，而不是行为复杂度本身。

### ADR-002: `DatabaseView` 本轮只抽 detail/workspace 派生状态，不动 provider 主链

决策：`DatabaseView` 只下沉 detail/workspace composable，不同步重构 `useDatabaseView` 主体。

原因：detail/workspace 已经形成独立职责，先把它剥离出来，比直接动 provider 主链更稳。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue:101`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableDataRow.vue:149`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableGroupRow.vue:60`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/FieldTypePicker.vue:105`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:326`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/databaseViewUtils.ts:450`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run lint:style`
4. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts`
5. `rg -n "DetailSheet|TableDataRow|TableGroupRow|FieldTypePicker|useDatabaseDetailWorkspace|DatabaseView" src/components src/composables dist`
6. 补充执行验证：`npm run build`
