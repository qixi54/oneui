---
生成时间: 2026-03-22 01:00:00
参考文档: src/components/database/DatabaseView.vue, src/composables/useDatabaseView.ts, src/contracts/database.ts
角色定义: ARCH
文档生成目的: 记录 OneUI 模块化重构第一阶段的拆层目标、已落地结构与后续任务顺序
生成模型: GPT-5 Codex
---

# OneUI Modularization Phase 1

## 背景

当前 OneUI 已经具备组件层、composable 层与 theme 层，但 `DatabaseView` / `DataTable` 一类页面级方案仍存在“组件渲染、状态编排、持久化偏好、响应式策略、公开契约”混放在单文件中的问题。

这会带来三个直接成本：

1. 页面方案扩展时，必须进入超长 SFC 做联动修改。
2. 公共契约分散在 `SFC` 与 `composable` 中，新增场景时很难判断稳定边界。
3. 响应式与工作区偏好逻辑无法复用，后续 `detail workspace` / `side-by-side` 场景容易复制粘贴。

## 第一阶段目标

第一阶段不直接重写交互，而是先完成两件基础治理：

1. 冻结 `database` 域公共 contract。
2. 把 `workspace preference + viewport detection` 从页面组件中抽离成独立 composable。

这一步的目标不是减少文件数，而是把“协议层”和“状态层”从“页面模板层”剥离出来，为后续继续拆 `DatabaseView renderer` 与 `DataTable engine` 建立稳定边界。

## 本轮已落地改动

### 1. contract 抽离

新增：

- `src/contracts/database.ts`

收敛内容：

- `DatabaseViewMode`
- `DatabaseViewFetchParams`
- `DatabaseViewFetchResult`
- `DatabaseViewProvider`
- `DatabaseSchemaEvent`
- `DatabaseViewActions`
- `UseDatabaseViewOptions`
- `UseDatabaseViewResult`
- `DatabaseViewComponentActions`
- `DatabaseViewProps`
- `DatabaseViewWorkspacePreferences`
- `DatabaseViewDetailPresentation`

结果：

- `useDatabaseView` 不再自行定义整套 database 类型。
- `DatabaseView` 不再把组件公开契约埋在单文件内部。
- `components/database/index.ts` 改为从 contract 层导出类型，避免继续绑死到 `.vue` 文件。

### 2. workspace state 抽离

新增：

- `src/composables/useDatabaseWorkspace.ts`

收敛内容：

- detail workspace 本地偏好读写
- `matchMedia` 移动端检测
- `sidePanelWidth / drawerWidth` 约束
- `searchKeyword` / `activeViewId` 组合持久化

结果：

- `DatabaseView.vue` 移除了本地 `localStorage` / `matchMedia` / workspace width 相关实现细节。
- `DatabaseView` 现在更接近“页面编排器”，而不是“协议 + 状态 + 页面模板混合体”。

### 3. composable 出口整理

新增根出口：

- `useDatabaseViewport`
- `useDatabaseWorkspaceState`

位置：

- `src/composables/index.ts`
- `src/index.ts`

目的：

- 后续别的页面方案如果也需要 detail workspace / 响应式工作区，不再复制 `DatabaseView` 内部逻辑。

## 验证结果

已通过：

1. `npm run type-check`
2. `npm run lint`
3. `npm run build`
4. `npm run test -- database-view.integration.spec.ts table-detail.integration.spec.ts`

## 当前结论

第一阶段已经把 `database` 域拆出两个稳定支点：

1. `contracts/database.ts`
2. `composables/useDatabaseWorkspace.ts`

这意味着后续继续拆 `DatabaseView` 时，可以明确区分：

- contract 层
- state/composable 层
- renderer/SFC 层

而不是继续在一个 `.vue` 文件里叠加逻辑。

## 后续任务顺序

建议按以下顺序继续：

1. 拆 `DatabaseView` renderer
   - 目标：分成 `DatabaseViewShell`、`DatabaseViewContent`、`DatabaseDetailWorkspace`
2. 拆 `DatabaseView` toolbar adapter
   - 目标：把 filter/sort/group/view switching 的桥接逻辑从主组件抽离
3. 拆 `DataTable` engine
   - 目标：把 selection/bulk actions/virtual/fixed/keyboard/drag 收口到 headless engine
4. 拆 `DataTable` mobile/detail sheet
   - 目标：让桌面与移动渲染不再共享同一个超长模板
5. 建立 component registry single source
   - 目标：减少 `plugin` 注册清单和后续导出清单的重复维护
6. 继续冻结 theme scene contract
   - 目标：让 workspace/table scene token 与 neutral/ops skin 的覆盖关系更加稳定

## 不在本阶段处理的内容

以下内容本轮明确不动：

1. 视觉风格重做
2. DataTable 模板大拆
3. root/plugin 自动代码生成
4. npm 发版动作

这些内容应在第二阶段和第三阶段继续推进，避免第一阶段一边冻结契约、一边大范围改 renderer，导致验证面失控。
