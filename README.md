# OneFlow UI

[![npm version](https://img.shields.io/npm/v/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![npm downloads](https://img.shields.io/npm/dm/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![license](https://img.shields.io/npm/l/@oneflowui/ui.svg)](https://github.com/qixi54/oneui/blob/main/LICENSE)

Vue 3 + TypeScript 任务管理视图组件库，包含 Table、Kanban、Gantt、Gallery、AI Chat、Dashboard 等 75 个组件。

## 安装

```bash
# pnpm（推荐）
pnpm add @oneflowui/ui

# npm
npm install oneflow-ui

# yarn
yarn add oneflow-ui
```

## 开发与测试

```bash
# 启动开发环境（固定端口 5174）
npm run dev

# 类型检查
npm run type-check

# 集成测试
npm run test
```

## 全局注册

```ts
import { createApp } from 'vue'
import App from './App.vue'
import OneflowUI from 'oneflow-ui'
import 'oneflow-ui/styles'

const app = createApp(App)
app.use(OneflowUI)
app.mount('#app')
```

## 按需引入

```ts
import { DetailLayout, PropPanel, DataTable } from 'oneflow-ui'
import 'oneflow-ui/styles'
```

## 样式引入

```ts
// 在入口文件引入 CSS 变量和基础样式
import 'oneflow-ui/styles'
```

---

## 组件示例

### KanbanBoard

```vue
<KanbanBoard
  :columns="[
    { id: 'todo', title: '待处理', color: '#64748B', tasks: [] },
    { id: 'in_progress', title: '进行中', color: '#2563EB', tasks: [] },
  ]"
  @task-click="onTaskClick"
  @add-task="onAddTask"
/>

<!-- 或者使用 DataRecord 配置泳道字段 -->
<KanbanBoard
  :records="records"
  kanban-field-id="stage"
  :lane-order="['todo', 'doing', 'done']"
  :lane-titles="{ todo: '待处理', doing: '进行中', done: '已完成' }"
/>
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

### GalleryView

```vue
<GalleryView
  :items="galleryItems"
  @card-click="onCardClick"
/>

<!-- 或者使用 DataRecord 配置封面字段 -->
<GalleryView
  :records="records"
  cover-field-id="coverUrl"
  :card-field-ids="['assignee', 'priority']"
/>
```

### GanttTimeline

```vue
<GanttTimeline
  :items="ganttItems"
  :start-date="'2026-01-01'"
  :end-date="'2026-12-31'"
  @item-click="onItemClick"
/>
```

### DetailLayout

```vue
<DetailLayout
  :task="currentTask"
  v-model:description-content="detailDescription"
  :description-editable="true"
  :comments="comments"
  :prop-items="[
    { key: '状态', value: '进行中' },
    { key: '优先级', value: 'P1' },
    { key: '负责人', value: '张三' },
    { key: '截止日期', value: '2026-06-30' },
  ]"
/>
```

### CodeBlock

```vue
<CodeBlock
  language="typescript"
  :code="sourceCode"
/>
```

---

## 集成测试覆盖（Task 2.4）

- 三层数据模型：`TableSchema + DataRecord + ViewConfig` 联动可用
- Table + Detail：表格点击事件与详情渲染链路可用
- Dashboard 甘特图：空态/有数据态渲染与点击事件可用

对应测试文件：
- `src/tests/three-layer-model.integration.spec.ts`
- `src/tests/table-detail.integration.spec.ts`
- `src/tests/gantt.integration.spec.ts`
