---
生成时间: 2026-03-22 11:30:37
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFrame.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFixedRegion.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopScrollRegion.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopStandardRegion.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewToolbar.vue:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:30, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/Navbar.vue:88, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/base/InfoCard.vue:318, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1
角色定义: ARCH（架构师）
文档生成目的: 冻结 OneUI 模块化第七阶段的并发拆分范围、风险、验收与回滚口径，收口 DataTable 桌面子区域、DatabaseView toolbar 适配层与高频组件 semantic token 覆盖
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 7 Plan

## Part 1: 执行摘要

phase6 之后，`DataTableDesktopFrame.vue` 已经承担桌面外层壳，但 fixed region、scroll region、standard region 仍然共处一个组件；`DatabaseView.vue` 也仍然直接承接 toolbar 适配；同时高频 base/layout 组件还混用新旧 token 命名。

本阶段目标不是继续扩功能，而是在不改变公开 props、emit、plugin 出口和现有交互语义的前提下，完成三个高 ROI 收口动作：继续细拆 `DataTable` 桌面子区域、下沉 `DatabaseView` toolbar 适配层、把高频 layout/base 组件切到 semantic token。

本阶段只修改本地代码、测试和文档，不改共享数据库、不改服务端、不改外部运行环境。执行方式采用并发子代理，主线程只做集成、验证、FlowAPI 留痕和 Git 提交。

资源时间按 `1.2` 人日估算，其中 `0.2` 人日作为并发集成与回归缓冲。

## Part 2: 需求分析

### 2.1 当前问题矩阵

| 问题 | 当前证据 | 影响 | 优先级 |
|------|----------|------|--------|
| `DataTableDesktopFrame.vue` 继续同时持有 fixed / scroll / standard 桌面分支 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFrame.vue:168` | 桌面渲染边界仍偏粗，后续继续拆 renderer 时写入面大 | P0 |
| `DatabaseView.vue` 继续直接消费 `TableToolbar` 语义适配 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:680` | database 场景层还没有把 toolbar adapter 从主 orchestrator 中拿走 | P1 |
| semantic token 已存在，但高频组件仍混用旧 token 名称 | `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:30`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/Navbar.vue:88`, `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/base/InfoCard.vue:318` | neutral 和 ops-console 两套皮肤的语义层虽已建立，但默认组件仍需要补桥接 | P0 |
| 本轮要使用多子代理并发推进 | 用户要求 + 当前三条写域互不冲突 | 若没有明确写域冻结，容易发生并行覆盖 | P0 |

### 2.2 本阶段需求

| 需求 | 说明 | 是否纳入 |
|------|------|----------|
| 新增桌面子区域组件 | 拆出 `DataTableDesktopFixedRegion.vue`、`DataTableDesktopScrollRegion.vue`、`DataTableDesktopStandardRegion.vue` | 是 |
| 更新 `DataTableDesktopFrame.vue` 编排子区域组件 | 保持对外 props / emits / slots 稳定 | 是 |
| 新增 `DatabaseViewToolbar.vue` | 承接 toolbar 适配与事件桥接 | 是 |
| 更新 `DatabaseView.vue` 接入 toolbar adapter | 保持 database 场景行为稳定 | 是 |
| 扩 semantic alias 与高频组件落地 | 覆盖 `layout` 与部分 `base` 组件 | 是 |
| 公开导出这些内部子组件 | 会扩大包表面积 | 否 |
| 修改共享数据、测试服务器、生产服务器 | 与本轮目标无关 | 否 |

### 2.3 决策矩阵

| 方案 | 优点 | 缺点 | 本计划决策 |
|------|------|------|------------|
| 只做 `DataTable` 拆分，不动 theme 和 database | 风险最小 | 无法吃掉当前最明显的 token debt 和 toolbar 耦合 | 不选 |
| 一次性继续深拆 `DatabaseView` 全部 renderer | 长期收益大 | 本轮写入面过大，不适合并发快速收口 | 不选 |
| 并发推进三条互不重叠写域，由主线程统一验收 | 收益集中、回归面可控、最符合当前速度目标 | 集成与留痕必须主线程收口 | 采用 |

## Part 3: 详细方案

### 3.1 目标文件与职责

| 文件 | 角色 | 目标职责 |
|------|------|----------|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFrame.vue` | desktop orchestrator | 只保留桌面 frame 编排、事件桥接与 slot 透传 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFixedRegion.vue` | fixed renderer | 固定列容器、滚动、ref 绑定 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopScrollRegion.vue` | scroll renderer | 可滚动区域容器、滚动、ref 绑定 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopStandardRegion.vue` | standard renderer | 标准桌面滚动容器、ref 绑定 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewToolbar.vue` | toolbar adapter | 包装 `TableToolbar`，向 `DatabaseView.vue` 提供更清晰的 database 语义接口 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css` | token foundation | 补全 `surface / text / border / elevation` alias |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/*.vue` 与 `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/base/*.vue` | consumer layer | 落地 semantic token 到高频组件 |

### 3.2 并发执行伪代码

```text
freeze write scopes
parallel:
  FE-TABLE -> split desktop fixed/scroll/standard regions
  FE-DATABASE -> extract DatabaseView toolbar adapter
  FE-THEME -> extend semantic aliases and migrate high-frequency components
main-thread:
  review diffs
  fix integration warnings
  run gates
  write docs
  update FlowAPI
  commit git
```

### 3.3 实现原则

1. 所有内部拆分必须保持 `@oneflowui/ui` 对外包边界不变。
2. `DataTableDesktop*` 与 `DatabaseViewToolbar` 均视为内部组件，不新增公共导出。
3. semantic token 迁移优先覆盖高频 layout/base 组件，不追求本轮全库清空旧 token。
4. 并发子代理只能写各自冻结写域，主线程负责唯一集成权。

## Part 4: 实现路线图

| 阶段 | 改动 | 依赖 | 里程碑 |
|------|------|------|--------|
| Phase 7A | `DataTable` 桌面子区域拆分 | 无 | fixed / scroll / standard 三块有独立组件落点 |
| Phase 7B | `DatabaseViewToolbar.vue` 下沉 | 无 | database toolbar adapter 从主 orchestrator 中拿走 |
| Phase 7C | semantic token 高频覆盖 | 无 | layout/base 默认视觉改走语义 token |
| Phase 7D | 主线程集成、门禁、FlowAPI、Git | 7A / 7B / 7C | 代码、文档、计划、任务一致闭环 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 计划冻结、并发调度、集成、验证、留痕、提交 | 0.4 人日 |
| FE-A | DataTable 桌面子区域拆分 | 0.3 人日 |
| FE-B | DatabaseView toolbar adapter 下沉 | 0.2 人日 |
| FE-C | semantic token 高频覆盖 | 0.3 人日 |

总计 `1.2` 人日，包含约 `20%` 缓冲。

## Part 6: 风险评估

| 风险 | 级别 | 触发条件 | 应对方案 |
|------|------|----------|----------|
| 子区域拆分后 fixed / scroll 容器 ref 丢失 | High | callback ref 没有正确回接 `DataTable` | 子组件保留 callback ref contract，集成测试与 build 共同守门 |
| toolbar adapter 下沉后事件名桥接漂移 | Medium | camel / hyphen 事件映射不一致 | 新增独立 adapter 组件并以 lint 约束事件命名 |
| semantic token 覆盖过猛导致默认层次感下降 | Medium | 把所有旧 token 一次性替换 | 本轮只迁移高频 base/layout 组件，保留兼容 alias |
| 并发写入发生冲突 | Medium | 子代理写域重叠 | dispatch 前冻结写域，主线程只合并已审查 diff |

## Part 7: 验收标准

| 标准 | 验证命令 |
|------|----------|
| TypeScript 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check'` |
| ESLint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint'` |
| Stylelint 校验通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run lint:style'` |
| table + database 集成测试通过 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts'` |
| 新增内部组件已进入主路径 | `bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n \"DataTableDesktop(Fixed|Scroll|Standard)Region|DatabaseViewToolbar\" src/components dist'` |

说明：

1. `npm run build` 保留为执行阶段补充验证，不进入 Gate2 只读验收命令。

## Part 8: 回滚方案

### 8.1 回滚触发条件

1. `npm run type-check` 失败。
2. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts` 回归。
3. `DataTable` 固定列滚动同步或 `DatabaseView` toolbar 交互出现明显异常。

### 8.2 回滚 Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff -- src/components/table src/components/database src/components/layout src/components/base src/styles docs/plans
git checkout HEAD -- src/components/table/DataTableDesktopFrame.vue src/components/database/DatabaseView.vue src/styles/variables.css
rm -f src/components/table/DataTableDesktopFixedRegion.vue src/components/table/DataTableDesktopScrollRegion.vue src/components/table/DataTableDesktopStandardRegion.vue src/components/database/DatabaseViewToolbar.vue
npm run type-check
```

数据影响边界：

1. 本地代码：将被回滚。
2. 共享数据：未涉及。
3. 测试服务器代码：未涉及。
4. 生产服务器代码：未涉及。

## Part 9: 架构决策记录（ADR）

### ADR-001: 本轮允许并发执行多个互斥写域

决策：table / database / theme 三条写域并发执行，由主线程统一集成。

原因：当前三条链路互不重叠，并发收益明显高于串行。

### ADR-002: 新增内部子组件不扩大公共导出面

决策：`DataTableDesktopFixedRegion.vue`、`DataTableDesktopScrollRegion.vue`、`DataTableDesktopStandardRegion.vue`、`DatabaseViewToolbar.vue` 均保持内部使用。

原因：本轮目标是降低内部复杂度，不是扩包表面积。

## Part 10: 参考和附录

### 10.1 参考代码位置

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFrame.vue:1`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopFixedRegion.vue:1`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopScrollRegion.vue:1`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTableDesktopStandardRegion.vue:1`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue:666`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseViewToolbar.vue:1`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css:30`
8. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/layout/Navbar.vue:88`
9. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/base/InfoCard.vue:318`
10. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts:1`
11. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/database-view.integration.spec.ts:1`

### 10.2 自动化验收索引

1. `npm run type-check`
2. `npm run lint`
3. `npm run lint:style`
4. `npm run test -- src/tests/table-detail.integration.spec.ts src/tests/database-view.integration.spec.ts`
5. `rg -n "DataTableDesktop(Fixed|Scroll|Standard)Region|DatabaseViewToolbar" src/components dist`
6. 补充执行验证：`npm run build`
