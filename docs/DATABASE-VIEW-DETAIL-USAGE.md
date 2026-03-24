---
生成时间: 2026-03-22 22:16:31
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.8.6.md, issue:ONEUI-FE-VUE-00004
角色定义: /opt/Oneflow/flowlab/项目/oneui/code/develop/AGENTS.md
文档生成目的: 为业务仓提供 DatabaseView detail 的外部接入契约、呈现约定和最小示例
生成模型: GPT-5
---

# DatabaseView Detail Usage Guide

这份指南面向业务仓，说明如何把 `DatabaseView detail` 作为稳定的页面级能力接入，而不是在各个业务页里重复拼装 detail 壳层。

## 契约总览

`DatabaseView detail` 可以用三个词描述：`source`、`target`、`presentation`。

- `source`：用户从哪里进入 detail，例如 `list`、`dashboard`、`notifications`。
- `target`：要打开哪条记录，通常是稳定的 `recordId`，必要时再加 `viewId` 或业务上下文键。
- `presentation`：detail 打开后用什么形态承载，常见值是 `side-panel`、`sheet`、`full-page`，也可以让页面层按 `auto` 自己决定。

业务仓的原则是：先固定 `target`，再决定 `presentation`，不要把 UI 形态写死成唯一入口。

## Presentation 选择

| 场景 | 推荐 presentation | 说明 |
|---|---|---|
| `list` 中的行点击 | `side-panel` | 保留列表上下文，适合快速查看和轻量编辑 |
| 移动端或窄屏 | `sheet` | 交互成本更低，和桌面端保持同一条 deep link 语义 |
| `notifications` 深链 | `full-page` | 用户是从异步入口进入，通常更适合完整上下文和更长任务链路 |
| `dashboard` 钻取 | `side-panel` 或 `full-page` | 如果还要回看仪表板上下文，用 `side-panel`；如果是独立处理页，用 `full-page` |

默认建议是：桌面端优先 `side-panel`，移动端优先 `sheet`，只有页面明确需要独立详情工作流时才用 `full-page`。

## Deep Link 规则

Deep link 不是只传一个 id，而是把 `source`、`target`、`presentation` 一起表达清楚。

推荐规则：

1. `source` 只描述入口，不描述 UI 形态。
2. `target` 只描述被打开的记录，不夹带临时视觉状态。
3. `presentation` 只描述当前这次打开的承载方式。
4. 如果页面允许记忆用户偏好，优先记住 `presentation` 和 panel 宽度，不要把记录内容缓存成长期真源。

## Workspace Persistence

workspace persistence 的目标是保留用户的操作习惯，而不是保留陈旧数据。

建议持久化的内容：

- `activeViewId`
- `selectedRecordId`
- `detailPresentation`
- `sidePanelWidth`
- `drawerWidth`
- 必要的搜索词或 filter state

不建议持久化的内容：

- 实体记录本体
- 依赖实时权限的展示结果
- 只在一次 deep link 中成立的临时上下文

实践上，最稳妥的做法是给每个 workspace 一个稳定 key，例如 `app + entity + route` 或 `tableId + viewId`，这样同一业务页刷新后仍然能回到相同的 detail 位置和呈现方式。

## 最小示例

### `list` 入口

当用户在列表中点击某一行时，推荐保持列表和 detail 同屏：

```vue
<template>
  <DatabaseView
    table-id="orders"
    detail-presentation="auto"
    :selected-record-id="selectedRecordId"
    @update:selected-record-id="selectedRecordId = $event"
  />
</template>
```

### `notifications` 入口

当用户从通知进入时，通常应该直接落到可独立阅读的页面级 detail：

```ts
function openFromNotification(notification: {
  sourceRecordId: string
  source: "notifications"
}) {
  router.push({
    name: "order-detail",
    query: {
      source: notification.source,
      recordId: notification.sourceRecordId,
      presentation: "full-page",
    },
  })
}
```

### `dashboard` 入口

当用户从仪表板钻取到某个记录时，优先保留 dashboard 语境：

```ts
function openFromDashboard(card: { recordId: string }) {
  router.push({
    name: "orders",
    query: {
      source: "dashboard",
      recordId: card.recordId,
      presentation: "side-panel",
    },
  })
}
```

## 平台级 Detail Primitive

从 `v0.8.6` 开始，OneUI 额外提供 3 个可直接复用的 detail primitive，避免业务仓重复手写 action / preview / activity 模板：

- `WorkspaceDetailActionBar`
- `WorkspaceDetailPreviewBlock`
- `WorkspaceActivityFeed`

推荐做法是：业务仓继续决定 `source / target / presentation`，但把 detail 内部的通用区块交给这些 primitive 渲染，自己只传结构化数据。

### 记录型详情最小示例

下面这个例子适合 `task / issue / order` 这类记录型详情。业务仓只准备 action、preview、activity 三组数据，然后通过 `DatabaseView` 的 detail slots 接进去：

```vue
<script setup lang="ts">
import {
  DatabaseView,
  WorkspaceActivityFeed,
  WorkspaceDetailActionBar,
  WorkspaceDetailPreviewBlock,
} from "@oneflowui/ui"

const detailActions = [
  { id: "assign", label: "分配", tone: "primary" },
  { id: "archive", label: "归档", tone: "ghost" },
]

const previewItems = [
  { id: "status", label: "状态", value: "处理中", tone: "info" },
  { id: "priority", label: "优先级", value: "P1", tone: "warning" },
]

const activityItems = [
  { id: "1", author: "Ada", action: "更新了状态", content: "处理中 → 已完成", time: "2m ago" },
]
</script>

<template>
  <DatabaseView table-id="issues">
    <template #actions>
      <WorkspaceDetailActionBar :actions="detailActions" />
    </template>

    <template #preview="{ title, description }">
      <WorkspaceDetailPreviewBlock
        :title="title"
        :content="description"
        :items="previewItems"
      />
    </template>

    <template #activity>
      <WorkspaceActivityFeed :items="activityItems" />
    </template>
  </DatabaseView>
</template>
```

## 推荐边界

`DatabaseView detail` 负责的是统一的 detail 工作区接入、呈现和状态回填。

业务仓应该自己决定：

- 入口从 `list`、`dashboard`、`notifications` 中哪一个进入
- 记录 id 如何映射成路由参数或 query
- 是否把某个 detail 变成独立页面

OneUI 平台负责的是：

- `side-panel` / `sheet` / `full-page` 的一致语义
- deep link 打开后 detail workspace 的稳定行为
- workspace persistence 的基础能力

如果你只想给业务仓一个可复用入口，先从 `source + target + presentation` 这三元组开始，不要先造一套新的页面级协议。
