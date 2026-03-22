# OneFlow UI

> [English README](./README.en.md)

[![npm version](https://img.shields.io/npm/v/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![npm downloads](https://img.shields.io/npm/dm/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![license](https://img.shields.io/npm/l/@oneflowui/ui.svg)](https://github.com/qixi54/oneui/blob/main/LICENSE)

Vue 3 + TypeScript 任务管理视图组件库，75 个组件开箱即用。

**包含**：Table、Kanban、Gantt 甘特图、Gallery、AI Chat、Dashboard 图表、Rich Text Editor、Form Designer、MermaidChart、Toast 等。

---

## 预览

<table>
  <tr>
    <td align="center"><b>Kanban 看板</b></td>
    <td align="center"><b>DataTable 数据表格</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/kanban.png" alt="Kanban" /></td>
    <td><img src="screenshots/table.png" alt="DataTable" /></td>
  </tr>
  <tr>
    <td align="center"><b>Gantt 甘特图</b></td>
    <td align="center"><b>Dashboard 仪表盘</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/gantt.png" alt="Gantt" /></td>
    <td><img src="screenshots/dashboard.png" alt="Dashboard" /></td>
  </tr>
  <tr>
    <td align="center"><b>AI Chat 对话组件</b></td>
    <td align="center"><b>DetailLayout 详情页</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/ai.png" alt="AI Chat" /></td>
    <td><img src="screenshots/detail.png" alt="Detail" /></td>
  </tr>
  <tr>
    <td align="center"><b>RichTextEditor 富文本</b></td>
    <td align="center"><b>MermaidChart 图表</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/editor.png" alt="Editor" /></td>
    <td><img src="screenshots/mermaid.png" alt="Mermaid" /></td>
  </tr>
</table>

---

## 安装

```bash
# pnpm（推荐）
pnpm add @oneflowui/ui

# npm
npm install @oneflowui/ui

# yarn
yarn add @oneflowui/ui
```

安装 peer dependencies（按需）：

```bash
pnpm add vue
pnpm add mermaid   # 使用 MermaidChart 时需要
```

---

## 快速开始

### 全局注册

```ts
import { createApp } from 'vue'
import App from './App.vue'
import OneflowUI from '@oneflowui/ui/plugin'
import '@oneflowui/ui/styles'

const app = createApp(App)
app.use(OneflowUI)
app.mount('#app')
```

### 按需引入

```ts
import { KanbanBoard, DataTable, AiMessageList, MermaidChart } from '@oneflowui/ui'
import '@oneflowui/ui/styles'
```

说明：从 `0.5.4` 开始，`plugin` 入口与根入口解耦。全局注册走 `@oneflowui/ui/plugin`，命名导入继续走 `@oneflowui/ui`。

### 主题层

OneUI 当前默认提供一套中性主题，并允许在不改组件逻辑的前提下切换到上层产品皮肤。

- 默认主题：`neutral`
- 可选皮肤：`ops-console`

推荐做法是让组件继续消费统一 token，然后由应用层切换主题，而不是直接覆盖组件内部样式。

```ts
import '@oneflowui/ui/styles'

document.documentElement.dataset.ofTheme = 'neutral'
// 或
document.documentElement.dataset.ofTheme = 'ops-console'
```

这套结构的目标是：

1. 组件默认保持中性、可复用
2. 业务系统通过主题皮肤注入品牌感或中控台气质
3. 后续可继续扩展更多主题，而不需要修改组件 API

### 局部主题作用域

如果同一页面里需要并存两种视觉语境，可以在局部 wrapper 上使用 `data-of-theme-scope`。
这个属性会让 wrapper 及其子树继承对应主题 token，而不影响外层全局主题。

```vue
<template>
  <div>
    <section class="page-shell">
      <DataTable :rows="rows" :columns="columns" />
    </section>

    <aside class="ops-preview" data-of-theme-scope="ops-console">
      <div class="ops-preview__panel">
        <h3>局部 ops-console 预览</h3>
        <p>这里会继承 ops-console 的 token，而外层仍然保持全局 neutral。</p>
      </div>
    </aside>
  </div>
</template>
```

可选值与全局主题保持一致，当前支持：

- `neutral`
- `ops-console`

在需要更明确的表达时，也可以同时保留 `data-of-theme` 作为显式声明：

```vue
<aside data-of-theme="ops-console" data-of-theme-scope="ops-console">
  ...
</aside>
```

---

## 页面级方案

当前已经支持直接从包里接入页面级入口：

```ts
import { DatabaseView, useDatabaseView } from '@oneflowui/ui'
```

`DatabaseView` 负责统一页面容器，`useDatabaseView` 负责页面状态编排。`dev` app 也已经接入这条链路，
用于证明 `local/provider` 双模式、视图切换、selected record 与 detail workspace 可以在同一页面层里闭环。
当前页面级契约还把 `detailPresentation` 和 `density` 作为明确的对齐方向：桌面端优先右侧 workspace，
移动端保留 sheet fallback；页面密度则统一按 `compact / standard / comfortable` 三档表达。

```ts
const view = useDatabaseView({
  mode: 'provider',
  schemaSource,
  dataSource,
  actions: {
    onFetch,
    onRefresh,
    onUpdateRecord,
    onCreateRecord,
    onDeleteRecord,
    onSaveView,
    onSchemaChange,
  },
})
```

### 模式

- `local` 模式：外部直接传 `schema + records + view`，页面只负责筛选、排序、切视图和展示状态，不触发远程请求。
- `provider` 模式：外部传入数据获取/刷新能力，页面 shell 只消费 provider 返回的 `schema / records / views`，不绑定具体后端实现。

### actions 契约

页面级方案只回传动作，不在组件内部写死业务逻辑。常见契约如下：

```ts
type DatabaseViewActions = {
  onFetch?: (params: { viewId: string }) => Promise<void> | void
  onRefresh?: () => Promise<void> | void
  onUpdateRecord?: (recordId: string, patch: Record<string, unknown>) => Promise<void> | void
  onCreateRecord?: (record: Record<string, unknown>) => Promise<void> | void
  onDeleteRecord?: (recordId: string) => Promise<void> | void
  onSaveView?: (viewId: string, payload: Record<string, unknown>) => Promise<void> | void
  onSchemaChange?: (payload: Record<string, unknown>) => Promise<void> | void
}
```

如果接入的是 `provider` 模式，建议把 `onFetch` / `onRefresh` 作为必配项；如果接入的是 `local` 模式，则重点只需要保证 `onUpdateRecord`、`onCreateRecord`、`onDeleteRecord` 和 `onSaveView` 这几类页面动作可回传。

### Selected record / detail workspace

当前 dev app 已经把“选中记录 -> detail workspace”这条链路接起来了：点击 table / kanban / gallery / timeline 中的条目，会把当前记录送入详情工作区，再由 `DetailLayout`、`PropPanel`、`CommentItem` 这组组件展示主内容、属性和活动记录。

这证明页面级方案已经具备“列表视图 + 选中态 + 详情工作区”的最小闭环，并且可以作为业务页面底座直接接入。

### `detailPresentation` / `density`

页面级方案在语义上继续收敛两个关键契约：

- `detailPresentation`：用于描述详情工作区的呈现方式，默认思路是桌面端 `side-panel`、移动端 `sheet`。
- `density`：用于统一页面与表格的视觉密度语义，建议仅使用 `compact`、`standard`、`comfortable` 三档。

这两个契约的目标不是替换现有组件，而是让页面层把右侧工作区、行高密度和默认布局策略收成一致的入口语义。

### 已支持 / 暂未支持

| 已支持 | 暂未支持 |
|---|---|
| `local/provider` 两种模式的页面壳层接入 | 真实 provider 数据闭环、权限与持久化策略 |
| `normal / loading / empty / error` 四态透传 | 写操作的最终落库与回滚编排 |
| `table / kanban / gallery / timeline` 多视图切换 | 可编辑 detail workspace 的最终保存、ACL、schema 管理后台 |
| `search / filter / sort / group / save-view / load-view` 工具栏契约 | 远程视图保存、跨端同步与更重的页面编排 |
| `schema + records + viewConfig` 数据驱动 | 业务应用侧自定义的 provider 适配层 |
| `selected record -> detail workspace` 页面链路 | detail 编辑后的最终提交、乐观更新、冲突处理 |

---

## 组件一览

| 分类 | 组件 |
|------|------|
| **视图** | DataTable, KanbanBoard, GalleryView, GanttTimeline |
| **AI 对话** | AiMessageList, AiMessageBubble, AiSender, AiThinking, AiStreamingCursor |
| **仪表盘** | Dashboard, BarChart, PieChart, DoughnutChart, NumberCard |
| **编辑器** | RichTextEditor, CodeBlock, ContentBlock |
| **详情** | DetailLayout, PropPanel, CommentItem |
| **表单** | FormDesigner, 10 种 Field 组件 |
| **布局** | AppLayout, Sidebar, Navbar, SplitPane |
| **通用** | Modal, Dialog, Toast, Tabs, Breadcrumb, MermaidChart, ContextMenu |

---

## 使用示例

### KanbanBoard

```vue
<KanbanBoard
  :records="records"
  kanban-field-id="stage"
  :lane-order="['todo', 'doing', 'done']"
  :lane-titles="{ todo: '待处理', doing: '进行中', done: '已完成' }"
/>
```

### AI 聊天面板

```vue
<script setup>
import { AiMessageList, AiSender } from '@oneflowui/ui'
import { useAiChat } from '@oneflowui/ui'

const { messages, isThinking, send } = useAiChat({
  onRequest: async (content) => {
    // 接入你的 AI 服务
  }
})
</script>

<template>
  <AiMessageList :messages="messages" :is-thinking="isThinking" />
  <AiSender @send="send" />
</template>
```

### GanttTimeline

```vue
<GanttTimeline
  :items="ganttItems"
  start-date="2026-01-01"
  end-date="2026-12-31"
  @item-click="onItemClick"
/>
```

### MermaidChart

```vue
<MermaidChart :code="`graph TD\n  A --> B\n  B --> C`" />
```

### DataTable

```vue
<DataTable
  :columns="[
    { key: 'title', label: '标题', width: 'fill' },
    { key: 'status', label: '状态', width: 120 },
    { key: 'priority', label: '优先级', width: 100 },
  ]"
  :rows="tasks"
  @row-click="onRowClick"
/>
```

### Toast 通知

```ts
import { useToast } from '@oneflowui/ui'

const toast = useToast()
toast.success('保存成功')
toast.error('操作失败')
```

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/qixi54/oneui.git
cd oneui

# 安装依赖
pnpm install

# 启动开发环境（端口 5174）
pnpm dev

# 类型检查
pnpm type-check

# 运行测试
pnpm test

# 构建
pnpm build
```

---

## License

MIT
