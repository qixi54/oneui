# OneFlow UI

[![npm version](https://img.shields.io/npm/v/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![npm downloads](https://img.shields.io/npm/dm/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![license](https://img.shields.io/npm/l/@oneflowui/ui.svg)](https://github.com/qixi54/oneui/blob/main/LICENSE)

Vue 3 + TypeScript 任务管理视图组件库，75 个组件开箱即用。

**包含**：Table、Kanban、Gantt 甘特图、Gallery、AI Chat、Dashboard 图表、Rich Text Editor、Form Designer、MermaidChart、Toast 等。

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
import OneflowUI from '@oneflowui/ui'
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
