---
生成时间: 2026-03-24 12:45:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/src
角色定义: ARCH
文档生成目的: 记录 OneUI v0.9.0 发版内容
生成模型: claude-opus-4-6
---

# OneUI v0.9.0 — Design Token 全量治理 + 表单独立模式

## 版本概述

`0.9.0` 是一次 minor release，包含三大类变更：

1. **设计 Token 全量迁移** — 134 个组件的 CSS 硬编码值 100% 替换为 Token 引用
2. **3 个新功能** — Field standalone 模式、Badge variant、Navbar 扩展 slot
3. **视觉层次提升** — 卡片统一 hover 态、Kanban 滚动指示器

所有改动向后兼容，不传新 prop 时行为与 0.8.x 完全一致。

## 变更清单

### Feature: Field 组件独立表单模式 (ONEUI-FE-00112)

5 个 P0 Field 组件（FieldText, FieldSelect, FieldMultiSelect, FieldDate, FieldRichText）支持脱离 DataTable 独立使用：

- 新增 `v-model` 双向绑定（`modelValue` + `update:modelValue`）
- 新增 `label` / `placeholder` / `required` / `disabled` / `error` props
- FieldSelect/FieldMultiSelect 支持直接传 `options` 数组
- standalone 模式自带 label/control/error wrapper，含 focus-within 高亮和 error 态
- `field` prop 从必填改为可选，传入时行为不变
- 独立导出：`import { FieldText, FieldSelect, ... } from '@oneflowui/ui'`

### Feature: Badge variant 变体 (ONEUI-FE-00110)

Badge 新增 `variant` prop，支持三种视觉风格：

- `outlined`（默认，向后兼容）：浅色背景 + 深色边框 + 深色文字
- `solid`：纯色背景 + 白色文字，无边框
- `subtle`：浅色背景 + 深色文字，无边框

7 种预设颜色 × 3 种变体 = 21 种组合，priority 快捷方式同样支持。

### Feature: Navbar 扩展 slot (ONEUI-FE-00108)

Navbar 新增 `#header-left` 和 `#header-right` 两个具名 slot：

- `#header-left`：渲染在 logo 右侧、search 左侧（适合项目选择器、角色切换器）
- `#header-right`：渲染在 search 右侧、notify 左侧（适合自定义操作按钮）
- 不传 slot 时布局与之前完全一致
- search 区域保持弹性宽度，不被 slot 内容挤压

### Refactor: 设计 Token 全量迁移

系统性替换 134 个组件中的 ~400 处硬编码 CSS 值：

- **间距** (padding/margin/gap)：40% → 100% Token 采纳率
- **字号** (font-size)：30% → 100%
- **圆角** (border-radius)：70% → 100%
- **z-index**：0% → 100%（新建 11 级层级系统）
- **字重/行高**：全部迁移至 Token

新增 Token：
- 间距：`--of-spacing-0_75` (3px), `--of-spacing-1_25` (5px), `--of-spacing-1_5` (6px), `--of-spacing-2_5` (10px), `--of-spacing-3_5` (14px)
- 字号：`--of-font-size-2xs` (9px), `--of-font-size-2xl` (24px), `--of-font-size-3xl` (32px)
- 字重：`--of-font-weight-bold` (700)
- 圆角：`--of-radius-2xl` (20px)
- Z-Index：`--of-z-base` 到 `--of-z-toast` 共 11 级
- 断点：`--of-breakpoint-sm/md/lg/xl`

### Enhancement: 视觉层次提升

- StatisticCard / NumberCard / InfoCard 添加统一 hover 态（shadow + border 过渡）
- KanbanBoard 添加水平滚动渐变指示器（左右渐变遮罩 + scroll 检测）

## 测试

- 测试文件：24 个（+3 新增：badge / field-standalone / navbar）
- 测试用例：104 个（+12 新增）
- 全部通过

## 影响范围

| 指标 | 数值 |
|------|------|
| 修改文件 | 140+ |
| 新增导出 | FieldText, FieldSelect, FieldMultiSelect, FieldDate, FieldRichText |
| 新增 prop | Badge.variant, Field.modelValue/label/placeholder/required/disabled/error |
| 新增 slot | Navbar: #header-left, #header-right |
| 新增 Token | 20+ |
| 向后兼容 | 是（所有新增均为可选） |
