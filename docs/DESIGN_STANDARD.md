# OneUI Design Standard v1.0

> **定位**: OneUI 组件库的视觉设计执行标准，所有组件开发必须遵守本文档。
> **适用范围**: `@oneflowui/ui` 全部组件（base / layout / table / form / ai / overlay / kanban / editor / dashboard / timeline）
> **约束级别**: 本文档为**强制规范**，新增或修改组件不符合本标准不得合并。

---

## 第1章 设计原则

### 1.1 品牌定位

**一句话**: 冷调、紧凑、工程感的生产力界面语言。

OneUI 面向任务管理、AI 对话、数据分析等**中后台生产力场景**，用户长时间在屏幕前工作。设计的核心目标是**降低视觉疲劳、提升信息密度、保持可预测性**。

### 1.2 五项设计原则

| 原则 | 含义 | 反模式 |
|------|------|--------|
| **克制** | 颜色只用于语义（状态、操作、警告），不用于装饰 | 给容器加彩色背景"好看一点" |
| **一致** | 同一语义在所有组件中表现相同 | Badge 用一套蓝、StatusIndicator 用另一套蓝 |
| **紧凑** | 信息密度优先，一屏尽量多看 | 大面积留白、超宽行距 |
| **可预测** | 间距、字号、圆角有固定档位，用户不需要重新适应 | 每个组件发明自己的 padding |
| **Token 驱动** | 所有视觉值引用 CSS 变量，禁止硬编码 | 直接写 `color: #6366f1` |

### 1.3 禁止事项

- **禁止硬编码颜色值** — 必须使用 `var(--of-*)` 变量
- **禁止发明新的字号/间距/圆角** — 只使用本标准定义的档位
- **禁止混用色彩体系** — 不得使用 Ant Design (`#1677ff`)、Material 或其他框架的色值
- **禁止 inline style 中写颜色** — 动态颜色通过 CSS 变量 + computed 注入
- **禁止省略交互状态** — 每个可交互元素必须有 hover / active / disabled / focus 四态

---

## 第2章 设计 Token

> 所有 Token 定义在 `src/styles/variables.css` 的 `:root` 中。
> 组件中引用格式: `var(--of-token-name)`。

### 2.1 色彩系统

#### 2.1.1 主色（Indigo）

| Token | 值 | 用途 |
|-------|------|------|
| `--of-color-primary-50` | `#eef2ff` | 选中行背景、hover 浅底 |
| `--of-color-primary-100` | `#e0e7ff` | badge 背景、tag 背景 |
| `--of-color-primary-200` | `#c7d2fe` | focus ring |
| `--of-color-primary-300` | `#a5b4fc` | — |
| `--of-color-primary-400` | `#818cf8` | — |
| `--of-color-primary-500` | `#6366f1` | **主操作色**: 按钮、链接、active 态 |
| `--of-color-primary-600` | `#4f46e5` | 主按钮 hover |
| `--of-color-primary-700` | `#4338ca` | 主按钮 active/pressed |
| `--of-color-primary-800` | `#3730a3` | — |
| `--of-color-primary-900` | `#312e81` | — |

**使用规则**: 日常只使用 `50/100/500/600/700` 五档。其余档位仅在需要更细腻过渡时使用。

#### 2.1.2 灰阶（Slate）

| Token | 值 | 用途 |
|-------|------|------|
| `--of-color-gray-50` | `#f8fafc` | 表头背景、斑马行、hover 底色 |
| `--of-color-gray-100` | `#f1f5f9` | 画布背景 `bg-canvas`、输入框底 |
| `--of-color-gray-200` | `#e2e8f0` | **标准边框色**（唯一的边框灰） |
| `--of-color-gray-300` | `#cbd5e1` | 分割线、disabled 边框 |
| `--of-color-gray-400` | `#94a3b8` | 弱文字、placeholder |
| `--of-color-gray-500` | `#64748b` | 次要文字 |
| `--of-color-gray-600` | `#475569` | — |
| `--of-color-gray-700` | `#334155` | — |
| `--of-color-gray-800` | `#1e293b` | 代码块深底 |
| `--of-color-gray-900` | `#0f172a` | **主文字色** |

**禁止**: 使用 `#111827`、`#1a1a1a`、`#262626`、`#666`、`#888`、`#aaa`、`#bbb`、`#999`、`#595959` 等非标灰色。

#### 2.1.3 语义色

| 语义 | Token (文字) | 值 | Token (背景) | 值 |
|------|-------------|------|-------------|------|
| 成功 | `--of-color-success` | `#22c55e` | `--of-color-success-light` | `#dcfce7` |
| 警告 | `--of-color-warning` | `#d97706` | `--of-color-warning-light` | `#fef3c7` |
| 错误 | `--of-color-error` | `#dc2626` | `--of-color-error-light` | `#fee2e2` |
| 信息 | `--of-color-info` | `#2563eb` | `--of-color-info-light` | `#dbeafe` |

**禁止**: 使用 `#1677ff`（Ant 蓝）、`#52c41a`（Ant 绿）、`#ff4d4f`（Ant 红）、`#fa8c16`（Ant 橙）、`#389e0d`、`#cf1322`、`#d46b08` 等 Ant Design 色值。

#### 2.1.4 文字色（新增）

| Token | 值 | 用途 |
|-------|------|------|
| `--of-color-text-primary` | `var(--of-color-gray-900)` | 标题、正文主体 |
| `--of-color-text-secondary` | `var(--of-color-gray-500)` | 辅助说明、时间戳、描述 |
| `--of-color-text-tertiary` | `var(--of-color-gray-400)` | placeholder、弱提示 |
| `--of-color-text-inverse` | `#ffffff` | 深色底上的白色文字 |
| `--of-color-text-link` | `var(--of-color-primary-500)` | 可点击链接 |

#### 2.1.5 背景色

| Token | 值 | 用途 |
|-------|------|------|
| `--of-color-bg-canvas` | `#f1f5f9` | 页面底层画布 |
| `--of-color-bg-elevated` | `#ffffff` | 卡片、面板、弹层 |
| `--of-color-bg-hover` | `var(--of-color-gray-50)` | hover 高亮行/项 |
| `--of-color-bg-active` | `var(--of-color-primary-50)` | 选中行/active 项 |
| `--of-color-bg-code` | `var(--of-color-gray-800)` | 代码块深色底 |

#### 2.1.6 优先级色

| 级别 | 文字 Token | 文字色 | 背景 Token | 背景色 |
|------|-----------|--------|-----------|--------|
| P0 | `--of-priority-p0-text` | `#dc2626` | `--of-priority-p0-bg` | `#fee2e2` |
| P1 | `--of-priority-p1-text` | `#d97706` | `--of-priority-p1-bg` | `#fef3c7` |
| P2 | `--of-priority-p2-text` | `#2563eb` | `--of-priority-p2-bg` | `#dbeafe` |
| P3 | `--of-priority-p3-text` | `#64748b` | `--of-priority-p3-bg` | `#f1f5f9` |

#### 2.1.7 状态色

| 状态 | 文字 Token | 文字色 | 背景 Token | 背景色 |
|------|-----------|--------|-----------|--------|
| 待处理 (todo) | `--of-status-todo-text` | `#64748b` | `--of-status-todo-bg` | `#f1f5f9` |
| 进行中 (in_progress) | `--of-status-in-progress-text` | `#2563eb` | `--of-status-in-progress-bg` | `#dbeafe` |
| 已阻塞 (blocked) | `--of-status-blocked-text` | `#d97706` | `--of-status-blocked-bg` | `#fef3c7` |
| 已完成 (done) | `--of-status-done-text` | `#22c55e` | `--of-status-done-bg` | `#dcfce7` |

#### 2.1.8 角色色（新增）

| 角色 | Token (文字) | 文字色 | Token (背景) | 背景色 |
|------|-------------|--------|-------------|--------|
| BE | `--of-role-be-text` | `#4f46e5` | `--of-role-be-bg` | `#eef2ff` |
| FE | `--of-role-fe-text` | `#059669` | `--of-role-fe-bg` | `#ecfdf5` |
| DBA | `--of-role-dba-text` | `#c2410c` | `--of-role-dba-bg` | `#fff7ed` |
| ARCH | `--of-role-arch-text` | `#7c3aed` | `--of-role-arch-bg` | `#f5f3ff` |
| PM | `--of-role-pm-text` | `#db2777` | `--of-role-pm-bg` | `#fdf2f8` |

#### 2.1.9 通用 Badge 色盘（新增）

用于 Badge / Tag / SelectBadge 等需要"多色标签"的场景，**替代各组件各自维护的色盘**：

| 色名 | Token (文字) | 文字色 | Token (背景) | 背景色 | Token (边框) | 边框色 |
|------|-------------|--------|-------------|--------|-------------|--------|
| blue | `--of-badge-blue-text` | `#2563eb` | `--of-badge-blue-bg` | `#dbeafe` | `--of-badge-blue-border` | `#93c5fd` |
| green | `--of-badge-green-text` | `#16a34a` | `--of-badge-green-bg` | `#dcfce7` | `--of-badge-green-border` | `#86efac` |
| orange | `--of-badge-orange-text` | `#d97706` | `--of-badge-orange-bg` | `#fef3c7` | `--of-badge-orange-border` | `#fcd34d` |
| red | `--of-badge-red-text` | `#dc2626` | `--of-badge-red-bg` | `#fee2e2` | `--of-badge-red-border` | `#fca5a5` |
| purple | `--of-badge-purple-text` | `#7c3aed` | `--of-badge-purple-bg` | `#f5f3ff` | `--of-badge-purple-border` | `#c4b5fd` |
| gray | `--of-badge-gray-text` | `#64748b` | `--of-badge-gray-bg` | `#f1f5f9` | `--of-badge-gray-border` | `#cbd5e1` |

**规则**: Badge.vue、SelectBadge.vue、useBadge.ts 统一使用此色盘，不再各自维护颜色映射。

---

### 2.2 字体系统

#### 2.2.1 字体族

| Token | 值 | 用途 |
|-------|------|------|
| `--of-font-sans` | `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` | **所有文字** |
| `--of-font-mono` | `"JetBrains Mono", "Fira Code", ui-monospace, monospace` | 代码、ID、时间戳 |

**禁止**: 硬编码 `'Roboto Mono', monospace` 或其他字体族。

#### 2.2.2 字号档位（新增）

**OneUI 只允许以下 6 个字号**，不得使用其他值：

| Token | 值 | 用途 | 示例场景 |
|-------|------|------|---------|
| `--of-font-size-xs` | `11px` | 极小标注 | 时间戳、meta 信息、角标 |
| `--of-font-size-sm` | `12px` | 小字 | 表头、badge 文字、工具栏、辅助文字 |
| `--of-font-size-base` | `13px` | **正文基准** | 表格内容、列表项、表单 label |
| `--of-font-size-md` | `14px` | 中等强调 | 卡片标题、Accordion 标题、Tab 文字 |
| `--of-font-size-lg` | `16px` | 大标题 | 面板标题、空状态标题 |
| `--of-font-size-xl` | `18px` | 页面标题 | 页面 h1、统计卡数值 |

**禁止**: 使用 10px、15px、20px、22px 或任何不在此表的字号。

#### 2.2.3 字重档位（新增）

**只允许 3 个字重**：

| Token | 值 | 用途 |
|-------|------|------|
| `--of-font-weight-normal` | `400` | 正文、描述、placeholder |
| `--of-font-weight-medium` | `500` | 按钮文字、Tab 文字、表头 |
| `--of-font-weight-semibold` | `600` | 标题、强调、badge |

**禁止**: 使用 `700`（bold）。OneUI 的设计语言不使用 bold，最重只到 semibold。

#### 2.2.4 行高档位（新增）

| Token | 值 | 适配字号 |
|-------|------|---------|
| `--of-line-height-tight` | `1.2` | xs (11px)、sm (12px) |
| `--of-line-height-normal` | `1.5` | base (13px)、md (14px) |
| `--of-line-height-relaxed` | `1.6` | lg (16px)、xl (18px) |

---

### 2.3 间距系统

**只允许以下 8 个间距值**，覆盖 padding / margin / gap：

| Token | 值 | 典型用途 |
|-------|------|---------|
| `--of-spacing-0.5` | `2px` | 微间距：图标与文字间 |
| `--of-spacing-1` | `4px` | badge 内边距、紧凑元素间距 |
| `--of-spacing-2` | `8px` | 行内元素间距、列表 gap |
| `--of-spacing-3` | `12px` | 卡片内部 gap、section 间距 |
| `--of-spacing-4` | `16px` | 容器 padding、主要间距 |
| `--of-spacing-6` | `24px` | 区域间距、大卡片 padding |
| `--of-spacing-8` | `32px` | 页面级间距 |
| `--of-spacing-10` | `40px` | 特殊大间距 |

**禁止**: 使用 5px、6px、10px、14px、18px、20px 等不在此表的间距值。

**常用组合**:

| 场景 | padding | gap |
|------|---------|-----|
| Badge / Tag 内部 | `2px 8px` (spacing-0.5 / spacing-2) | — |
| 卡片内部 | `12px` (spacing-3) | `8px` (spacing-2) |
| 容器 / Panel | `16px` (spacing-4) | `12px` (spacing-3) |
| 表格行 | `8px 12px` (spacing-2 / spacing-3) | — |
| 工具栏 | `4px 8px` (spacing-1 / spacing-2) | `8px` (spacing-2) |

---

### 2.4 圆角系统

**只允许 5 个圆角值**：

| Token | 值 | 用途 |
|-------|------|------|
| `--of-radius-sm` | `4px` | Badge、小按钮、输入框 |
| `--of-radius-md` | `6px` | 卡片、下拉菜单、Tooltip |
| `--of-radius-lg` | `8px` | Modal、Drawer、大容器 |
| `--of-radius-xl` | `10px` | 特殊强调容器 |
| `--of-radius-full` | `9999px` | 圆形头像、圆形按钮、药丸标签 |

**禁止**: 使用 3px、12px、50% 或其他不在此表的圆角值。圆形统一用 `9999px`（不用 `50%`）。

---

### 2.5 阴影系统

**只允许 4 级阴影**：

| Token | 值 | 用途 |
|-------|------|------|
| `--of-shadow-card` | `0 1px 8px 0 rgba(0,0,0,0.04)` | 卡片默认态 |
| `--of-shadow-card-hover` | `0 2px 12px 0 rgba(0,0,0,0.08)` | 卡片 hover 态 |
| `--of-shadow-panel` | `0 2px 12px 0 rgba(0,0,0,0.06)` | 面板、下拉菜单、Drawer |
| `--of-shadow-modal` | `0 8px 32px 0 rgba(0,0,0,0.12)` | Modal、Dialog |

**禁止**: 使用 `0 1px 3px rgba(0,0,0,0.06)` 等自定义阴影值。所有阴影必须引用变量。

---

### 2.6 边框系统

| Token | 值 | 用途 |
|-------|------|------|
| `--of-border-color` | `var(--of-color-gray-200)` | **唯一的边框颜色** |
| `--of-border` | `1px solid var(--of-border-color)` | 标准边框简写 |

**规则**:
- 边框宽度统一 `1px`，不使用 `1.5px`、`2px`
- 分割线用 `var(--of-color-gray-200)` 或 `var(--of-color-gray-100)`（轻量分割）
- 禁止使用 `#e5e7eb`、`#d9d9d9`、`#e0e0e0`、`#f0f0f0` 等非标边框色

---

### 2.7 动效系统

| Token | 值 | 用途 |
|-------|------|------|
| `--of-transition-fast` | `all 0.15s ease` | hover 态变化、颜色切换 |
| `--of-transition-normal` | `all 0.2s ease` | 展开/收起、面板滑动 |
| `--of-transition-slow` | `all 0.3s ease` | Modal 出场、页面级过渡 |

**规则**:
- 所有交互反馈用 `fast`（0.15s）
- 布局变化用 `normal`（0.2s）
- 全屏级动效用 `slow`（0.3s）
- 禁止超过 500ms 的动效
- 禁止纯装饰性动画（无功能意义的 pulse、bounce 等）

---

### 2.8 布局常量

| Token | 值 | 用途 |
|-------|------|------|
| `--of-navbar-height` | `56px` | 顶部导航栏高度 |
| `--of-sidebar-width` | `240px` | 侧边栏宽度 |
| `--of-statusbar-height` | `32px` | 底部状态栏高度 |
| `--of-kanban-column-width` | `280px` | 看板列宽度 |

---

## 第3章 组件规范

### 3.1 交互状态标准

**每个可交互元素必须实现以下 4 种状态**：

| 状态 | 背景变化 | 文字变化 | 边框变化 | 其他 |
|------|---------|---------|---------|------|
| **Default** | 组件基底色 | 正常色 | 正常色 | — |
| **Hover** | 加深一档（如 gray-50 → gray-100） | 不变 | 不变 | cursor: pointer |
| **Active / Pressed** | primary-50 背景 or primary-500 文字 | 可加深 | primary-200 | — |
| **Disabled** | 不变 | `opacity: 0.4` | 不变 | `pointer-events: none` |

**Focus 态**（键盘导航）:
```css
outline: none;
box-shadow: 0 0 0 2px var(--of-color-primary-200);
```

### 3.2 按钮密度

| 尺寸 | 高度 | padding | font-size | 用途 |
|------|------|---------|-----------|------|
| sm | `28px` | `4px 8px` | sm (12px) | 工具栏、表格内嵌 |
| md | `32px` | `4px 12px` | base (13px) | **默认** |
| lg | `36px` | `4px 16px` | md (14px) | 表单、Dialog 按钮 |

### 3.3 图标尺寸标准（新增）

**只允许 3 个图标尺寸**：

| Token | 值 | 用途 |
|-------|------|------|
| `--of-icon-sm` | `14px` | 表格内、badge 内、密集列表 |
| `--of-icon-md` | `16px` | **默认**: 按钮、Tab、工具栏 |
| `--of-icon-lg` | `20px` | 空状态、大标题旁 |

**禁止**: 使用 15px、18px 或其他非标尺寸。

### 3.4 头像尺寸标准

| 尺寸 | 值 | 用途 |
|------|------|------|
| sm | `24px` | 评论列表、紧凑卡片 |
| md | `32px` | **默认**: 看板卡片、表格行 |
| lg | `40px` | 详情页、个人信息 |

---

## 第4章 布局系统

### 4.1 页面结构

```
┌────────────────────────────────────────────┐
│  Navbar (56px fixed)                       │
├──────────┬─────────────────────────────────┤
│ Sidebar  │  Main Content                   │
│ (240px)  │  (flex: 1, overflow-y: auto)    │
│ fixed    │                                 │
│          │                                 │
├──────────┴─────────────────────────────────┤
│  StatusBar (32px fixed)                    │
└────────────────────────────────────────────┘
```

### 4.2 内容区域间距

| 区域 | padding | 内部 gap |
|------|---------|---------|
| 页面容器 | `24px` (spacing-6) | `16px` (spacing-4) |
| 卡片 | `16px` (spacing-4) | `12px` (spacing-3) |
| 面板 section | `12px` (spacing-3) | `8px` (spacing-2) |
| 表格行 | `8px 12px` | — |

### 4.3 响应式断点

| 断点 | 宽度 | 调整 |
|------|------|------|
| Desktop | `≥ 1024px` | 默认双栏 |
| Tablet | `768px ~ 1023px` | 侧边栏可收起 |
| Mobile | `< 768px` | 单栏，侧边栏隐藏 |

---

## 第5章 交互规范

### 5.1 反馈层级

| 操作类型 | 反馈方式 | 示例 |
|---------|---------|------|
| 轻量操作（hover、toggle） | 视觉变化（颜色/阴影） | 行 hover 变灰底 |
| 中量操作（保存、提交） | Toast 通知 | "保存成功" 3s 自动消失 |
| 重要操作（删除、不可逆） | Dialog 确认 | "确定删除？此操作不可恢复" |
| 长时间操作（加载、AI 流式） | 进度指示 | Skeleton / Thinking dots / ProgressBar |

### 5.2 Toast 规范

| 类型 | 图标色 | 背景色 | 持续时间 |
|------|--------|--------|---------|
| success | `--of-color-success` | `--of-color-success-light` | 3s |
| warning | `--of-color-warning` | `--of-color-warning-light` | 5s |
| error | `--of-color-error` | `--of-color-error-light` | 不自动关闭 |
| info | `--of-color-info` | `--of-color-info-light` | 3s |

### 5.3 空状态规范

所有列表/表格/面板在无数据时必须显示 EmptyState：
- 图标: `--of-icon-lg` (20px)，灰色 (`--of-color-gray-400`)
- 标题: `--of-font-size-lg` (16px)，主文字色
- 描述: `--of-font-size-base` (13px)，次要文字色
- 可选操作按钮: 主色

---

## 第6章 图标规范

### 6.1 图标集

统一使用 **Lucide** 图标集，通过 `lucide-vue-next` 引入。

### 6.2 命名注意

| 常见错误 | 正确名称 |
|---------|---------|
| `check-circle` | `circle-check` |
| `alert-triangle` | `triangle-alert` |
| `clock` | `clock-3` |

### 6.3 图标颜色

- 默认: `currentColor`（继承文字色）
- 交互态: 跟随文字色变化
- 状态图标: 使用语义色变量
- 禁止给图标单独指定硬编码颜色

---

## 第7章 组件开发检查清单

### 7.1 新组件开发前

- [ ] 确认是否已有可复用的 base 组件
- [ ] 查阅本标准确定要使用的 Token

### 7.2 开发中

- [ ] 所有颜色值使用 `var(--of-*)` 变量
- [ ] 字号只使用 6 档之一
- [ ] 字重只使用 400 / 500 / 600
- [ ] 间距只使用 2/4/8/12/16/24/32/40 px
- [ ] 圆角只使用 4/6/8/10/9999 px
- [ ] 阴影只使用 4 级之一
- [ ] 边框统一 `1px solid var(--of-border-color)`
- [ ] 图标尺寸只使用 14/16/20 px
- [ ] 使用 `<style scoped>` 防止样式泄漏
- [ ] 交互元素有 hover / active / disabled / focus 四态
- [ ] 动效使用 `var(--of-transition-*)` 变量

### 7.3 开发后

- [ ] 在 dev/App.vue 中添加演示
- [ ] 视觉与现有组件风格一致
- [ ] 无硬编码颜色值（可用 grep 检查 `/#[0-9a-fA-F]{3,8}/`）

---

## 第8章 现有组件改造清单

以下组件存在违反本标准的硬编码值，需逐步改造：

### 8.1 高优先级（色彩体系混乱）

| 组件 | 问题 | 改造要点 |
|------|------|---------|
| `Badge.vue` | 使用 Ant Design 色盘 | 改用 `--of-badge-*` Token |
| `StatusIndicator.vue` | 使用 `#1677ff`/`#52c41a`/`#ff4d4f` | 改用 `--of-status-*` / `--of-color-*` Token |
| `Stepper.vue` | 使用 `#52c41a`/`#1677ff`/`#d9d9d9` | 改用语义色 Token |
| `Switch.vue` | 使用 `#d9d9d9`/`#1677ff` | 改用 `--of-color-gray-300` / `--of-color-primary-500` |
| `MonitorItem.vue` | 使用 `#1677ff`/`#52c41a`/`#f0f0f0` | 改用语义色 + 灰阶 Token |
| `ActivityTimeline.vue` | 使用 `#1677ff`/`#52c41a`/`#fa8c16` | 改用 `--of-status-*` Token |

### 8.2 中优先级（文字色/边框不统一）

| 组件 | 问题 | 改造要点 |
|------|------|---------|
| `InfoCard.vue` | 文字色 `#1a1a1a`/`#888`/`#bbb` | 改用 `--of-color-text-*` Token |
| `PersonaCard.vue` | 文字色 `#1e293b`/`#64748b` | 改用 `--of-color-text-*` Token |
| `ChainItem.vue` | 文字色 `#111827`/`#999`，字体 `Roboto Mono` | 改用 Token + `--of-font-mono` |
| `MonitorItem.vue` | 文字色 `#262626`/`#666`/`#aaa` | 改用 `--of-color-text-*` Token |
| `SelectBadge.vue` | 自维护色盘 | 改用 `--of-badge-*` Token |
| `Avatar.vue` | 角色色硬编码 | 改用 `--of-role-*` Token |

### 8.3 低优先级（阴影/圆角/间距微调）

| 组件 | 问题 |
|------|------|
| `InfoCard.vue` | 阴影硬编码 → `var(--of-shadow-card)` |
| `PersonaCard.vue` | 阴影硬编码 → `var(--of-shadow-card)` |
| `DropdownMenu.vue` | 阴影硬编码 → `var(--of-shadow-panel)` |
| `RangeSlider.vue` | 阴影硬编码 |
| 多个组件 | 圆角 `999px`/`50%` → `var(--of-radius-full)` |

---

## 附录 A: Token 快速参考卡

```
颜色: --of-color-{primary|gray}-{50-900}
      --of-color-{success|warning|error|info}[-light]
      --of-color-text-{primary|secondary|tertiary|inverse|link}
      --of-color-bg-{canvas|elevated|hover|active|code}
      --of-priority-{p0|p1|p2|p3}-{text|bg}
      --of-status-{todo|in-progress|blocked|done}-{text|bg}
      --of-role-{be|fe|dba|arch|pm}-{text|bg}
      --of-badge-{blue|green|orange|red|purple|gray}-{text|bg|border}

字体: --of-font-{sans|mono}
      --of-font-size-{xs|sm|base|md|lg|xl}     = 11|12|13|14|16|18
      --of-font-weight-{normal|medium|semibold} = 400|500|600
      --of-line-height-{tight|normal|relaxed}   = 1.2|1.5|1.6

间距: --of-spacing-{0.5|1|2|3|4|6|8|10}        = 2|4|8|12|16|24|32|40

圆角: --of-radius-{sm|md|lg|xl|full}            = 4|6|8|10|9999
阴影: --of-shadow-{card|card-hover|panel|modal}
边框: --of-border-color / --of-border
动效: --of-transition-{fast|normal|slow}         = 0.15s|0.2s|0.3s
图标: --of-icon-{sm|md|lg}                       = 14|16|20
```

## 附录 B: 颜色对比度验证 (WCAG AA)

| 组合 | 前景色 | 背景色 | 对比度 | 结果 |
|------|--------|--------|--------|------|
| 主文字 on 白底 | `#0f172a` | `#ffffff` | 17.4:1 | PASS |
| 次要文字 on 白底 | `#64748b` | `#ffffff` | 4.7:1 | PASS |
| 弱文字 on 白底 | `#94a3b8` | `#ffffff` | 3.0:1 | PASS (large text) |
| Primary on 白底 | `#6366f1` | `#ffffff` | 4.6:1 | PASS |
| Error text on 浅红底 | `#dc2626` | `#fee2e2` | 4.8:1 | PASS |
| Success text on 浅绿底 | `#22c55e` | `#dcfce7` | 2.5:1 | 需 semibold 补偿 |
| Warning text on 浅黄底 | `#d97706` | `#fef3c7` | 3.6:1 | PASS (large text) |
