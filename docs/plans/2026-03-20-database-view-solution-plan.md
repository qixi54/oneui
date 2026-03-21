---
生成时间: 2026-03-20 16:55:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts, issue:ONEUI-FE-00072
角色定义: ARCH（架构师）
文档生成目的: 为 OneUI 新增页面级 DatabaseView 胶水层方案，将现有组件库能力封装为可直接复用的前端页面解决方案
生成模型: GPT-5 Codex
---

# OneUI 页面级解决方案升级规划 v1.0

## Part 1: 执行摘要

### 现状

OneUI 已完成组件库底座建设，当前已具备统一数据模型、统一视图接口、表格交互增强、Supabase 适配、视图持久化、Schema 交互等能力。关键锚点包括：

- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/types/index.ts:161` 已定义 `FieldDef / DataRecord / ViewConfig / TableSchema` 三层模型
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:43` 已具备 `records/schema/view` 输入和 schema 事件回传
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useSupabaseProvider.ts:165` 已具备分页、筛选、搜索、排序查询能力
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useViewPersistence.ts:117` 已具备视图状态持久化能力

### 问题

当前 OneUI 仍停留在“组件库交付”层。业务侧若想做一个可用的数据页面，仍需自行编写视图切换、工具栏编排、详情面板联动、远端数据加载、事件回写、空态/错误态、移动端降级等胶水逻辑。

### 目标

新增页面级 `DatabaseView` 解决方案与配套 `useDatabaseView` composable，使消费者能够用统一契约快速拼出可运行的数据浏览页面，而不是手工组装全部零件。

### 范围

本次范围聚焦前端页面编排层，不包含：

1. 权限系统
2. 实时协同
3. 日历视图
4. 公式引擎
5. 后端 DDL 执行器

### 预期成果

1. 新增 `DatabaseView` 页面级组件
2. 新增 `useDatabaseView` composable
3. 在 `src/dev/` 提供可运行 Demo
4. 文档补齐页面级接入方式
5. 通过构建、类型校验、测试和最小页面级验收

### 资源时间

ARCH + FE + QA，预计 3.5 人日，另加 20% 缓冲，总计 4.5 人日。

## Part 2: 需求分析

### 功能差异对比

| 能力 | 当前组件库态 | 升级后页面方案态 |
|---|---|---|
| 视图切换 | 业务侧手写 `v-if` 分支 | `DatabaseView` 内部按 `view.viewType` 自动切换 |
| 数据加载 | 业务侧手接 `useSupabaseProvider` | `useDatabaseView` 统一封装 remote/local 两种模式 |
| 视图状态 | 业务侧手连 `useViewPersistence` | 页面层自动管理 active view / save / switch |
| 工具栏联动 | 业务侧手接事件 | `DatabaseView` 内建与 `TableToolbar` 的标准联动 |
| 详情联动 | `DataTable` 内部有 `DetailSheet`，其他视图无统一外层契约 | 页面层统一 open record detail 能力 |
| 事件回写 | 业务侧散落实现 | 页面层统一 `actions` 契约 |
| 空态/错误态/加载态 | 业务侧自补 | 页面层提供标准 rendering contract |
| Demo 价值 | 只展示组件 | 展示完整页面接入路径 |

### 优先级

- P0: 页面级契约冻结、`useDatabaseView`、`DatabaseView`、Demo 跑通
- P1: 详情面板统一、schema 事件 actions、受控/非受控模式
- P2: 文档增强、更多状态边界、后续扩展点预留

### 核心概念定义

| 概念 | 定义 |
|---|---|
| `DatabaseView` | 页面级编排组件，负责工具栏、当前视图、数据视图组件、空态/错误态、详情侧栏的统一渲染 |
| `useDatabaseView` | 页面层 composable，负责 records/schema/views/currentView/loading/error/actions 的统一编排 |
| `data mode` | 页面层数据来源模式，分为 `local` 和 `provider` 两种 |
| `actions contract` | 页面层暴露给业务方的回写接口，包括 record update、schema mutate、view mutate、refresh |

## Part 3: 详细方案

### 3.1 方案概述

新增两层能力：

1. `useDatabaseView` 作为状态编排层
2. `DatabaseView.vue` 作为页面渲染层

两层分离后，业务方既可直接用整页组件，也可只消费 composable 自定义页面外壳。

### 3.2 页面级输入契约

```ts
interface DatabaseViewProps {
  tableId: string
  schema?: TableSchema
  records?: DataRecord[]
  views?: ViewConfig[]
  provider?: {
    mode: "local" | "supabase"
    onFetch?: UseTableOptions<DataRecord>["onFetch"]
    onRefresh?: () => Promise<void>
  }
  actions?: {
    onUpdateRecord?: (payload: { rowId: string; fieldId: string; value: unknown }) => Promise<void> | void
    onCreateRecord?: () => Promise<void> | void
    onDeleteRecord?: (rowId: string) => Promise<void> | void
    onSchemaEvent?: (event: DatabaseSchemaEvent) => Promise<void> | void
    onSaveView?: (view: ViewConfig) => Promise<void> | void
  }
  ui?: {
    enableDetail?: boolean
    enableFieldManagement?: boolean
    enableViewPersistence?: boolean
    mobileCardFields?: string[]
  }
}
```

### 3.3 状态归属矩阵

| 状态 | 归属层 | 原因 |
|---|---|---|
| `records/schema/views` 源数据 | 页面层 | 涉及远端加载和跨视图共享 |
| `currentView` | 页面层 | 工具栏和视图渲染共同依赖 |
| `loading/error/refresh` | 页面层 | 属于数据获取生命周期 |
| 单元格编辑态 | 组件内部 | 细粒度交互，保留在 `DataTable` |
| 表格排序/筛选/搜索的当前值 | 页面层 | 需要与 provider、toolbar 同步 |
| 详情面板开关与选中记录 | 页面层 | 未来要扩展到 Kanban/Gallery |

### 3.4 视图渲染决策矩阵

| `view.viewType` | 页面层渲染组件 | 必传参数 | 降级策略 |
|---|---|---|---|
| `table` | `DataTable` | `records/schema/view` | schema 缺失时按 columns fallback |
| `kanban` | `KanbanBoard` | `records/schema/view` | 缺少 lane field 时返回 empty state |
| `gallery` | `GalleryView` | `records/schema/view` | 缺少 cover field 时使用默认卡片 |
| `timeline` | `GanttTimeline` | `records/schema/view` | 缺 start/end 时返回 empty state |
| `detail` | `DetailLayout` 或 detail shell | `selectedRecord/schema` | 无选中记录时显示 placeholder |

### 3.5 数据模式决策矩阵

| 模式 | 触发条件 | 行为 |
|---|---|---|
| `local` | 传入 `records`，未传 `provider.onFetch` | 纯内存渲染，不做远端刷新 |
| `provider` | 传入 `provider.onFetch` | 由页面层调取远端数据，并维护 loading/error |
| `provider + persistence` | 同时传入 provider 和 persistence backend | 启用视图持久化与 refresh |

### 3.6 事件回写契约

页面层不直接执行 DDL，也不直接依赖某个后端 SDK。所有需要“落库”或“副作用”的事情都通过 `actions` 注入：

```ts
type DatabaseSchemaEvent =
  | { type: "schema-add-field"; fieldType: string }
  | { type: "schema-rename-field"; fieldId: string; newName: string }
  | { type: "schema-change-field-type"; fieldId: string; newType: string }
  | { type: "schema-hide-field"; fieldId: string }
  | { type: "schema-delete-field"; fieldId: string }
  | { type: "schema-duplicate-field"; fieldId: string }
```

### 3.7 伪代码

```ts
const dbView = useDatabaseView({
  tableId,
  schema,
  records,
  provider,
  actions,
  persistence,
})

render(
  <DatabaseView
    records={dbView.records}
    schema={dbView.schema}
    currentView={dbView.activeView}
    views={dbView.views}
    loading={dbView.loading}
    error={dbView.error}
    onRefresh={dbView.refresh}
    onSchemaEvent={dbView.handleSchemaEvent}
    onCellEdit={dbView.handleCellEdit}
  />
)
```

### 3.8 目标文件

| 文件 | 责任 |
|---|---|
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useDatabaseView.ts` | 页面级状态编排 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue` | 页面级视图渲染 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/index.ts` | 导出入口 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts` | 对外导出新能力 |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/dev/App.vue` | 完整页面 Demo |
| `/opt/Oneflow/flowlab/项目/oneui/code/develop/README.md` | 页面级用法文档 |

### 3.9 参考实现和锚点

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useSupabaseProvider.ts:165`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useViewPersistence.ts:117`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableToolbar.vue:22`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue:43`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/types/index.ts:161`
6. `issue:ONEUI-FE-00072`

## Part 4: 实现路线图

### Phase 0: 契约冻结

- 定义 `DatabaseViewProps`
- 定义 `useDatabaseView` 返回结构
- 定义 `actions` 和 `provider` 契约

### Phase 1: 状态编排层

- 落 `useDatabaseView.ts`
- 打通 local/provider 两种数据模式
- 打通 view persistence / active view / refresh

### Phase 2: 页面渲染层

- 新增 `DatabaseView.vue`
- 串联 `TableToolbar + DataTable/Kanban/Gallery/Gantt`
- 增加 loading / empty / error / detail 状态

### Phase 3: Demo 与文档

- 在 `src/dev/App.vue` 增加完整 Demo
- README 补齐页面级用法
- 输出接入说明

### Phase 4: 验收与收尾

- 类型校验
- 构建
- 测试
- 补页面级 focused 验证

## Part 5: 工作量估计

| 角色 | 阶段 | 工作量 |
|---|---|---|
| ARCH | 契约冻结 + 方案把关 | 0.5 天 |
| FE | `useDatabaseView` 状态编排 | 1.0 天 |
| FE | `DatabaseView` 页面组件 | 1.0 天 |
| FE | Demo + README | 0.5 天 |
| QA | focused 验证 + 回归 | 0.5 天 |
| 缓冲 | 交互边界修正 | 1.0 天 |
| 合计 |  | 4.5 天 |

### 关键路径

`契约冻结 -> 状态编排 -> 页面渲染 -> Demo/文档 -> 验证`

说明：

1. 页面渲染依赖契约冻结
2. Demo 依赖状态编排和页面组件都可用
3. QA 必须后置

## Part 6: 风险评估

| 风险 | 级别 | 应对 |
|---|---|---|
| 页面层把组件内部状态和远端状态耦合过深，导致难维护 | High | 先冻结状态归属矩阵，细粒度交互继续留在子组件 |
| `provider` 契约过早绑定 Supabase 细节，导致泛化失败 | High | 以 `onFetch/onRefresh` 抽象，不直接耦合 SDK |
| `DatabaseView` 范围膨胀成“低代码平台” | Medium | 明确不做权限、DDL、公式、实时协同 |
| 详情页交互只在表格中成熟，其他视图体验不一致 | Medium | P0 先做到统一 detail open contract，视图内渲染分步补齐 |
| Demo 写成特例代码，无法反映真实对外契约 | Medium | Demo 强制只消费公开导出接口，不读内部私有状态 |
| 现有 lint warnings 影响后续页面级质量感知 | Low | 不阻塞本 plan，但在 QA focused review 中记录残留警告边界 |

## Part 7: 验收标准

### 功能验收

1. 存在 `useDatabaseView` 导出，且能编排 local/provider 两种模式
2. 存在 `DatabaseView` 导出，且可根据 `view.viewType` 渲染四类主视图
3. `DatabaseView` 能联动 `TableToolbar`
4. `DatabaseView` 能透传 `cell-edit` 与 schema 事件到 `actions`
5. `src/dev/App.vue` 有完整页面级接入示例

### 验收命令

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm type-check
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm build
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm test
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "useDatabaseView|DatabaseView" src/index.ts src/dev src/components src/composables
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm lint:style
```

### 完成定义

只有当以上命令通过，且 Demo 能展示视图切换、远端/本地模式、空态/错误态中的至少 3 类状态时，才算本 plan 完成。

## Part 8: 回滚方案

### 触发条件

1. `DatabaseView` 破坏现有导出
2. `build` 或 `type-check` 失败
3. 页面层状态耦合导致现有 `DataTable` 行为回归

### Runbook

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git diff --name-only HEAD
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
pnpm type-check && pnpm build && pnpm test
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
git checkout HEAD -- src/index.ts src/dev/App.vue README.md
```

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
rm -f src/composables/useDatabaseView.ts src/components/database/DatabaseView.vue src/components/database/index.ts
```

说明：

本计划只影响本地代码，不涉及共享数据库结构变更，不涉及测试服务器和生产服务器代码同步。

## Part 9: 架构决策记录（ADR）

### ADR-001：同时提供 composable 和页面组件

决策：同时提供 `useDatabaseView` 与 `DatabaseView`。

理由：只给页面组件会牺牲灵活性，只给 composable 会保留较高接入成本。双层出口最符合“解决方案”定位。

### ADR-002：Provider 契约不直绑 Supabase SDK

决策：页面层只依赖抽象 `onFetch/onRefresh` 和最小 provider 契约。

理由：OneUI 是页面方案，不应退化成 Supabase 专用模板。

### ADR-003：Schema 事件通过 actions 注入

决策：页面层只负责转发 schema 事件，不直接执行 DDL。

理由：字段新增/改名/删除的真实副作用强依赖业务后端边界，不能在组件库中硬编码。

### ADR-004：P0 先覆盖四大主视图，不扩展 detail 独立视图

决策：P0 聚焦 `table/kanban/gallery/timeline`。

理由：这是当前代码里最成熟的四类视图，先让主路径闭环，再扩其他页面模式。

## Part 10: 参考和附录

### 参考文件

1. `/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md`
2. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/index.ts`
3. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useSupabaseProvider.ts`
4. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useViewPersistence.ts`
5. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/TableToolbar.vue`
6. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue`
7. `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/types/index.ts`
8. `issue:ONEUI-FE-00072`

### 本次 Plan 建议标题

`OneUI 页面级解决方案升级：DatabaseView 胶水层 + 页面编排契约`

### 建议 delivery profile

`standard_delivery`
