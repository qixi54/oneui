# ONEUI-INDEX.md

---
生成时间: 2026-03-15 18:00:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src
文档路径: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/ONEUI-INDEX.md
文档生成目的: OneUI 组件库完整 API 索引，覆盖全部 Vue 组件与 Composables
生成模型: claude-sonnet-4-6
---

## 目录

- [AI 组件](#ai-组件)
- [Auxiliary 辅助组件](#auxiliary-辅助组件)
- [Base 基础组件](#base-基础组件)
- [Breadcrumb 面包屑](#breadcrumb-面包屑)
- [ContextMenu 右键菜单](#contextmenu-右键菜单)
- [Dashboard 仪表板](#dashboard-仪表板)
- [Detail 详情页](#detail-详情页)
- [Editor 编辑器](#editor-编辑器)
- [Field 字段编辑器](#field-字段编辑器)
- [Form 表单](#form-表单)
- [Gallery 画廊](#gallery-画廊)
- [Kanban 看板](#kanban-看板)
- [Layout 布局](#layout-布局)
- [Mermaid 图表](#mermaid-图表)
- [Overlay 弹层](#overlay-弹层)
- [Split 分栏](#split-分栏)
- [Table 数据表格](#table-数据表格)
- [Tabs 标签页](#tabs-标签页)
- [Timeline 时间轴](#timeline-时间轴)
- [Toast 通知](#toast-通知)
- [Composables](#composables)

---

## AI 组件

### AiMessageBubble

**路径**: `src/components/ai/AiMessageBubble.vue`

**用途**: AI 消息气泡，展示 AI 回复内容，支持流式状态和错误状态。

**Props**:
```ts
{
  content: string          // 消息内容
  isStreaming?: boolean    // 是否正在流式输出，默认 false
  isError?: boolean        // 是否为错误消息，默认 false
  avatar?: string          // 头像 URL
  name?: string            // 显示名称
  timestamp?: string       // 时间戳字符串
}
```

**Events**: 无

**Slots**: 无

**示例**:
```vue
<AiMessageBubble content="你好！我是 AI 助手。" :is-streaming="false" name="Assistant" />
```

---

### AiMessageList

**路径**: `src/components/ai/AiMessageList.vue`

**用途**: AI 消息列表，使用虚拟滚动渲染大量消息，自动滚动到底部。

**Props**:
```ts
{
  messages: AiMessage[]    // 消息数组（{ id, role, content, isStreaming?, ... }）
  isThinking?: boolean     // 是否显示思考动画，默认 false
}
```

**Events**: 无

**Slots**: 无

**示例**:
```vue
<AiMessageList :messages="chatMessages" :is-thinking="isGenerating" />
```

---

### AiSender

**路径**: `src/components/ai/AiSender.vue`

**用途**: AI 输入发送框，支持多行输入、快捷键发送、工具插槽。

**Props**:
```ts
{
  placeholder?: string    // 占位文本，默认 "发送消息..."
  disabled?: boolean      // 是否禁用，默认 false
  maxRows?: number        // 最大行数，默认 6
}
```

**Events**:
```ts
send(content: string)    // 发送内容
cancel()                 // 取消（停止生成）
```

**Slots**:
- `#tools` — 工具栏左侧按钮区域
- `#prefix` — 输入框前缀区域

**示例**:
```vue
<AiSender placeholder="输入问题..." @send="handleSend" @cancel="handleCancel">
  <template #tools>
    <button>附件</button>
  </template>
</AiSender>
```

---

### AiStreamingCursor

**路径**: `src/components/ai/AiStreamingCursor.vue`

**用途**: 打字光标动画，在流式输出时显示闪烁光标。

**Props**:
```ts
{
  visible?: boolean    // 是否显示，默认 true
}
```

**Events**: 无

**Slots**: 无

**示例**:
```vue
<AiStreamingCursor :visible="isStreaming" />
```

---

### AiThinking

**路径**: `src/components/ai/AiThinking.vue`

**用途**: 三点思考动画，表示 AI 正在生成中。

**Props**:
```ts
{
  size?: "sm" | "md"    // 尺寸，默认 "md"
}
```

**Events**: 无

**Slots**: 无

**示例**:
```vue
<AiThinking size="sm" />
```

---

### UserMessageBubble

**路径**: `src/components/ai/UserMessageBubble.vue`

**用途**: 用户消息气泡，右对齐显示用户发送的消息。

**Props**:
```ts
{
  content: string        // 消息内容
  timestamp?: string     // 时间戳字符串
  avatar?: string        // 头像 URL
}
```

**Events**: 无

**Slots**: 无

**示例**:
```vue
<UserMessageBubble content="请解释一下虚拟列表的原理" timestamp="14:23" />
```

---

## Auxiliary 辅助组件

### ColorPanel

**路径**: `src/components/auxiliary/ColorPanel.vue`

**用途**: 颜色选择面板，支持预设色板和自定义输入。

**Props**:
```ts
{
  modelValue: string       // 当前颜色值（十六进制）
  presets?: string[]       // 预设颜色数组
  showInput?: boolean      // 是否显示输入框，默认 true
  disabled?: boolean       // 是否禁用，默认 false
  label?: string           // 标签文字
}
```

**Events**:
```ts
"update:modelValue"(value: string)
change(value: string)
```

**示例**:
```vue
<ColorPanel v-model="color" :presets="['#ff0000', '#00ff00']" />
```

---

### FileUpload

**路径**: `src/components/auxiliary/FileUpload.vue`

**用途**: 文件上传拖拽区，支持多文件、类型限制、数量上限。

**Props**:
```ts
{
  modelValue?: File[]      // 当前文件列表
  multiple?: boolean       // 是否多选，默认 false
  accept?: string          // 接受的文件类型，如 "image/*"
  maxCount?: number        // 最大文件数量
  disabled?: boolean       // 是否禁用，默认 false
  hint?: string            // 提示文字
}
```

**Events**:
```ts
"update:modelValue"(value: File[])
change(value: File[])
```

**示例**:
```vue
<FileUpload v-model="files" multiple accept="image/*" :max-count="5" hint="最多上传5张图片" />
```

---

### PersonPanel

**路径**: `src/components/auxiliary/PersonPanel.vue`

**用途**: 负责人选择面板，从预设人员列表中选择一个负责人。

**Props**:
```ts
{
  modelValue?: string | null    // 当前选中的人员 id
  people: PersonOption[]        // 人员列表（{ id, name, avatar? }）
  placeholder?: string          // 占位文本，默认 "选择负责人"
  disabled?: boolean            // 是否禁用，默认 false
}
```

**Events**:
```ts
"update:modelValue"(value: string | null)
change(value: string | null)
```

**示例**:
```vue
<PersonPanel v-model="assignee" :people="teamMembers" />
```

---

## Base 基础组件

### Accordion

**路径**: `src/components/base/Accordion.vue`

**用途**: 折叠面板，支持单选/多选展开、懒加载内容。

**Props**:
```ts
{
  items: AccordionItem[]              // 面板项列表（{ key, label, content?, disabled? }）
  modelValue?: string | string[]      // 当前展开的 key（单选 string / 多选 string[]）
  multiple?: boolean                  // 是否允许多项同时展开，默认 false
  lazy?: boolean                      // 是否懒加载内容，默认 false
}
```

**Events**:
```ts
"update:modelValue"(value: string | string[])
```

**Slots**:
- `#default(item)` — 自定义内容区域
- `#trigger(item, open)` — 自定义触发器

**示例**:
```vue
<Accordion v-model="openKey" :items="panels">
  <template #default="{ item }">
    <p>{{ item.content }}</p>
  </template>
</Accordion>
```

---

### AddViewBtn

**路径**: `src/components/base/AddViewBtn.vue`

**用途**: 添加视图按钮，带加号图标的虚线按钮。

**Props**: 无

**Events**:
```ts
click(event: MouseEvent)
```

**示例**:
```vue
<AddViewBtn @click="openNewViewModal" />
```

---

### Avatar

**路径**: `src/components/base/Avatar.vue`

**用途**: 头像组件，使用姓名首字母生成彩色头像，可显示角色标签。

**Props**:
```ts
{
  name: string         // 用户名（取首字母显示）
  size?: number        // 尺寸 px，默认 28
  color?: string       // 文字颜色
  bg?: string          // 背景颜色
  role?: string        // 角色标签
}
```

**Events**: 无

**Slots**: 无

**示例**:
```vue
<Avatar name="张三" :size="36" role="设计师" />
```

---

### Badge

**路径**: `src/components/base/Badge.vue`

**用途**: 徽章标签，支持自定义颜色和优先级语义色。

**Props**:
```ts
{
  color?: string                        // 自定义颜色（CSS 颜色值）
  priority?: "P0" | "P1" | "P2" | "P3" // 优先级语义色
  size?: "sm" | "md"                    // 尺寸，默认 "md"
}
```

**Slots**:
- `#default` — 标签文字内容

**示例**:
```vue
<Badge priority="P0">紧急</Badge>
<Badge color="#6366f1">自定义</Badge>
```

---

### ButtonGroup

**路径**: `src/components/base/ButtonGroup.vue`

**用途**: 按钮组选择器，单选模式，选中项高亮。

**Props**:
```ts
{
  options: ButtonOption[]           // 选项列表（{ value, label, icon? }）
  modelValue: string | number       // 当前选中值
}
```

**Events**:
```ts
"update:modelValue"(value: string | number)
```

**示例**:
```vue
<ButtonGroup v-model="view" :options="[{value:'list',label:'列表'},{value:'grid',label:'网格'}]" />
```

---

### ChainItem

**路径**: `src/components/base/ChainItem.vue`

**用途**: 链路节点卡片，用于展示流程链路的来源或结果节点。

**Props**:
```ts
{
  type?: "source" | "result"    // 节点类型，影响样式
  title: string                  // 主标题
  description?: string           // 描述文字
  avatar?: string                // 头像 URL
  duration?: string              // 耗时信息
  color?: string                 // 文字颜色
  bg?: string                    // 背景颜色
  borderColor?: string           // 边框颜色
}
```

**Events**: 无

**Slots**: 无

---

### DescBlock

**路径**: `src/components/base/DescBlock.vue`

**用途**: 描述信息块容器，带左边框样式的内容区域。

**Props**: 无

**Slots**:
- `#default` — 内容区域

**示例**:
```vue
<DescBlock>
  <p>这是一段描述信息...</p>
</DescBlock>
```

---

### DropdownMenu

**路径**: `src/components/base/DropdownMenu.vue`

**用途**: 行操作下拉菜单，点击触发按钮展示菜单项。

**Props**:
```ts
{
  items: MenuItem[]    // 菜单项列表（{ key, label, icon?, danger?, disabled? }）
}
```

**Events**: 无（通过 `items` 传入 `onClick` 回调）

**示例**:
```vue
<DropdownMenu :items="[{key:'edit',label:'编辑'},{key:'delete',label:'删除',danger:true}]" />
```

---

### EmptyState

**路径**: `src/components/base/EmptyState.vue`

**用途**: 空状态提示，显示图标、标题、描述和可选操作按钮。

**Props**:
```ts
{
  icon?: string | Component           // 图标（字符串 emoji 或 Vue 组件）
  title: string                        // 主标题
  description?: string                 // 描述文字
  action?: EmptyStateAction            // 操作按钮（{ label, onClick }）
}
```

**Events**: 无

**示例**:
```vue
<EmptyState title="暂无数据" description="请添加第一条记录" :action="{ label: '添加', onClick: add }" />
```

---

### InfoCard

**路径**: `src/components/base/InfoCard.vue`

**用途**: 信息卡片，支持 memo/notify/history 三种变体，可显示标签、重要性、未读状态等。

**Props**:
```ts
{
  variant?: "memo" | "notify" | "history"    // 变体类型，默认 "memo"
  title: string                               // 卡片标题
  content?: string                            // 内容文本
  contentLines?: number                       // 内容最大行数
  borderColor?: string                        // 左边框颜色
  tags?: string[]                             // 标签数组
  importance?: "normal" | "high"             // 重要性
  author?: string                             // 作者
  date?: string                               // 日期
  unread?: boolean                            // 是否未读
  meta?: string                               // 元信息
  subtitle?: string                           // 副标题
  type?: string                               // 类型标识
  typeColor?: string                          // 类型颜色
}
```

**Events**:
```ts
click(e: MouseEvent)
```

**Slots**:
- `#actions` — 操作按钮区域
- `#footer` — 卡片底部
- `#icon` — 图标区域

---

### MonitorItem

**路径**: `src/components/base/MonitorItem.vue`

**用途**: 进度监控项，带进度条和标签，可点击。

**Props**:
```ts
{
  label: string          // 主标签
  subtitle?: string      // 副标签
  value: number          // 进度值（0-100）
  count?: string         // 计数文字
  color?: string         // 进度条颜色
  clickable?: boolean    // 是否可点击，默认 false
}
```

**Events**:
```ts
click()
```

---

### PersonaCard

**路径**: `src/components/base/PersonaCard.vue`

**用途**: 人物角色卡片，可展开/折叠，支持激活、完成、禁用状态。

**Props**:
```ts
{
  name: string            // 角色名称
  title?: string          // 职位/头衔
  icon?: string           // 图标 emoji
  color?: string          // 主题颜色
  subtitle?: string       // 副标题
  tags?: string[]         // 标签列表
  expanded?: boolean      // 是否展开，默认 false
  active?: boolean        // 是否激活
  done?: boolean          // 是否完成
  disabled?: boolean      // 是否禁用
  size?: "sm" | "md"      // 尺寸，默认 "md"
}
```

**Events**:
```ts
"update:expanded"(value: boolean)
click()
```

**Slots**:
- `#badge` — 徽章区域
- `#actions` — 操作按钮区域
- `#default` — 展开内容区域

---

### ProgressBar

**路径**: `src/components/base/ProgressBar.vue`

**用途**: 进度条组件，支持自定义颜色、高度和标签。

**Props**:
```ts
{
  value: number           // 进度值（0-100）
  height?: number         // 高度 px，默认 8
  color?: string          // 进度条颜色
  bgColor?: string        // 背景颜色
  showLabel?: boolean     // 是否显示标签，默认 false
  borderRadius?: number   // 圆角 px，默认 4
}
```

**Slots**:
- `#default` — 自定义标签内容（`showLabel` 为 true 时生效）

---

### RangeSlider

**路径**: `src/components/base/RangeSlider.vue`

**用途**: 范围滑块，带标签和描述文字。

**Props**:
```ts
{
  label: string           // 标签文字
  modelValue: number      // 当前值
  min: number             // 最小值
  max: number             // 最大值
  step?: number           // 步长，默认 1
  description?: string    // 描述文字
}
```

**Events**:
```ts
"update:modelValue"(value: number)
```

---

### RefTag

**路径**: `src/components/base/RefTag.vue`

**用途**: 引用标签，支持 spec/wiki/task 三种类型，可配置颜色和链接。

**Props**:
```ts
{
  type?: "spec" | "wiki" | "task" | string    // 类型，影响图标和颜色
  icon?: string                                // 自定义图标
  color?: string                               // 文字颜色
  bg?: string                                  // 背景颜色
  href?: string                                // 链接 URL
}
```

**Slots**:
- `#default` — 标签文字内容

---

### SectionBlock

**路径**: `src/components/base/SectionBlock.vue`

**用途**: 章节区块，支持折叠、状态指示（pending/updating/done/editing）和编辑模式。

**Props**:
```ts
{
  title: string                                            // 区块标题
  icon?: string                                            // 图标 emoji
  status?: "pending" | "updating" | "done" | "editing"   // 状态
  collapsed?: boolean                                      // 是否折叠，默认 false
  editable?: boolean                                       // 是否可编辑，默认 false
  statusLabels?: Record<string, string>                    // 状态文字映射
}
```

**Events**:
```ts
"update:collapsed"(value: boolean)
edit()
save()
```

**Slots**:
- `#default` — 展示内容
- `#editor` — 编辑模式内容
- `#header-extra` — 标题右侧额外内容

---

### SelectBadge

**路径**: `src/components/base/SelectBadge.vue`

**用途**: 可点击选择徽章，支持颜色点和自定义颜色。

**Props**:
```ts
{
  color?: string          // 文字颜色
  dot?: boolean           // 是否显示颜色点，默认 false
  dotColor?: string       // 颜色点颜色
  textColor?: string      // 文字颜色（优先于 color）
  bgColor?: string        // 背景颜色
  borderColor?: string    // 边框颜色
  clickable?: boolean     // 是否可点击，默认 false
}
```

**Events**:
```ts
click(e: MouseEvent)
```

**Slots**:
- `#default` — 徽章文字内容

---

### StatisticCard

**路径**: `src/components/base/StatisticCard.vue`

**用途**: 统计卡片，展示图标、数值和标签。

**Props**:
```ts
{
  icon: string | Component                                        // 图标
  iconColor?: "blue" | "green" | "orange" | "red" | "purple"    // 图标颜色主题
  value: string | number                                          // 数值
  label: string                                                   // 标签文字
}
```

**Events**: 无

**示例**:
```vue
<StatisticCard :icon="TaskIcon" icon-color="blue" :value="42" label="待处理任务" />
```

---

### StatusIndicator

**路径**: `src/components/base/StatusIndicator.vue`

**用途**: 状态圆点指示器，用颜色圆点表示状态。

**Props**:
```ts
{
  status: string           // 状态值
  label?: string           // 显示文字（默认与 status 相同）
  size?: "sm" | "md"       // 尺寸，默认 "md"
}
```

**Slots**:
- `#default(status, label, color)` — 自定义渲染

---

### StatusSummary

**路径**: `src/components/base/StatusSummary.vue`

**用途**: 状态汇总栏，水平排列多个状态计数。

**Props**:
```ts
{
  items: StatusSummaryItem[]    // 汇总项（{ label, count, color, dot? }）
  size?: "sm" | "md"            // 尺寸，默认 "md"
  separator?: boolean           // 是否显示分隔符，默认 false
}
```

**Slots**:
- `#extra` — 右侧额外内容

---

### Stepper

**路径**: `src/components/base/Stepper.vue`

**用途**: 步骤条，支持水平/垂直方向。

**Props**:
```ts
{
  steps: StepItem[]                       // 步骤列表（{ key, label, description? }）
  current: number                          // 当前步骤索引（0-based）
  direction?: "horizontal" | "vertical"   // 方向，默认 "horizontal"
}
```

**Slots**:
- `#step-content(item, index, status)` — 自定义步骤内容（status: "done"|"active"|"pending"）

---

### Switch

**路径**: `src/components/base/Switch.vue`

**用途**: 开关组件，支持标签和禁用状态。

**Props**:
```ts
{
  modelValue: boolean       // 开关状态
  disabled?: boolean        // 是否禁用，默认 false
  size?: "sm" | "md"        // 尺寸，默认 "md"
  label?: string            // 右侧标签文字
}
```

**Events**:
```ts
"update:modelValue"(value: boolean)
change(value: boolean)
```

---

### ToolbarBtn

**路径**: `src/components/base/ToolbarBtn.vue`

**用途**: 工具栏按钮，带图标和文字标签，支持激活状态。

**Props**:
```ts
{
  icon: string      // 图标（emoji 或字符）
  label: string     // 按钮文字
  active?: boolean  // 是否激活，默认 false
}
```

**Events**:
```ts
click(event: MouseEvent)
```

---

### ViewModeGroup

**路径**: `src/components/base/ViewModeGroup.vue`

**用途**: 视图模式切换组（side/modal/fullscreen 三模式）。

**Props**:
```ts
{
  options?: ViewModeOption[]    // 自定义选项列表
  modelValue: string            // 当前选中模式
}
```

**Events**:
```ts
"update:modelValue"(value: string)
```

---

### ViewSwitcher

**路径**: `src/components/base/ViewSwitcher.vue`

**用途**: 视图切换工具栏，集成 Tab 切换、筛选、分组、排序、搜索按钮。

**Props**:
```ts
{
  tabs?: ViewSwitcherTab[]       // Tab 列表
  modelValue?: string            // 当前激活 Tab
  showFilter?: boolean           // 是否显示筛选按钮，默认 false
  showGroup?: boolean            // 是否显示分组按钮，默认 false
  showSort?: boolean             // 是否显示排序按钮，默认 false
  showSearch?: boolean           // 是否显示搜索框，默认 false
  filterLabel?: string           // 筛选按钮文字
  groupLabel?: string            // 分组按钮文字
  sortLabel?: string             // 排序按钮文字
  searchPlaceholder?: string     // 搜索占位文字
}
```

**Events**:
```ts
"update:modelValue"(value: string)
filter()
group()
sort()
search(query: string)
```

**Slots**:
- `#default` — 右侧自定义内容

---

### ViewTab

**路径**: `src/components/base/ViewTab.vue`

**用途**: 视图标签页，带图标和关闭按钮的 Tab 列表。

**Props**:
```ts
{
  modelValue: string          // 当前激活的 tab id
  items: ViewTabItem[]        // Tab 列表（{ id, label, icon?, closable? }）
}
```

**Events**:
```ts
"update:modelValue"(value: string)
```

---

## Breadcrumb 面包屑

### Breadcrumb

**路径**: `src/components/breadcrumb/Breadcrumb.vue`

**用途**: 面包屑导航，支持数据驱动和 Slot 自定义两种模式。

**Props**:
```ts
{
  items?: BreadcrumbItemData[]    // 面包屑数据（{ label, path?, icon? }）
  separator?: string              // 分隔符，默认 "/"
}
```

**Slots**:
- `#default` — 自定义面包屑项（使用 BreadcrumbItem 子组件）
- `#separator` — 自定义分隔符

**示例**:
```vue
<!-- 数据模式 -->
<Breadcrumb :items="[{label:'首页',path:'/'},{label:'任务',path:'/tasks'},{label:'详情'}]" />

<!-- Slot 模式 -->
<Breadcrumb>
  <BreadcrumbItem path="/">首页</BreadcrumbItem>
  <BreadcrumbItem>当前页</BreadcrumbItem>
</Breadcrumb>
```

---

### BreadcrumbItem

**路径**: `src/components/breadcrumb/BreadcrumbItem.vue`

**用途**: 面包屑单项，支持链接、图标和激活状态。

**Props**:
```ts
{
  path?: string             // 链接路径，有值时渲染为链接
  icon?: string | Component // 图标
  active?: boolean          // 是否为当前激活项，默认 false
}
```

**Events**:
```ts
click(e: MouseEvent)
```

**Slots**:
- `#default` — 面包屑文字内容

---

## ContextMenu 右键菜单

### ContextMenu (table)

**路径**: `src/components/table/ContextMenu.vue`

**用途**: 数据表格用右键上下文菜单，固定定位，支持子菜单指示器和危险项。

**Props**:
```ts
{
  x: number                  // 菜单显示 X 坐标（fixed 定位）
  y: number                  // 菜单显示 Y 坐标（fixed 定位）
  items: ContextMenuItem[]   // 菜单项（{ key, label, icon?, disabled?, danger?, separator?, children? }）
  visible?: boolean          // 是否显示，默认 true
}
```

**Events**:
```ts
select(key: string)    // 选中菜单项
close()                // 关闭菜单（点击外部或 Escape）
```

### ContextMenu (ContextMenu/)

**路径**: `src/components/ContextMenu/index.vue`

**用途**: 通用右键上下文菜单（Teleport to body），API 与 table/ContextMenu 相同。

**Props / Events**: 同上

---

## Dashboard 仪表板

### Dashboard

**路径**: `src/components/Dashboard/index.vue`

**用途**: 仪表板容器，网格布局排列多个 Widget。

**Props**:
```ts
{
  title?: string              // 仪表板标题
  widgets?: DashboardWidget[] // Widget 列表（{ id, type, title, span?, ...data }）
  columns?: number            // 网格列数，默认 3
  gap?: number                // 网格间距 px，默认 16
}
```

**Events**: 无

**Slots**: 无

---

### BarChart

**路径**: `src/components/Dashboard/charts/BarChart.vue`

**用途**: 柱状图，基于 ECharts。

**Props**:
```ts
{
  title?: string           // 图表标题
  xAxisData?: string[]     // X 轴数据
  seriesName?: string      // 系列名称
  data?: number[]          // 数据值数组
  colors?: string[]        // 颜色数组
}
```

---

### DoughnutChart

**路径**: `src/components/Dashboard/charts/DoughnutChart.vue`

**用途**: 环形图（PieChart 的 doughnut 变体）。

**Props**:
```ts
{
  title?: string              // 图表标题
  data?: PieDatum[]           // 数据（{ name, value }）
  colors?: string[]           // 颜色数组
  showLegend?: boolean        // 是否显示图例，默认 true
}
```

---

### NumberCard

**路径**: `src/components/Dashboard/charts/NumberCard.vue`

**用途**: 数字指标卡，显示单个关键指标及趋势。

**Props**:
```ts
{
  title?: string              // 指标标题
  value?: number              // 指标数值
  unit?: string               // 单位
  compare?: string            // 对比文字（如 "vs 上周"）
  trend?: "up" | "down"       // 趋势方向
  color?: string              // 主题颜色
}
```

---

### PieChart

**路径**: `src/components/Dashboard/charts/PieChart.vue`

**用途**: 饼图，基于 ECharts，可切换为环形图。

**Props**:
```ts
{
  title?: string              // 图表标题
  data?: PieDatum[]           // 数据（{ name, value }）
  colors?: string[]           // 颜色数组
  doughnut?: boolean          // 是否为环形图，默认 false
  showLegend?: boolean        // 是否显示图例，默认 true
}
```

---

### TableChart

**路径**: `src/components/Dashboard/charts/TableChart.vue`

**用途**: 表格图表，在 Dashboard 中展示表格数据。

**Props**:
```ts
{
  title?: string              // 表格标题
  columns?: Column[]          // 列定义（{ key, label, width? }）
  rows?: RowData[]            // 数据行
}
```

---

## Detail 详情页

### CommentItem

**路径**: `src/components/detail/CommentItem.vue`

**用途**: 评论/活动记录条目，显示头像、作者、时间和内容。

**Props**:
```ts
{
  comment: CommentData    // 评论数据（{ id, author, content, createdAt, avatar? }）
}
```

---

### DetailLayout

**路径**: `src/components/detail/DetailLayout.vue`

**用途**: 详情页双栏布局（左栏主内容 + 右栏属性面板），集成任务描述和活动记录。

**Props**:
```ts
{
  task: Task                      // 任务数据（{ id, title, status, priority, role?, assignee?, description? }）
  comments?: CommentData[]        // 评论列表，默认 []
  propItems?: PropItem[]          // 属性列表，默认 []
  descriptionContent?: string     // 描述内容（外部受控），默认 ""
  descriptionEditable?: boolean   // 描述是否可编辑，默认 false
}
```

**Events**:
```ts
"update:descriptionContent"(value: string)
```

**Slots**:
- `#meta` — 自定义 Meta 信息区（覆盖默认状态/优先级/角色徽章）
- `#description` — 自定义描述区内容
- `#comments` — 自定义活动记录区内容
- `#props` — 自定义右侧属性面板

**示例**:
```vue
<DetailLayout :task="task" :prop-items="props" description-editable @update:description-content="save" />
```

---

### PropPanel

**路径**: `src/components/detail/PropPanel.vue`

**用途**: 属性面板，竖排显示多个属性行，支持折叠。

**Props**:
```ts
{
  items: PropItem[]         // 属性列表（{ key, label, value, type? }）
  title?: string            // 面板标题，默认 "属性"
  collapsible?: boolean     // 是否可折叠，默认 false
}
```

**Slots**:
- `#extra` — 标题右侧额外内容

---

### PropRow

**路径**: `src/components/detail/PropRow.vue`

**用途**: 属性行，支持 status/priority/badge/date/text 五种值渲染类型。

**Props**:
```ts
{
  propKey: string                    // 属性键名
  value: string                      // 属性值
  type?: "status" | "priority" | "badge" | "date" | "text"    // 渲染类型，默认 "text"
  statusColorMap?: ColorMap          // 状态颜色映射
  priorityColorMap?: ColorMap        // 优先级颜色映射
  customColorMap?: ColorMap          // 自定义颜色映射
  valueColor?: string                // 直接指定文字颜色
  valueBg?: string                   // 直接指定背景颜色
  dotColor?: string                  // 状态点颜色
}
```

---

## Editor 编辑器

### BlockQuote

**路径**: `src/components/editor/BlockQuote.vue`

**用途**: 引用块，支持点击进入编辑模式（textarea），失焦或 Escape 完成编辑。

**Props**:
```ts
{
  content: string       // 引用文字内容
  cite?: string         // 引用来源（显示为 "— cite"）
  editable?: boolean    // 是否可编辑，默认 false
}
```

**Events**:
```ts
"update:content"(value: string)
```

---

### CodeBlock

**路径**: `src/components/editor/CodeBlock.vue`

**用途**: 代码块，带语言标签和一键复制按钮。

**Props**:
```ts
{
  code: string           // 代码内容
  language?: string      // 语言标识，默认 "bash"
  copyable?: boolean     // 是否显示复制按钮，默认 true
}
```

**Events**: 无

**示例**:
```vue
<CodeBlock language="typescript" :code="tsCode" />
```

---

### ContentBlock

**路径**: `src/components/editor/ContentBlock.vue`

**用途**: 内容文本块，可编辑（点击进入文本域编辑模式）。

**Props**:
```ts
{
  content?: string      // 文本内容
  editable?: boolean    // 是否可编辑，默认 false
}
```

**Events**:
```ts
"update:content"(value: string)
```

**Slots**:
- `#default` — 覆盖默认内容渲染

---

### RefLink

**路径**: `src/components/editor/RefLink.vue`

**用途**: 引用链接标签，有 href 时渲染为外链 `<a>`，否则为 `<span>`。

**Props**:
```ts
{
  refId: string      // 引用 ID
  label?: string     // 显示文字（默认显示 refId）
  href?: string      // 外部链接 URL
}
```

**Events**:
```ts
click(refId: string)
```

---

### RichTextEditor

**路径**: `src/components/editor/RichTextEditor.vue`

**用途**: 富文本编辑器（基于 Quill），支持标准格式化工具栏、插入链接弹窗、保存。

**Props**:
```ts
{
  modelValue?: string      // HTML 内容，默认 ""
  placeholder?: string     // 占位文本，默认 "请输入内容..."
  editable?: boolean       // 是否可编辑，默认 true
  minHeight?: number       // 编辑区最小高度 px，默认 220
}
```

**Events**:
```ts
"update:modelValue"(value: string)
change(value: string)
save(value: string)
```

**依赖**: `@vueup/vue-quill`（需单独安装）

---

## Field 字段编辑器

> 所有 Field 组件均为表格内联编辑器，由 `FieldCell` 按需动态加载。通用 Props/Events 如下：

**通用 Props**:
```ts
{
  value?: CellValue    // 单元格当前值（string | number | boolean | string[] | null | undefined）
  field: FieldDef      // 字段定义（{ id, type, label, options?, max?, readonly? }）
}
```

**通用 Events**:
```ts
commit(value: CellValue)    // 提交新值
cancel()                     // 取消编辑
tabNext()                    // Tab 切换到下一个单元格
```

### FieldCheckbox
**路径**: `src/components/field/FieldCheckbox.vue` — 勾选框字段编辑器

### FieldDate
**路径**: `src/components/field/FieldDate.vue` — 日期字段编辑器（date input）

### FieldDatetime
**路径**: `src/components/field/FieldDatetime.vue` — 日期时间字段编辑器（datetime-local input）

### FieldEmail
**路径**: `src/components/field/FieldEmail.vue` — 邮箱字段编辑器

### FieldMultiSelect
**路径**: `src/components/field/FieldMultiSelect.vue` — 多选字段编辑器（Teleport 下拉，勾选多个选项）

### FieldNumber
**路径**: `src/components/field/FieldNumber.vue` — 数字字段编辑器

### FieldRating
**路径**: `src/components/field/FieldRating.vue` — 星级评分编辑器（最大值取 `field.max`，默认 5）

### FieldSelect
**路径**: `src/components/field/FieldSelect.vue` — 单选字段编辑器（Teleport 下拉，单选选项）

### FieldText
**路径**: `src/components/field/FieldText.vue` — 文本字段编辑器

### FieldUrl
**路径**: `src/components/field/FieldUrl.vue` — URL 字段编辑器

### FieldCell

**路径**: `src/components/table/FieldCell.vue`

**用途**: 字段单元格容器，管理编辑状态，根据 `field.type` 动态加载对应的 Field 编辑器组件。

**Props**:
```ts
{
  rowId: string         // 行 ID
  field: FieldDef       // 字段定义
  value?: CellValue     // 当前值
  readonly?: boolean    // 是否只读，默认 false
}
```

**Events**:
```ts
commit(rowId: string, fieldId: string, value: CellValue)
cancel()
tabNext()
```

---

## Form 表单

### FormDesigner

**路径**: `src/components/form/FormDesigner.vue`

**用途**: 可视化表单设计器，支持拖拽排序字段、增删字段、切换只读/编辑模式。

**Props**:
```ts
{
  schema: TableSchema      // 表格 Schema（{ id, name, fields: FieldDef[] }）
  title?: string           // 设计器标题
  readonly?: boolean       // 是否只读模式，默认 false
}
```

**Events**:
```ts
"update:schema"(schema: TableSchema)
change(schema: TableSchema)
```

**依赖**: `vue-draggable-plus`

---

## Gallery 画廊

### GalleryCard

**路径**: `src/components/gallery/GalleryCard.vue`

**用途**: 画廊卡片，展示封面图、标题和字段值。

**Props**:
```ts
{
  item: GalleryItem    // 画廊项（{ id, cover?, title, fields?: Record<string,string> }）
}
```

**Events**:
```ts
click(item: GalleryItem)
```

---

### GalleryView

**路径**: `src/components/gallery/GalleryView.vue`

**用途**: 画廊视图容器，网格排列卡片，支持通过 schema 字段映射 DataRecord。

**Props**:
```ts
{
  items?: GalleryItem[]           // 直接传入画廊项列表
  records?: DataRecord[]          // 数据记录列表（配合 schema 字段）
  coverFieldId?: string           // 封面字段 ID
  cardFieldIds?: string[]         // 卡片显示的字段 ID 列表
  columns?: number                // 列数，默认 4
  addable?: boolean               // 是否显示添加按钮，默认 false
}
```

**Events**:
```ts
"card-click"(item: GalleryItem)
add()
```

---

## Kanban 看板

### KanbanBoard

**路径**: `src/components/kanban/KanbanBoard.vue`

**用途**: 看板主板，管理多个列，支持通过 DataRecord 和 Schema 动态渲染。

**Props**:
```ts
{
  columns?: KanbanColumnData[]            // 列数据列表
  records?: DataRecord[]                  // 数据记录
  kanbanFieldId?: string                  // 看板分组字段 ID
  laneOrder?: string[]                    // 列顺序
  laneTitles?: Record<string, string>     // 列标题映射
  addColumnVisible?: boolean              // 是否显示添加列按钮，默认 true
}
```

**Events**:
```ts
"update:columns"(columns: KanbanColumnData[])
"add-column"()
"card-click"(task: Task)
```

---

### KanbanCard

**路径**: `src/components/kanban/KanbanCard.vue`

**用途**: 看板卡片，展示任务标题、状态、优先级和角色徽章。

**Props**:
```ts
{
  task: Task                      // 任务数据
  dragging?: boolean              // 是否正在拖拽，默认 false
  priorityColorMap?: ColorMap     // 优先级颜色映射
  statusColorMap?: ColorMap       // 状态颜色映射
}
```

**Events**:
```ts
click(task: Task)
```

---

### KanbanColumn

**路径**: `src/components/kanban/KanbanColumn.vue`

**用途**: 看板列，支持拖拽排序卡片（vue-draggable-plus）和虚拟滚动。

**Props**:
```ts
{
  column: KanbanColumnData        // 列数据（{ id, title, tasks: Task[], color? }）
  ghostClass?: string             // 拖拽幽灵 class，默认 "kanban-ghost"
  priorityColorMap?: ColorMap     // 优先级颜色映射
  statusColorMap?: ColorMap       // 状态颜色映射
}
```

**Events**:
```ts
"add-card"(columnId: string)
"card-click"(task: Task)
"update:column"(column: KanbanColumnData)
```

---

### QuickAddRow

**路径**: `src/components/kanban/QuickAddRow.vue`

**用途**: 快速添加行，带输入框，回车或点击按钮提交。

**Props**:
```ts
{
  placeholder?: string    // 占位文本，默认 "输入任务标题..."
}
```

**Events**:
```ts
submit(title: string)
cancel()
```

---

## Layout 布局

### AppLayout

**路径**: `src/components/layout/AppLayout.vue`

**用途**: 应用三层布局（顶部导航 + 左侧边栏 + 主内容 + 底部状态栏）。

**Props**: 无

**Slots**:
- `#navbar` — 顶部导航栏区域
- `#sidebar` — 左侧边栏区域
- `#default` — 主内容区域
- `#statusbar` — 底部状态栏区域

---

### Navbar

**路径**: `src/components/layout/Navbar.vue`

**用途**: 顶部导航栏，包含 Logo、搜索框、通知图标和头像。

**Props**:
```ts
{
  username?: string               // 用户名
  searchPlaceholder?: string      // 搜索占位文本，默认 "搜索..."
  notifyCount?: number            // 通知数量（>0 显示红点）
}
```

**Events**:
```ts
search(value: string)
"notify-click"()
"avatar-click"()
```

**Slots**:
- `#logo` — Logo 区域

---

### Sidebar

**路径**: `src/components/layout/Sidebar.vue`

**用途**: 左侧边栏，支持一级和二级菜单，激活状态高亮。

**Props**:
```ts
{
  items: SidebarItem[]    // 菜单项（{ id, label, icon?, children?: SidebarItem[], active? }）
}
```

**Events**:
```ts
"item-click"(item: SidebarItem)
```

**Slots**:
- `#header` — 顶部区域
- `#footer` — 底部区域

---

### StatusBar

**路径**: `src/components/layout/StatusBar.vue`

**用途**: 底部状态栏，显示同步状态、快捷键提示和版本号。

**Props**:
```ts
{
  synced?: boolean       // 是否已同步，默认 true
  shortcuts?: string     // 快捷键提示文字
  version?: string       // 版本号
}
```

---

## Mermaid 图表

### MermaidChart

**路径**: `src/components/mermaid/MermaidChart.vue`

**用途**: Mermaid 图表渲染组件，支持 flowchart/sequence/gantt 等 Mermaid 语法。

**Props**:
```ts
{
  code: string                                          // Mermaid 语法代码
  theme?: "default" | "dark" | "neutral" | "forest"   // 图表主题，默认 "default"
  width?: string                                        // 容器宽度，默认 "100%"
}
```

**Events**: 无

**Slots**:
- `#loading` — 加载中状态
- `#error(message)` — 错误状态

**依赖**: `mermaid`

---

## Overlay 弹层

### Dialog

**路径**: `src/components/overlay/Dialog.vue`

**用途**: 确认对话框，支持 info/warning/danger/success 四种语义类型。

**Props**:
```ts
{
  modelValue: boolean        // 是否显示
  title?: string             // 标题
  content?: string           // 内容文字
  confirmText?: string       // 确认按钮文字，默认 "确认"
  cancelText?: string        // 取消按钮文字，默认 "取消"
  type?: "info" | "warning" | "danger" | "success"    // 类型，默认 "info"
  loading?: boolean          // 确认按钮 loading 状态，默认 false
  width?: string             // 弹窗宽度，默认 "400px"
  hideCancel?: boolean       // 是否隐藏取消按钮，默认 false
}
```

**Events**:
```ts
"update:modelValue"(value: boolean)
confirm()
cancel()
```

**Slots**:
- `#default` — 自定义内容（覆盖 content prop）
- `#footer` — 自定义底部按钮区域

---

### Drawer

**路径**: `src/components/overlay/Drawer.vue`

**用途**: 右侧抽屉，从屏幕右侧滑入，支持遮罩点击关闭。

**Props**:
```ts
{
  modelValue: boolean       // 是否显示
  width?: number            // 抽屉宽度 px，默认 480
  title?: string            // 标题
  showClose?: boolean       // 是否显示关闭按钮，默认 true
  maskClosable?: boolean    // 点击遮罩是否关闭，默认 true
  zIndex?: number           // z-index，默认 1000
}
```

**Events**:
```ts
"update:modelValue"(value: boolean)
```

**Slots**:
- `#title` — 自定义标题
- `#default` — 内容区域

---

### Modal

**路径**: `src/components/overlay/Modal.vue`

**用途**: 通用弹窗（Teleport to body），居中或顶部显示，支持遮罩关闭。

**Props**:
```ts
{
  modelValue: boolean       // 是否显示
  width?: string            // 弹窗宽度，默认 "560px"
  title?: string            // 标题
  closable?: boolean        // 是否显示关闭图标，默认 true
  maskClosable?: boolean    // 点击遮罩是否关闭，默认 true
  centered?: boolean        // 是否垂直居中，默认 true
  zIndex?: number           // z-index，默认 1000
}
```

**Events**:
```ts
"update:modelValue"(value: boolean)
```

**Slots**:
- `#header` — 自定义头部（覆盖默认标题）
- `#default` — 内容区域
- `#footer` — 底部按钮区域

**示例**:
```vue
<Modal v-model="show" title="确认操作" width="400px">
  <p>确定要删除这条记录吗？</p>
  <template #footer>
    <button @click="show=false">取消</button>
    <button @click="confirm">确认</button>
  </template>
</Modal>
```

---

### SidePanel

**路径**: `src/components/overlay/SidePanel.vue`

**用途**: 右侧面板（无遮罩），推压主内容布局，支持 lazy（按需渲染）和 persistent（保留 DOM）两种模式。

**Props**:
```ts
{
  modelValue: boolean             // 是否显示
  width?: number                  // 面板宽度 px，默认 400
  title?: string                  // 标题
  showClose?: boolean             // 是否显示关闭按钮，默认 true
  mode?: "lazy" | "persistent"    // 渲染模式，默认 "lazy"
}
```

**Events**:
```ts
"update:modelValue"(value: boolean)
```

**Slots**:
- `#default` — 内容区域
- `#header` — 自定义头部

---

## Split 分栏

### SplitPane

**路径**: `src/components/split/SplitPane.vue`

**用途**: 可拖拽分栏布局，支持水平和垂直方向，拖拽分隔线调整比例。

**Props**:
```ts
{
  direction?: "horizontal" | "vertical"    // 分栏方向，默认 "horizontal"
  defaultSize?: number                      // 第一栏初始百分比，默认 50
  minSize?: number                          // 第一栏最小百分比，默认 20
  maxSize?: number                          // 第一栏最大百分比，默认 80
}
```

**Events**: 无

**Slots**:
- `#first` — 第一栏内容
- `#second` — 第二栏内容

**示例**:
```vue
<SplitPane direction="horizontal" :default-size="30">
  <template #first><Sidebar /></template>
  <template #second><MainContent /></template>
</SplitPane>
```

---

## Table 数据表格

### DataTable

**路径**: `src/components/table/DataTable.vue`

**用途**: 数据表格主组件，集成虚拟滚动、排序、分组、选中、内联编辑，支持 Task 和 DataRecord 两种数据源。

**Props**:
```ts
{
  tasks?: Task[]                    // Task 数据列表
  records?: DataRecord[]            // DataRecord 数据列表
  schema?: TableSchema              // 字段 Schema
  view?: ViewConfig                 // 视图配置（可见字段）
  columns?: TableColumn[]           // 自定义列定义
  fieldDefs?: FieldDef[]            // 字段定义（用于内联编辑）
  rowKey?: string                   // 行唯一键，默认 "id"
  selectable?: boolean              // 是否可选中行，默认 true
  addable?: boolean                 // 是否显示新建行按钮，默认 true
  priorityColorMap?: ColorMap       // 优先级颜色映射
  statusColorMap?: ColorMap         // 状态颜色映射
  groupBy?: string                  // 分组字段名
  groupColorMap?: ColorMap          // 分组标题颜色映射
}
```

**Events**:
```ts
"row-click"(row: Task | DataRecord)
"row-click-record"(record: DataRecord)
"add-row"()
"selection-change"(ids: string[])
"cell-edit"(payload: { rowId: string; fieldId: string; value: unknown })
```

---

### ExcelExport

**路径**: `src/components/table/ExcelExport.vue`

**用途**: Excel 导出按钮，动态加载 `xlsx` 包生成 .xlsx 文件并下载。

**Props**:
```ts
{
  data: Record<string, unknown>[]    // 数据行
  columns: TableColumn[]             // 列定义（用于生成表头和取值）
  filename?: string                  // 文件名（不含扩展名），默认 "export"
  label?: string                     // 按钮文字，默认 "导出 Excel"
  disabled?: boolean                 // 是否禁用，默认 false
  size?: "sm" | "md"                 // 尺寸，默认 "md"
}
```

**依赖**: `xlsx`（需调用方安装：`npm install xlsx`）

---

### TableColumnManager

**路径**: `src/components/table/TableColumnManager.vue`

**用途**: 列管理面板，支持拖拽排序列和显示/隐藏列。

**Props**:
```ts
{
  columns: TableColumn[]    // 当前列定义
  visible?: boolean         // 面板是否可见，默认 true
}
```

**Events**:
```ts
"update:columns"(columns: TableColumn[])
close()
```

**依赖**: `vue-draggable-plus`

---

### TableDataRow

**路径**: `src/components/table/TableDataRow.vue`

**用途**: 数据行，渲染单行表格数据，内置 status/priority/role/date 特殊列渲染。

**Props**:
```ts
{
  row: TableRow               // 行数据（Record<string, unknown> & { id: string }）
  rowKey?: string             // 行键，默认 "id"
  selected?: boolean          // 是否选中，默认 false
  columns?: TableColumn[]     // 列定义
  priorityColorMap?: ColorMap // 优先级颜色映射
  statusColorMap?: ColorMap   // 状态颜色映射
}
```

**Events**:
```ts
select(id: string)
click(row: TableRow)
```

**Slots**:
- `#cell({ row, col })` — 自定义单元格内容

---

### TableFilterPanel

**路径**: `src/components/table/TableFilterPanel.vue`

**用途**: 筛选条件面板，支持多条件组合（且/或逻辑）、字段选择、操作符选择和值输入。

**Props**:
```ts
{
  columns: TableColumn[]              // 可筛选的列
  conditions: readonly FilterCondition[]    // 当前筛选条件
  logic: FilterLogic                  // 逻辑关系（"and" | "or"）
  visible?: boolean                   // 是否显示，默认 true
}
```

**Events**:
```ts
"add-condition"()
"remove-condition"(id: string)
"update-condition"(id: string, update: Partial<FilterCondition>)
"update:logic"(logic: FilterLogic)
clear()
close()
```

---

### TableGroupRow

**路径**: `src/components/table/TableGroupRow.vue`

**用途**: 分组标题行，显示分组名称（可带徽章）和行数，点击折叠/展开。

**Props**:
```ts
{
  groupKey: string          // 分组键值
  count: number             // 组内行数
  collapsed?: boolean       // 是否折叠，默认 false
  colorMap?: ColorMap       // 徽章颜色映射
  selectable?: boolean      // 是否显示 checkbox 占位，默认 true
}
```

**Events**:
```ts
toggle()
```

---

### TableHeaderRow

**路径**: `src/components/table/TableHeaderRow.vue`

**用途**: 表头行，显示列标题，支持点击排序和全选 checkbox。

**Props**:
```ts
{
  columns?: TableColumn[]        // 列定义
  selectable?: boolean           // 是否显示全选 checkbox，默认 true
  sortKey?: string               // 当前排序字段，默认 ""
  sortOrder?: "asc" | "desc"     // 排序方向，默认 "asc"
  allSelected?: boolean          // 是否全选，默认 false
  indeterminate?: boolean        // 是否半选，默认 false
}
```

**Events**:
```ts
sort(key: string)
"select-all"()
```

---

### NewRowBtn

**路径**: `src/components/table/NewRowBtn.vue`

**用途**: 新建行按钮，表格底部带加号图标的按钮。

**Props**: 无

**Events**:
```ts
click()
```

---

## Tabs 标签页

### Tabs

**路径**: `src/components/tabs/Tabs.vue`

**用途**: 标签页切换，支持受控/非受控模式、line 和 card 两种变体、键盘导航（方向键/Home/End）。

**Props**:
```ts
{
  modelValue?: string         // 当前激活的 tab key（受控模式）
  defaultValue?: string       // 初始激活 tab key（非受控模式）
  variant?: "line" | "card"   // 变体，默认 "line"
  size?: "sm" | "md" | "lg"   // 尺寸，默认 "md"
  tabs: TabItem[]             // Tab 列表（{ key, label, icon?, disabled?, badge? }）
}
```

**Events**:
```ts
"update:modelValue"(key: string)
change(key: string)
```

**Slots**:
- `#default` — TabPanel 子组件区域

**示例**:
```vue
<Tabs v-model="activeTab" :tabs="tabs" variant="line">
  <TabPanel name="overview">概览内容</TabPanel>
  <TabPanel name="detail" :keep-alive="true">详情内容</TabPanel>
</Tabs>
```

---

### TabPanel

**路径**: `src/components/tabs/TabPanel.vue`

**用途**: Tab 内容面板，必须嵌套在 `Tabs` 内，通过 inject 获取激活状态。

**Props**:
```ts
{
  name: string          // 对应 TabItem.key
  keepAlive?: boolean   // 是否保留 DOM（切换时隐藏而不销毁），默认 false
}
```

**Slots**:
- `#default` — 面板内容

---

## Timeline 时间轴

### ActivityTimeline

**路径**: `src/components/timeline/ActivityTimeline.vue`

**用途**: 活动时间轴，展示操作历史记录，支持加载骨架屏和进度条。

**Props**:
```ts
{
  items: TimelineItem[]    // 时间轴项（{ action, actor?, detail?, progress?, time?, status? }）
  loading?: boolean        // 是否显示骨架屏，默认 false
}
```

**Slots**:
- `#item({ item, index })` — 自定义单条记录渲染

**TimelineItem.status**: `"done" | "start" | "default"`（控制颜色点颜色：绿/橙/蓝）

---

### GanttRow

**路径**: `src/components/timeline/GanttRow.vue`

**用途**: 甘特图数据行，显示任务标签和可拖拽的日期条（支持移动和右侧调整结束日期）。

**Props**:
```ts
{
  item: GanttRowItem           // 任务数据（{ id, title, status?, priority?, startDate, endDate, barColor? }）
  dayWidth: number             // 每天宽度 px
  offsetDays: number           // 从起始日到任务开始的天数偏移
  durationDays: number         // 任务持续天数
  totalDays: number            // 时间轴总天数
  readonly?: boolean           // 是否只读，默认 false
  priorityColorMap?: ColorMap  // 优先级颜色映射
  statusColorMap?: ColorMap    // 状态颜色映射
}
```

**Events**:
```ts
click(item: GanttRowItem)
change(payload: { id: string; offsetDays: number; durationDays: number; startDate: string; endDate: string })
```

---

### GanttTimeline

**路径**: `src/components/timeline/GanttTimeline.vue`

**用途**: 甘特图完整组件，包含日期表头、今日基准线、多行任务条，自动计算时间范围，支持 DataRecord 和 Task/GanttItem 两种数据源。

**Props**:
```ts
{
  records?: DataRecord[]        // DataRecord 数据源
  schema?: TableSchema          // Schema
  viewConfig?: ViewConfig       // 视图配置
  startFieldId?: string         // 开始日期字段 ID，默认 "startDate"
  endFieldId?: string           // 结束日期字段 ID，默认 "endDate"
  labelFieldId?: string         // 标题字段 ID，默认 "title"
  items?: GanttItem[]           // 旧接口：直接传入甘特项
  data?: Task[]                 // 旧接口：Task 列表
  startDate?: string            // 时间轴起始日期（YYYY-MM-DD）
  days?: number                 // 时间轴天数，默认 30
}
```

**Events**:
```ts
"row-click"(item: TimelineRow)
"record-change"(payload: { recordId: string; startDate: string; endDate: string })
"update:records"(records: DataRecord[])
```

---

## Toast 通知

### ToastContainer

**路径**: `src/components/toast/ToastContainer.vue`

**用途**: Toast 通知容器，通过 Teleport 挂载到 body 右上角，在应用根组件挂载一次即可，消费 `useToast` 共享状态。

**Props**: 无

**Slots**: 无

**示例**（在 App.vue 中挂载一次）:
```vue
<template>
  <RouterView />
  <ToastContainer />
</template>
```

---

### ToastItem

**路径**: `src/components/toast/ToastItem.vue`

**用途**: 单个 Toast 通知项，支持 info/success/warning/error 四种类型，带图标和关闭按钮。

**Props**:
```ts
{
  toast: ToastItem    // Toast 数据（{ id, type, message, title?, duration? }）
}
```

**Events**:
```ts
close()
```

---

## Composables

### useAiChat

**路径**: `src/composables/useAiChat.ts`

**用途**: AI 对话 composable，管理消息列表、流式请求、打字机效果和取消操作。

**函数签名**:
```ts
function useAiChat(options: UseAiChatOptions): {
  messages: Readonly<Ref<ChatMessage[]>>
  isGenerating: Readonly<Ref<boolean>>
  isStreaming: Readonly<Ref<boolean>>
  send(content: string): Promise<void>
  cancel(): void
  clear(): void
}
```

**Options**:
```ts
interface UseAiChatOptions {
  sendRequest: (content: string, history: ChatMessage[]) => Promise<ReadableStream<Uint8Array> | Response>
  parseChunk?: (data: unknown) => string | null   // SSE 模式解析函数
  typewriter?: boolean                             // 是否启用打字机效果，默认 false
  typewriterSpeed?: number                         // 打字速度 ms/字符，默认 15
  onError?: (error: Error) => void
}
```

**示例**:
```ts
const { messages, isGenerating, send, cancel } = useAiChat({
  sendRequest: (content) => fetch('/api/chat', { method: 'POST', body: JSON.stringify({ content }) }),
  parseChunk: (data: any) => data.choices?.[0]?.delta?.content ?? null,
  typewriter: true,
})
```

---

### useBadge

**路径**: `src/composables/useBadge.ts`

**用途**: 徽章颜色解析 composable，提供内置优先级/状态映射和 `resolveBadge` 解析函数。

**函数签名**:
```ts
function useBadge(): {
  DEFAULT_PRIORITY_MAP: ColorMap    // P0/P1/P2/P3 默认颜色映射
  DEFAULT_STATUS_MAP: ColorMap      // todo/in_progress/blocked/done 等默认颜色映射
  resolveBadge(value: string, colorMap: ColorMap): ResolvedBadge
  mergeColorMap(defaultMap: ColorMap, overrides?: ColorMap): ColorMap
}

// 也可直接导入工具函数（不需要 composable 形式时）
export function resolveBadge(value: string, colorMap: ColorMap): ResolvedBadge
export function mergeColorMap(defaultMap: ColorMap, overrides?: ColorMap): ColorMap
export const DEFAULT_PRIORITY_MAP: ColorMap
export const DEFAULT_STATUS_MAP: ColorMap

interface ResolvedBadge {
  style: { color: string; background: string }
  label: string
  dot?: string
}
```

---

### useInlineEdit

**路径**: `src/composables/useInlineEdit.ts`

**用途**: 表格内联编辑状态管理（全局单例），管理当前正在编辑的单元格。

**函数签名**:
```ts
function useInlineEdit(): {
  editingCell: Readonly<Ref<EditingCell | null>>
  activate(rowId: string, fieldId: string): void
  commit(rowId: string, fieldId: string, value: unknown): unknown
  cancel(): void
  isEditing(rowId: string, fieldId: string): boolean
}

interface EditingCell {
  rowId: string
  fieldId: string
}
```

---

### useMarkdown

**路径**: `src/composables/useMarkdown.ts`

**用途**: Markdown 渲染 composable，基于 marked + highlight.js，支持代码高亮和复制按钮。

**函数签名**:
```ts
function useMarkdown(options?: UseMarkdownOptions): {
  renderMarkdown(content: string): string    // 将 Markdown 转换为 HTML 字符串
}

interface UseMarkdownOptions {
  showCopyButton?: boolean       // 代码块是否显示复制按钮，默认 false
  t?: (key: string) => string   // 多语言翻译函数
}
```

**支持的语言**: javascript/typescript/python/bash/sh/json/sql/html/xml/css/markdown/yaml/java/go/rust

**示例**:
```ts
const { renderMarkdown } = useMarkdown({ showCopyButton: true })
const html = renderMarkdown('# Hello\n\n```ts\nconst x = 1\n```')
```

---

### useStream

**路径**: `src/composables/useStream.ts`

**用途**: 流式数据处理 composable，支持 raw 和 SSE 两种模式，带断线重试、超时控制和 rAF 批量刷新。

**函数签名**:
```ts
function useStream(options?: UseStreamOptions): {
  isStreaming: Readonly<Ref<boolean>>
  isLoading: Readonly<Ref<boolean>>
  error: Readonly<Ref<Error | null>>
  retryCount: Readonly<Ref<number>>
  start(readableStream: ReadableStream<Uint8Array>): Promise<void>
  cancel(): void
}

interface UseStreamOptions {
  mode?: "raw" | "sse"             // 解析模式，默认 "raw"
  bufferInterval?: number           // chunk 缓冲间隔 ms（>0 启用 rAF 批量刷新）
  retry?: RetryOptions              // 重试配置（maxRetries, baseDelay, backoff）
  timeout?: number                  // 流超时 ms，0 = 无超时
  onChunk?: (text: string) => void  // raw 模式每个 chunk 回调
  onData?: (parsed: unknown) => void // SSE 模式每条 data 解析后回调
  onDone?: () => void
  onError?: (error: Error) => void
  onRetry?: (attempt: number) => void
}
```

---

### useTableFilter

**路径**: `src/composables/useTableFilter.ts`

**用途**: 表格筛选 composable，管理多条件筛选状态，支持字符串和数字操作符，提供客户端过滤函数。

**函数签名**:
```ts
function useTableFilter<T extends Record<string, unknown>>(
  options?: UseTableFilterOptions
): {
  conditions: Readonly<ShallowRef<FilterCondition[]>>
  logic: Ref<FilterLogic>
  isActive: ComputedRef<boolean>
  addCondition(field?: string): void
  removeCondition(id: string): void
  updateCondition(id: string, update: Partial<FilterCondition>): void
  clearConditions(): void
  filterData(data: T[]): T[]
  operatorsFor(colType?: string): { value: FilterOperator; label: string }[]
}

type FilterLogic = "and" | "or"
type FilterOperator = "equals" | "not_equals" | "contains" | "not_contains" |
  "starts_with" | "ends_with" | "gt" | "gte" | "lt" | "lte" | "is_empty" | "is_not_empty"
```

---

### useTable

**路径**: `src/composables/useTable.ts`

**用途**: 表格通用 composable，集成客户端/服务端分页、排序、行选中管理。

**函数签名**:
```ts
function useTable<T extends Record<string, unknown>>(options?: UseTableOptions<T>): {
  data: ComputedRef<T[]>                    // 当前页数据
  rawData: Readonly<ShallowRef<T[]>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<Error | null>>
  sort: Readonly<Ref<SortState>>
  pagination: Readonly<Ref<PaginationState>>
  totalPages: ComputedRef<number>
  selectedRows: Readonly<Ref<Set<string | number>>>
  selectedCount: ComputedRef<number>
  isAllSelected: ComputedRef<boolean>
  toggleSort(field: string): void
  setSort(field: string, order: SortOrder): void
  setPage(page: number): void
  setPageSize(size: number): void
  toggleRowSelection(row: T, index: number): void
  toggleSelectAll(allRows: T[]): void
  isRowSelected(row: T, index: number): boolean
  clearSelection(): void
  refresh(): void
  fetchData(): Promise<void>
  setData(data: T[]): void
}

interface UseTableOptions<T> {
  data?: T[]
  pageSize?: number
  serverSide?: boolean
  onFetch?: (params: { page: number; pageSize: number; sort: SortState }) => Promise<{ data: T[]; total: number }>
}
```

---

### useToast

**路径**: `src/composables/useToast.ts`

**用途**: Toast 通知 composable（全局单例），所有调用共享同一列表，配合 `ToastContainer` 使用。

**函数签名**:
```ts
function useToast(): {
  toasts: ToastItem[]                                        // 响应式 toast 列表
  info(message: string, options?: UseToastOptions): string
  success(message: string, options?: UseToastOptions): string
  warning(message: string, options?: UseToastOptions): string
  error(message: string, options?: UseToastOptions): string
  remove(id: string): void
  clear(): void
}

interface UseToastOptions {
  duration?: number    // 持续时间 ms，默认 3000，0 = 不自动关闭
  title?: string
}
```

**示例**:
```ts
const toast = useToast()
toast.success('保存成功')
toast.error('网络错误', { title: '请求失败', duration: 5000 })
toast.info('有新消息', { duration: 0 })  // 不自动关闭
```

---

### useTypewriter

**路径**: `src/composables/useTypewriter.ts`

**用途**: 打字机效果 composable，逐字符追加文字，支持 rAF 动画和后台 timeout 降级。

**函数签名**:
```ts
function useTypewriter(options?: UseTypewriterOptions): {
  displayText: Readonly<Ref<string>>    // 当前已显示的文字
  isTyping: Readonly<Ref<boolean>>
  append(text: string): void            // 追加文字并开始打字
  reset(): void                          // 重置，清空所有状态
  flush(): void                          // 立即显示全部文字
}

interface UseTypewriterOptions {
  speed?: number                    // 每字符间隔 ms，默认 20
  onUpdate?: (text: string) => void // 每次更新回调
  onComplete?: () => void           // 完成回调
}
```

---

### useVirtualList

**路径**: `src/composables/useVirtualList.ts`

**用途**: 虚拟列表 composable，支持固定和动态行高，使用 ResizeObserver 感知容器变化，用于 AiMessageList 和 KanbanColumn。

**函数签名**:
```ts
function useVirtualList<T>(options: UseVirtualListOptions<T>): {
  visibleItems: ComputedRef<VirtualItem<T>[]>    // 当前可见的虚拟项（含 data 和 index）
  totalHeight: ComputedRef<number>               // 列表总高度（用于撑开滚动容器）
  offsetY: ComputedRef<number>                   // 可见区域顶部偏移（用于 translateY）
  scrollToIndex(index: number): void
  scrollToBottom(): void
}

interface UseVirtualListOptions<T> {
  items: Ref<T[]>
  itemHeight: number | ((index: number) => number)    // 固定高度或动态高度函数
  overscan?: number                                    // 上下多渲染的缓冲行数，默认 5
  containerRef: Ref<HTMLElement | null>                // 滚动容器的 ref
}

type VirtualItem<T> = { data: T; index: number }
```

**示例**:
```ts
const containerRef = ref<HTMLElement | null>(null)
const { visibleItems, totalHeight, offsetY } = useVirtualList({
  items: messages,
  itemHeight: 60,     // 固定高度
  overscan: 3,
  containerRef,
})
```

---

## 附录：类型定义速查

以下类型在多个组件中复用，定义于 `src/types/index.ts`：

```ts
// 颜色映射
type ColorMap = Record<string, { text: string; bg: string; label?: string; dot?: string }>

// 任务
interface Task {
  id: string
  title: string
  status: string
  priority: string
  role?: string
  assignee?: string
  description?: string
}

// 数据记录（通用）
interface DataRecord {
  id: string
  fields: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

// 表格列
interface TableColumn {
  key: string
  label: string
  width?: number | "fill"
  align?: "left" | "center" | "right"
  type?: "string" | "number" | "date" | "status"
  hidden?: boolean
}

// 表格 Schema
interface TableSchema {
  id: string
  name: string
  fields: FieldDef[]
}

// 属性行
interface PropItem {
  key: string
  label: string
  value: string
  type?: "status" | "priority" | "badge" | "date" | "text"
}

// 评论
interface CommentData {
  id: string
  author: string
  content: string
  createdAt: string
  avatar?: string
}
```
agentId: a6a92080c4346f582 (for resuming to continue this agent's work if needed)
<usage>total_tokens: 134292
tool_uses: 110
duration_ms: 579076</usage>
