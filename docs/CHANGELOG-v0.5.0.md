---
生成时间: 2026-03-21 12:03:37
参考文档: Plan 25408665-d6ef-4740-a40b-acc6069cd715, Plan deee1d2b-80cf-4350-8037-ddecf7196298
角色定义: ARCH（架构师）
文档生成目的: OneUI v0.5.0 版本更新说明，记录多维表格能力升级、页面级方案补齐与 npm 发布结果
生成模型: GPT-5 Codex
---

# OneUI v0.5.x — 多维表格与页面级方案升级

## 版本概述

从纯 UI 展示组件库升级为支持 Notion 式多维表格浏览体验，并提供页面级 `DatabaseView` 解决方案的完整方案。核心变更：Supabase 数据接入、表格交互补全、统一视图接口、Schema 交互能力、页面层编排入口。

**发布状态**：

- `@oneflowui/ui@0.5.0` 已发布到 npm
- `@oneflowui/ui@0.5.1` 为 worker packaging hotfix，修复 consumer 在 Vite 5 / Vite 8 host 中的构建回归
- `@oneflowui/ui@0.5.2` 已存在于 npm 历史版本
- `@oneflowui/ui@0.5.3` 为 packaging hotfix，修复 Dashboard 图表链路首包膨胀，并收紧字符串图标解析的 consumer 打包行为
- `@oneflowui/ui@0.5.4` 为入口架构修复版本，根入口只保留 named exports，全局注册插件改为 `@oneflowui/ui/plugin`
- `@oneflowui/ui@0.5.5` 为可访问性补丁版本，收紧 Breadcrumb 默认链接色与 Badge 默认语义色，修复常规文本尺寸下的 WCAG 对比度风险
- `@oneflowui/ui@0.5.6` 为表格可访问性与扩展性补丁版本，补齐 DataTable 的 grid 语义、恢复 cell slot forwarding，并合并前序对比度修复为统一推荐版本
- `@oneflowui/ui@0.5.7` 为质量收口补丁版本，吸收 warning zero-out 后续修正、skill-based review 发现项收口，以及验证证据边界补强
- `@oneflowui/ui@0.5.8` 为 Database UX 对齐补丁版本，默认将桌面端详情收敛到右侧 workspace，并补齐内容感知列宽与三档 density

**本轮能力补充**：在原有多维表格升级基础上，新增 `DatabaseView + useDatabaseView` 页面级入口，支持 `local/provider` 双模式、统一视图切换、selected record 同步与 detail workspace 页面链路。

**当前页面 UX 对齐方向**：页面级方案继续收敛 `detailPresentation` 与 `density` 两个语义入口，目标是让桌面端详情默认右侧 workspace、移动端保留 sheet fallback，同时把页面密度统一到 `compact / standard / comfortable` 三档。

---

## 补丁版本：0.5.9 package boundary release closeout

### 问题背景

`0.5.8` 发布后，仓库继续完成了一轮 package boundary 治理和治理收口：

1. `plugin` consumer 的主 chunk 仍有一条可继续压缩的依赖链，主要来自字符串图标注册表被初始入口吸入。
2. package-boundary plan 与 `0.5.8` release traceability 已补齐，但 npm 主站版本尚未反映这些最新收口结果。
3. 治理链路最终收到了 `delivery_profile=service_delivery` 的 closeout 修正，需要把当前仓库状态对齐到对外发布版本。

### 修复内容

| 文件 | 变更 |
|------|------|
| `src/utils/icon.ts` | 将字符串图标解析改为懒加载 `iconRegistry`，避免 plugin consumer 首包同步吸入完整注册表 |
| `src/utils/iconRegistry.ts` | 新增独立注册表模块，延迟 `lucide` 字符串图标 loader 的装载时机 |
| `docs/plans/2026-03-21-package-boundary-governance-verification.md` | 固化 package boundary host matrix 验证结果 |
| `docs/plans/2026-03-21-release-0.5.9-*.md` | 补齐 `0.5.9` release plan / verification / proof 三件套 |

### 外部 smoke 结果

1. Vite `8.0.1` plugin consumer build 通过，主 chunk 约 `32.12 kB`，不再出现 chunk size warning
2. Vite `5.4.21` plugin consumer build 通过，构建链稳定

### 结论

`0.5.9` 取代 `0.5.8` 作为当前推荐补丁版本，用于对齐 package boundary 治理、release traceability 与最新治理收口状态。

---

## 补丁版本：0.5.8 Database UX alignment

### 问题背景

`0.5.7` 之后，OneUI 的数据页面仍存在三处体验偏差：

1. `DatabaseView` 桌面端详情仍偏向居中 sheet，而不是右侧工作区。
2. `DataTable` 初始列宽主要依赖固定默认值，不足以贴近实际数据内容。
3. 表格与页面没有统一的 `compact / standard / comfortable` 密度契约。

### 修复内容

| 文件 | 变更 |
|------|------|
| `src/components/database/DatabaseView.vue` | 增加 `detailPresentation` 与 `density` 契约，桌面端 `auto` 默认走右侧 `SidePanel` workspace，移动端保持 `DetailSheet` fallback |
| `src/components/table/DataTable.vue` | 新增 `density` 默认值 `standard`，将密度和推导列宽接入表头、表体与虚拟滚动主链 |
| `src/components/table/TableHeaderRow.vue` | 根据密度调整表头高度、内边距、填充列最小宽度和 resize 体验 |
| `src/components/table/TableDataRow.vue` | 根据密度调整数据行高度与单元格内边距 |
| `src/composables/useColumnResize.ts` | 按字段类型、列标题和样本数据推断初始宽度，保留显式 `width`、用户 resize override 与 auto-fit 的优先级 |
| `src/composables/useVirtualList.ts` | 让虚拟滚动随密度变化重新测量，避免行高错位 |
| `src/dev/App.vue` / `README.md` / `src/tests/*.spec.ts` | 补 dev demo、接入说明和回归断言 |

### 回溯资料

1. `docs/plans/2026-03-21-release-0.5.8-plan.md`
2. `docs/plans/2026-03-21-release-0.5.8-verification.md`
3. `docs/plans/2026-03-21-release-0.5.8-release-proof.md`

### 验证

- `pnpm lint`
- `pnpm type-check`
- `pnpm test -- src/tests/database-view.integration.spec.ts src/tests/table-detail.integration.spec.ts`
- `pnpm build`
- `npm publish --dry-run --registry=https://registry.npmjs.org`
- `npm pack`
- tarball 外部 consumer smoke:
  - Vite `5.4.21`
  - 当前 npm 最新稳定 Vite

### 结论

`0.5.8` 取代 `0.5.7` 作为当前推荐补丁版本，用于对齐 OneUI 数据页面的默认交互形态。

关联回溯：

- [`release plan`](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-release-0.5.8-plan.md)
- [`verification`](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-release-0.5.8-verification.md)
- [`release proof`](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-release-0.5.8-release-proof.md)

---

## 补丁版本：0.5.7 warning zero-out closeout

### 问题背景

`0.5.6` 发布后，仓库继续完成了一轮质量收口：

1. 整库 `eslint` warning 清零
2. skill-based review 指出了弱类型与证据边界问题
3. 本地仓库状态已经领先于 npm 主站的 `0.5.6`

如果继续停留在 `0.5.6`，npm 包会落后于当前真实仓库质量状态。

### 修复内容

| 文件 | 变更 |
|------|------|
| `src/components/table/ExcelExport.vue` | 移除 `@ts-ignore`，改为显式的可选模块加载与类型约束 |
| `src/components/Dashboard/index.vue` | 收紧 dashboard widget data 类型，去除无必要的 `as any` |
| `src/dev/App.vue` | 清理 demo 链路中的 `as any`，补更明确的 helper/type |
| `docs/plans/2026-03-21-warning-zero-out-verification.md` | 补充证据边界说明，避免 `/tmp` 运行产物成为唯一证据来源 |

### 验证

- `pnpm lint`
- `pnpm lint:style`
- `pnpm type-check`
- `pnpm test`
- `pnpm build`
- `npm publish --dry-run --registry=https://registry.npmjs.org`
- `npm pack`
- tarball 外部 consumer smoke:
  - Vite `5.4.21`
  - 当前 npm 最新稳定 Vite

### 结论

`0.5.7` 取代 `0.5.6` 作为当前推荐补丁版本，用于对齐 npm 包与当前仓库的真实质量状态。

---

## 热修复：0.5.1 worker packaging regression

> Issue: ONEUI-FE-00084

### 问题

`0.4.4` 和 `0.5.0` 的发布产物里，`useWorkerSort` 会被打成：

```js
new Worker(new URL("/assets/tableWorker-*.js", import.meta.url), { type: "module" })
```

这会导致部分 consumer 在 Vite 5 与 Vite 8.0.0/8.0.1 host 中构建失败。

### 修复

将 worker 从“外部 asset worker”改为“库内 Blob worker”：

| 文件 | 变更 |
|------|------|
| `src/composables/useWorkerSort.ts` | 改为 `Blob + URL.createObjectURL()` 创建 worker，不再依赖绝对 `/assets/...` |
| `src/workers/tableWorkerSource.js` | 新增内联 worker runtime source |
| `src/vite-env.d.ts` | 补 `vite/client` 声明，支持 `?raw` import |

### 验证

- OneUI 自身：`pnpm type-check` / `pnpm build` / focused tests 通过
- consumer smoke:
  - 本地 tarball 在 Vite `5.4.21` host 中 `vite build` 通过
  - 本地 tarball 在 Vite `8.0.1` host 中 `vite build` 通过

### 结论

`0.5.1` 取代 `0.5.0` 作为推荐安装版本。

---

## 热修复：0.5.3 consumer packaging slimming

> Issue: ONEUI-FE-00086

### 问题

`ONEUI-FE-00086` 暴露的是 consumer 侧的打包质量风险，主要有两条：

1. `Dashboard` 静态导入所有图表组件，导致 consumer 只引入 `Dashboard` 时也会直接把 `echarts` 放入首包。
2. 字符串图标解析使用集中 registry 的静态图标导入，consumer 在使用页面级组件时会额外吸入一组不必同步进入首包的 `lucide-vue-next` 图标实现。

这不是构建失败级回归，但会让页面级 consumer 的主 chunk 明显偏大。

### 修复

| 文件 | 变更 |
|------|------|
| `src/components/Dashboard/index.vue` | 图表 widget 改为 `defineAsyncComponent`，将 `echarts` 从 `Dashboard` 首包拆为异步 chunk |
| `src/utils/icon.ts` | 字符串图标解析改为 `lucide` 子路径懒加载，不再同步静态引入整组 registry 图标 |
| `src/vite-env.d.ts` | 补 lucide async icon 子路径声明，恢复类型检查 |

### 外部 smoke 结果

以本地 tarball 在最小 consumer 中执行 `vite build`：

| Host | 引入方式 | 主 chunk | 异步 markdown chunk | 结果 |
|------|----------|----------|----------------|------|
| Vite `5.4.21` | `import { Dashboard } from '@oneflowui/ui'` | `344.57 kB -> 67.34 kB` | `echarts` 独立 `273.61 kB` | 通过 |
| Vite `8.0.1` | `import { Dashboard } from '@oneflowui/ui'` | `65.74 kB` | `echarts` 独立 `273.97 kB` | 通过 |
| Vite `5.4.21` | `import { DataTable } from '@oneflowui/ui'` | `255.67 kB` | 无 `echarts` 进入首包 | 通过 |
| Vite `8.0.1` | `import { DataTable } from '@oneflowui/ui'` | `62.37 kB` | `useMarkdown` / helper 拆分 | 通过 |

### 结论

`0.5.3` 取代 `0.5.1` 作为推荐安装版本，用于修复页面级 consumer 的 packaging 质量问题，尤其是 `Dashboard` 的 `echarts` 首包膨胀。

---

## 架构修复：0.5.4 root entry / plugin decoupling

### 问题

此前根入口 `src/index.ts` 同时承担：

1. 命名导出入口
2. `OneflowUI` 全量插件导出

这会让 consumer 在 `import { Badge } from '@oneflowui/ui'` 这类按需导入场景下，仍然被根入口静态关联到 `plugin` 图谱，不利于 tree-shaking 和最小依赖边界。

### 修复

| 文件 | 变更 |
|------|------|
| `src/index.ts` | 移除对 `./plugin` 的重导出，根入口仅保留 named exports |
| `package.json` | 新增 `./plugin` export，插件入口改为显式子路径 |
| `src/dev/main.ts` / README | 全局注册示例改为 `import OneflowUI from '@oneflowui/ui/plugin'` |
| `vite.config.ts` | 排除 `src/dev` / `src/tests` 的 d.ts 输出，避免 tarball 携带无关开发产物 |

### 结果

1. 根入口的包边界更干净，命名导入不再静态挂到全量插件入口。
2. `plugin` 仍可用，但路径显式变为 `@oneflowui/ui/plugin`。
3. tarball 不再包含 `dist/dev` / `dist/tests` 这类无关发布产物。
4. consumer smoke 已验证：
   - Vite `5.4.21`：`import { Badge } from '@oneflowui/ui'` 构建通过，主 chunk `62.28 kB`
   - Vite `8.0.1`：`import { Badge } from '@oneflowui/ui'` 构建通过，主 chunk `60.60 kB`
   - Vite `8.0.1`：`import OneflowUI from '@oneflowui/ui/plugin'` 构建通过，插件全量注册入口可用

### 说明

`0.5.4` 的变化是入口契约调整，不是内部热修。
旧写法：

```ts
import OneflowUI from '@oneflowui/ui'
```

新写法：

```ts
import OneflowUI from '@oneflowui/ui/plugin'
import '@oneflowui/ui/styles'
```

### 补充

后续补做了默认可访问性 token 收紧，覆盖 Breadcrumb 默认链接色与 Badge 默认语义色，避免在常规文本尺寸下继续触发 WCAG 对比度问题。

`0.5.5` 则将这项收紧正式补成补丁版本，作为默认推荐安装版本继续向下发。

---

## 补丁版本：0.5.6 DataTable a11y + slot forwarding

> Issues: `ONEUI-FE-00067`, `ONEUI-ARCH-00020`

### 问题

`DataTable` 在 `0.5.5` 之前仍有两类默认缺陷：

1. 根节点虽然使用 `role="grid"`，但 header / row / cell 结构不完整，消费侧 Lighthouse 会命中 `aria-required-parent` / `aria-required-children`
2. 外部 `#cell` 插槽没有稳定透传到桌面与移动端渲染链路，消费侧自定义单元格会被内部默认渲染吞掉

### 修复

| 文件 | 变更 |
|------|------|
| `src/components/table/DataTable.vue` | 补齐 grid 结构中的 row / gridcell 语义，并让外部 `#cell` 插槽优先于内部 fallback |
| `src/components/table/TableHeaderRow.vue` | 补 header row / columnheader 语义 |
| `src/components/table/TableDataRow.vue` | 补 row / gridcell 语义，保持默认渲染为 fallback |
| `src/components/table/TableGroupRow.vue` | 补 group row 语义 |
| `src/components/table/MobileListView.vue` | 透传移动端 card 链路中的 `#cell` 插槽 |
| `src/tests/table-detail.integration.spec.ts` | 补 slot forwarding 与 grid 语义测试 |

### 验证

- `pnpm type-check`
- `pnpm test`
- `pnpm build`
- `npm publish --dry-run --registry=https://registry.npmjs.org`
- `npm pack`
- tarball 外部 consumer build smoke

### 结论

`0.5.6` 取代 `0.5.5` 作为当前推荐安装版本，统一包含：

1. root / plugin 入口解耦
2. Breadcrumb / Badge 默认对比度修复
3. DataTable ARIA grid 结构修复
4. DataTable / MobileListView cell slot forwarding 修复

---

## 一、表格交互缺口修复（Phase 0）

> Task: ONEUI-FE-00069

| 修复项 | 文件 | 说明 |
|--------|------|------|
| observeRow 动态行高 | DataTable.vue | 虚拟滚动行元素绑定 ResizeObserver，支持变高行 |
| 固定列虚拟滚动对齐 | DataTable.vue | 固定区域同步使用 visibleItems + translateY(offsetY) |
| 列宽拖拽视觉线 | DataTable.vue | 蓝色竖线指示器 + 双击列边自适应宽度 |
| 固定列滚动阴影 | DataTable.vue | 水平滚动时固定区域右边缘 box-shadow |
| 行拖拽视觉反馈 | DataTable.vue | 拖拽行透明度 0.5 + 放置位置蓝色线条 |
| 键盘 Ctrl+C/V + Shift 选区 | useKeyboardNavigation.ts | TSV 格式复制粘贴 + 矩形区域选择 |

---

## 二、Supabase 数据接入层（Phase 1）

> Task: ONEUI-ARCH-00021

### 新增文件

| 文件 | 行数 | 功能 |
|------|------|------|
| `src/composables/useSupabaseProvider.ts` | 287 | FilterCondition → PostgREST 翻译、sort/pagination/ilike 搜索 |
| `src/utils/supabaseSchema.ts` | 430 | pg type → FieldDef 映射（30+ 类型）+ 列名启发式 + 三策略降级 |
| `src/utils/supabaseAdapter.ts` | 178 | Supabase 扁平行 ↔ DataRecord 双向转换 |

### 关键设计

- **零依赖**：定义 `SupabaseQueryBuilder` 最小接口，不引入 `@supabase/supabase-js`
- **三策略 Schema 自省**：RPC `get_table_columns()` → `information_schema` 直查 → sample row 推断
- **12 种 FilterOperator 完整映射**：equals→eq, contains→ilike, is_empty→is.null 等

### 已验证

- 使用 `flow_tasks` 表（3917 条，40 列）完成全链路验证
- PostgREST select/filter/ilike/or/order/range 全部通过
- RPC `get_table_columns` 已部署到 Supabase

---

## 三、内容展示 + 工具栏（Phase 2）

> Task: ONEUI-FE-00070

### 新增组件

| 组件 | 文件 | 功能 |
|------|------|------|
| FieldMarkdownPreview | `field/FieldMarkdownPreview.vue` | 表格单元格 markdown 截断预览（stripMarkdown + line-clamp） |
| TableToolbar | `table/TableToolbar.vue` | 整合视图切换/筛选/排序/分组/列管理/搜索的一站式工具栏 |

### 修改组件

| 组件 | 变更 |
|------|------|
| FieldCell | richtext 类型非编辑态自动使用 FieldMarkdownPreview |
| DetailSheet | 新增 `contentFields`/`fullPage`/`readonly` props，属性区 + markdown 正文区分离 |

---

## 四、视图管理（Phase 3）

> Task: ONEUI-ARCH-00022

| 文件 | 功能 |
|------|------|
| `composables/useViewPersistence.ts` | ViewConfig 保存/加载/切换/复制/删除，localStorage + Supabase 双后端 |
| `composables/useSearch.ts` | 防抖搜索 + highlightText 分段 + 客户端 filterBySearch |
| `base/SearchHighlight.vue` | `<mark>` 高亮渲染组件 |

---

## 五、视图接口对齐（Phase 4）

> Task: ONEUI-FE-00071

所有视图组件现在统一接受 `records + schema + view` 三件套：

| 组件 | 新增 props | 自动从 ViewConfig 读取 | 自动从 Schema 推断 |
|------|-----------|----------------------|-------------------|
| KanbanBoard | `schema`, `view` | kanbanFieldId | select options → laneOrder + laneTitles |
| GalleryView | `schema`, `view` | galleryCoverFieldId, galleryCardFields | visibleFields 兜底 |
| GanttTimeline | 已有 viewConfig，现激活 | sorts[0] 排序 | — |

新增适配器：`buildGanttItems()` — DataRecord[] → GanttItem[]

**消费者现在只需：**
```vue
<DataTable     v-if="v.viewType === 'table'"    :records :schema :view="v" />
<KanbanBoard   v-if="v.viewType === 'kanban'"   :records :schema :view="v" />
<GalleryView   v-if="v.viewType === 'gallery'"  :records :schema :view="v" />
<GanttTimeline v-if="v.viewType === 'timeline'" :records :schema :view="v" />
```

---

## 六、Schema 交互（Phase 5）

> Task: ONEUI-ARCH-00023

### 新增组件

| 组件 | 功能 |
|------|------|
| FieldTypePicker | 18 种字段类型分 6 类选择器，支持搜索 |
| ColumnHeaderMenu | 列头右键菜单：重命名/改类型/排序/隐藏/复制/删除 |

### DataTable 新增

| 新增项 | 说明 |
|--------|------|
| `enableFieldManagement` prop | 开启列头菜单 + 添加字段按钮 |
| `schema-add-field` event | 用户点 "+" 选择字段类型 |
| `schema-rename-field` event | 列头菜单重命名 |
| `schema-change-field-type` event | 切换字段类型 |
| `schema-hide-field` event | 隐藏列 |
| `schema-delete-field` event | 删除列 |
| `schema-duplicate-field` event | 复制列 |

---

## 七、页面级方案补齐（Phase 6）

> Plan: deee1d2b-80cf-4350-8037-ddecf7196298

### 新增能力

| 能力 | 文件 | 说明 |
|------|------|------|
| `useDatabaseView` | `src/composables/useDatabaseView.ts` | 页面级状态编排，支持 `local/provider` 双模式、active view、selected record、detail open/close、refresh |
| `DatabaseView` | `src/components/database/DatabaseView.vue` | 页面级容器，统一承接 `table / kanban / gallery / timeline / detail` |
| 页面级导出 | `src/components/database/index.ts`, `src/index.ts`, `src/composables/index.ts` | 将页面层能力对外暴露给业务项目 |
| focused QA | `src/tests/database-view.integration.spec.ts` | 覆盖页面层视图切换、provider 驱动、selectedRecord/detail workflow |

### 页面层统一能力

1. `TableToolbar` 与主视图切换统一由页面层承接
2. `loading / empty / error / normal` 四态统一透传
3. `selectedRecord -> detail workspace` 链路已在页面层闭环
4. `local/provider` 双模式均已验证

### 已验证

- `pnpm type-check`
- `pnpm test`
- `pnpm build`
- `pnpm lint:style`
- `pnpm lint` 无 error
- `npm publish --dry-run`
- `npm pack`

---

## 八、已知问题

| 问题 | 级别 | 状态 |
|------|------|------|
| FieldCell 的 FieldType 枚举 `"multiselect"` 与 types/index.ts 的 `"multi_select"` 不一致 | Medium | 待统一 |
| `pnpm lint` 仍有 335 条 warning | Low | 不阻塞发布，后续做代码质量治理 |
| 30 个新文件未经集成测试 | Medium | TypeScript 零错误已验证 |

---

## 九、FlowAPI 追踪

| 资源 | ID |
|------|-----|
| Plan | 25408665-d6ef-4740-a40b-acc6069cd715 |
| 页面级方案 Plan | deee1d2b-80cf-4350-8037-ddecf7196298 |
| 页面契约 Task | ONEUI-ARCH-00024 |
| 状态编排 Task | ONEUI-FE-00081 |
| 页面组件 Task | ONEUI-FE-00082 |
| Demo/README Task | ONEUI-FE-00083 |
| Focused QA Task | ONEUI-QA-00004 |
| Phase 0 Task | ONEUI-FE-00069 |
| Phase 1 Task | ONEUI-ARCH-00021 |
| Phase 2 Task | ONEUI-FE-00070 |
| Phase 3 Task | ONEUI-ARCH-00022 |
| Phase 4 Task | ONEUI-FE-00071 |
| Phase 5 Task | ONEUI-ARCH-00023 |
| 胶水层 Issue | ONEUI-FE-00072 |
| release_candidate memo | 29793 |
