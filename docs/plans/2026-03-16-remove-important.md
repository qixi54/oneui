# 移除 !important 滥用 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 57 个 Vue 组件中 1985 处 `!important` 全部移除，恢复组件库对外的样式可覆盖能力。

**Architecture:** Vue `<style scoped>` 会为每个选择器自动注入 `[data-v-xxxxxxxx]` 属性选择器（+0-1-0 特异性），已完全足够实现组件隔离，无需 `!important`。修复策略为：直接删除所有 `!important` 标记，借助 stylelint `declaration-no-important: error` 作为守门员确认每批清零。`src/styles/markdown.css` 因需穿透第三方渲染内容，保留但添加注释说明。

**Tech Stack:** Vue 3 Scoped CSS · stylelint 16 · vitest 2 · pnpm

---

## 背景知识：为什么 scoped CSS 不需要 !important

Vue SFC 中 `<style scoped>` 的工作原理：

```css
/* 你写的代码 */
.of-card { display: flex; }

/* Vue 编译后实际生效的代码 */
.of-card[data-v-3a8f2b1c] { display: flex; }
```

- 自动附加的 `[data-v-xxxx]` 使特异性从 `0-1-0` 提升到 `0-2-0`
- 这比页面上大多数普通 class 选择器优先级更高
- **完全不需要 `!important`** 即可实现样式隔离

---

## 核实数据（执行前请验证）

```bash
# 基准 warning 数（当前应为 1985）
pnpm lint:style 2>&1 | grep 'declaration-no-important' | wc -l

# 基准文件数（当前应为 57）
grep -rn '!important' src/components/ --include='*.vue' -l | wc -l
```

---

## Task 0: 建立守门员——升级 stylelint 规则为 error

**Files:**
- Modify: `.stylelintrc.json`

**目的：** 将 `declaration-no-important` 从 `warning` 升级为 `error`，使后续每个 Task 都能用 lint 作为红绿灯。同时为 `markdown.css` 单独配置豁免，因其有合理的穿透需求。

---

**Step 1: 写"失败测试"——确认当前 lint 为 warning（非 error）**

```bash
cd /opt/Oneflow/flowlab/项目/oneui/code/develop
pnpm lint:style 2>&1 | grep '⚠' | head -5
# 预期输出：带 ⚠ 的 warning，说明当前只是警告，不阻断
```

---

**Step 2: 修改 `.stylelintrc.json`**

将当前内容：
```json
{
  "customSyntax": "postcss-html",
  "rules": {
    "declaration-no-important": [true, { "severity": "warning" }],
    "color-named": ["never", { "severity": "error" }],
    "color-no-invalid-hex": [true, { "severity": "error" }]
  },
  "overrides": [
    {
      "files": ["**/*.vue"],
      "customSyntax": "postcss-html"
    },
    {
      "files": ["**/*.css"],
      "customSyntax": "postcss"
    }
  ]
}
```

改为：
```json
{
  "customSyntax": "postcss-html",
  "rules": {
    "declaration-no-important": [true, { "severity": "error" }],
    "color-named": ["never", { "severity": "error" }],
    "color-no-invalid-hex": [true, { "severity": "error" }]
  },
  "overrides": [
    {
      "files": ["**/*.vue"],
      "customSyntax": "postcss-html"
    },
    {
      "files": ["**/*.css"],
      "customSyntax": "postcss",
      "rules": {
        "declaration-no-important": null
      }
    }
  ]
}
```

> 注意：`"rules": null` 表示对 `.css` 文件完全关闭此规则，`markdown.css` 保留 `!important` 无需改动。

---

**Step 3: 验证 lint 现在为 error（红状态）**

```bash
pnpm lint:style 2>&1 | grep '✖' | head -5
# 预期：带 ✖ 的 error 输出，说明规则已升级
pnpm lint:style 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：约 1903（.vue 文件中的 !important 数，.css 文件已豁免）
```

---

**Step 4: 提交守门员配置**

```bash
git add .stylelintrc.json
git commit -m "chore: elevate declaration-no-important to error for .vue files

Ref: ONEUI-FE-00053"
```

---

## Task 1: 修复 base/ 最高密度文件（PersonaCard · SectionBlock · InfoCard）

**Files:**
- Modify: `src/components/base/PersonaCard.vue` (114处)
- Modify: `src/components/base/SectionBlock.vue` (96处)
- Modify: `src/components/base/InfoCard.vue` (91处)

**合计：约 301 处**

---

**Step 1: 确认这三个文件的 lint 基准**

```bash
pnpm stylelint src/components/base/PersonaCard.vue 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：114
pnpm stylelint src/components/base/SectionBlock.vue 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：96
pnpm stylelint src/components/base/InfoCard.vue 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：91
```

---

**Step 2: 批量移除三个文件中的 `!important`**

```bash
# 对三个文件批量替换：移除所有 !important（含前置空格）
sed -i 's/ !important//g' src/components/base/PersonaCard.vue
sed -i 's/ !important//g' src/components/base/SectionBlock.vue
sed -i 's/ !important//g' src/components/base/InfoCard.vue
```

> **原理说明：** 这三个文件均使用 `<style scoped>`，所有 CSS 属性后面的 ` !important` 可以直接删除。Vue 的 scoped 机制会自动注入 `[data-v-xxxx]` 保证样式隔离，无需 `!important`。

---

**Step 3: 验证 lint 清零（绿状态）**

```bash
pnpm stylelint "src/components/base/PersonaCard.vue" "src/components/base/SectionBlock.vue" "src/components/base/InfoCard.vue" 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：0
```

如果非 0，说明有未被匹配的 `!important` 格式（例如 `!important;` 紧跟分号无空格），运行：

```bash
grep -n '!important' src/components/base/PersonaCard.vue
# 查看剩余实例，手动确认格式后再处理
```

---

**Step 4: 运行集成测试，确保无回归**

```bash
pnpm test
# 预期：所有测试 PASS（当前无针对这三个组件的 CSS 测试，行为测试不受影响）
```

---

**Step 5: 提交**

```bash
git add src/components/base/PersonaCard.vue src/components/base/SectionBlock.vue src/components/base/InfoCard.vue
git commit -m "fix(style): remove !important from PersonaCard, SectionBlock, InfoCard

Removes 301 unnecessary !important declarations.
Vue scoped CSS provides sufficient isolation via [data-v-xxxx] selectors.

Ref: ONEUI-FE-00053"
```

---

## Task 2: 修复 base/ + tabs/ 中高密度文件（Tabs · ViewSwitcher · Stepper · DropdownMenu）

**Files:**
- Modify: `src/components/tabs/Tabs.vue` (86处)
- Modify: `src/components/base/ViewSwitcher.vue` (73处)
- Modify: `src/components/base/Stepper.vue` (64处)
- Modify: `src/components/base/DropdownMenu.vue` (56处)

**合计：约 279 处**

---

**Step 1: 确认基准**

```bash
for f in src/components/tabs/Tabs.vue src/components/base/ViewSwitcher.vue src/components/base/Stepper.vue src/components/base/DropdownMenu.vue; do
  count=$(grep -c '!important' "$f")
  echo "$count $f"
done
# 预期：86, 73, 64, 56
```

---

**Step 2: 批量移除**

```bash
sed -i 's/ !important//g' src/components/tabs/Tabs.vue
sed -i 's/ !important//g' src/components/base/ViewSwitcher.vue
sed -i 's/ !important//g' src/components/base/Stepper.vue
sed -i 's/ !important//g' src/components/base/DropdownMenu.vue
```

---

**Step 3: 验证 lint 清零**

```bash
pnpm stylelint "src/components/tabs/Tabs.vue" "src/components/base/ViewSwitcher.vue" "src/components/base/Stepper.vue" "src/components/base/DropdownMenu.vue" 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：0
```

---

**Step 4: 运行测试**

```bash
pnpm test
# 预期：全部 PASS
```

---

**Step 5: 提交**

```bash
git add src/components/tabs/Tabs.vue src/components/base/ViewSwitcher.vue src/components/base/Stepper.vue src/components/base/DropdownMenu.vue
git commit -m "fix(style): remove !important from Tabs, ViewSwitcher, Stepper, DropdownMenu

Removes 279 unnecessary !important declarations.

Ref: ONEUI-FE-00053"
```

---

## Task 3: 修复 base/ 剩余高密度文件（MonitorItem · EmptyState · RangeSlider · Accordion · Switch · StatusSummary · ChainItem）

**Files:**
- Modify: `src/components/base/MonitorItem.vue` (40处)
- Modify: `src/components/base/EmptyState.vue` (40处)
- Modify: `src/components/base/RangeSlider.vue` (38处)
- Modify: `src/components/base/Accordion.vue` (37处)
- Modify: `src/components/base/Switch.vue` (35处)
- Modify: `src/components/base/StatusSummary.vue` (33处)
- Modify: `src/components/base/ChainItem.vue` (32处)

**合计：约 255 处**

---

**Step 1: 批量移除**

```bash
for f in \
  src/components/base/MonitorItem.vue \
  src/components/base/EmptyState.vue \
  src/components/base/RangeSlider.vue \
  src/components/base/Accordion.vue \
  src/components/base/Switch.vue \
  src/components/base/StatusSummary.vue \
  src/components/base/ChainItem.vue; do
  sed -i 's/ !important//g' "$f"
done
```

---

**Step 2: 验证 lint 清零**

```bash
pnpm stylelint \
  "src/components/base/MonitorItem.vue" \
  "src/components/base/EmptyState.vue" \
  "src/components/base/RangeSlider.vue" \
  "src/components/base/Accordion.vue" \
  "src/components/base/Switch.vue" \
  "src/components/base/StatusSummary.vue" \
  "src/components/base/ChainItem.vue" \
  2>&1 | grep 'declaration-no-important' | wc -l
# 预期：0
```

---

**Step 3: 运行测试**

```bash
pnpm test
```

---

**Step 4: 提交**

```bash
git add \
  src/components/base/MonitorItem.vue \
  src/components/base/EmptyState.vue \
  src/components/base/RangeSlider.vue \
  src/components/base/Accordion.vue \
  src/components/base/Switch.vue \
  src/components/base/StatusSummary.vue \
  src/components/base/ChainItem.vue
git commit -m "fix(style): remove !important from 7 base components (MonitorItem ~ ChainItem)

Removes 255 unnecessary !important declarations.

Ref: ONEUI-FE-00053"
```

---

## Task 4: 修复 base/ 剩余低密度文件（12 个组件）

**Files:**
- Modify: `src/components/base/ButtonGroup.vue` (29处)
- Modify: `src/components/base/StatisticCard.vue` (28处)
- Modify: `src/components/base/SelectBadge.vue` (27处)
- Modify: `src/components/base/ViewTab.vue` (23处)
- Modify: `src/components/base/ViewModeGroup.vue` (22处)
- Modify: `src/components/base/ToolbarBtn.vue` (22处)
- Modify: `src/components/base/RefTag.vue` (22处)
- Modify: `src/components/base/AddViewBtn.vue` (20处)
- Modify: `src/components/base/ProgressBar.vue` (19处)
- Modify: `src/components/base/Badge.vue` (17处)
- Modify: `src/components/base/Avatar.vue` (16处)
- Modify: `src/components/base/DescBlock.vue` (12处)
- Modify: `src/components/tabs/TabPanel.vue` (2处)

**合计：约 259 处**

---

**Step 1: 批量移除**

```bash
for f in \
  src/components/base/ButtonGroup.vue \
  src/components/base/StatisticCard.vue \
  src/components/base/SelectBadge.vue \
  src/components/base/ViewTab.vue \
  src/components/base/ViewModeGroup.vue \
  src/components/base/ToolbarBtn.vue \
  src/components/base/RefTag.vue \
  src/components/base/AddViewBtn.vue \
  src/components/base/ProgressBar.vue \
  src/components/base/Badge.vue \
  src/components/base/Avatar.vue \
  src/components/base/DescBlock.vue \
  src/components/tabs/TabPanel.vue; do
  sed -i 's/ !important//g' "$f"
done
```

---

**Step 2: 验证 base/ 目录全部清零**

```bash
# 验证 base/ 目录已全部清零
grep -rn '!important' src/components/base/ --include='*.vue' | wc -l
# 预期：0

grep -rn '!important' src/components/tabs/ --include='*.vue' | wc -l
# 预期：0
```

---

**Step 3: 运行测试**

```bash
pnpm test
```

---

**Step 4: 提交**

```bash
git add src/components/base/ src/components/tabs/TabPanel.vue
git commit -m "fix(style): remove !important from remaining base/ and tabs/ components

Completes base/ directory cleanup. Removes 259 !important declarations.
base/ and tabs/ directories now fully compliant.

Ref: ONEUI-FE-00053"
```

---

## Task 5: 修复 overlay/ + layout/ 目录

**Files:**
- Modify: `src/components/overlay/Modal.vue` (66处)
- Modify: `src/components/overlay/Dialog.vue` (61处)
- Modify: `src/components/overlay/SidePanel.vue` (46处)
- Modify: `src/components/layout/Navbar.vue` (48处)
- Modify: `src/components/layout/Sidebar.vue` (36处)
- Modify: `src/components/layout/AppLayout.vue` (22处)
- Modify: `src/components/layout/StatusBar.vue` (23处)

**合计：约 302 处**

---

**Step 1: 批量移除**

```bash
for f in \
  src/components/overlay/Modal.vue \
  src/components/overlay/Dialog.vue \
  src/components/overlay/SidePanel.vue \
  src/components/layout/Navbar.vue \
  src/components/layout/Sidebar.vue \
  src/components/layout/AppLayout.vue \
  src/components/layout/StatusBar.vue; do
  sed -i 's/ !important//g' "$f"
done
```

---

**Step 2: 验证 lint 清零**

```bash
grep -rn '!important' src/components/overlay/ --include='*.vue' | wc -l
# 预期：0
grep -rn '!important' src/components/layout/ --include='*.vue' | wc -l
# 预期：0
```

---

**Step 3: 运行测试（含 Drawer 集成测试）**

```bash
pnpm test
# drawer.integration.spec.ts 会覆盖 overlay 相关组件
```

---

**Step 4: 提交**

```bash
git add src/components/overlay/ src/components/layout/
git commit -m "fix(style): remove !important from overlay/ and layout/ components

Removes 302 !important declarations from Modal, Dialog, SidePanel,
Navbar, Sidebar, AppLayout, StatusBar.

Ref: ONEUI-FE-00053"
```

---

## Task 6: 修复 timeline/ + table/ 目录

**Files:**
- Modify: `src/components/timeline/ActivityTimeline.vue` (74处)
- Modify: `src/components/timeline/GanttTimeline.vue` (11处)
- Modify: `src/components/timeline/GanttRow.vue` (10处)
- Modify: `src/components/table/TableGroupRow.vue` (50处)

**合计：约 145 处**

---

**Step 1: 批量移除**

```bash
for f in \
  src/components/timeline/ActivityTimeline.vue \
  src/components/timeline/GanttTimeline.vue \
  src/components/timeline/GanttRow.vue \
  src/components/table/TableGroupRow.vue; do
  sed -i 's/ !important//g' "$f"
done
```

---

**Step 2: 验证 lint 清零**

```bash
grep -rn '!important' src/components/timeline/ --include='*.vue' | wc -l
# 预期：0
grep -rn '!important' src/components/table/ --include='*.vue' | wc -l
# 预期：0（table/ 其余文件也应已无 !important）
```

---

**Step 3: 运行测试（含 gantt + table 集成测试）**

```bash
pnpm test
# gantt.integration.spec.ts 和 table-detail.integration.spec.ts 会跑到
```

---

**Step 4: 提交**

```bash
git add src/components/timeline/ src/components/table/TableGroupRow.vue
git commit -m "fix(style): remove !important from timeline/ and table/ components

Removes 145 !important declarations from ActivityTimeline, GanttTimeline,
GanttRow, TableGroupRow.

Ref: ONEUI-FE-00053"
```

---

## Task 7: 修复 mermaid/ + breadcrumb/ 目录

**Files:**
- Modify: `src/components/mermaid/MermaidChart.vue` (59处)
- Modify: `src/components/breadcrumb/Breadcrumb.vue` (39处)
- Modify: `src/components/breadcrumb/BreadcrumbItem.vue` (25处)

**合计：约 123 处**

---

**Step 1: 批量移除**

```bash
for f in \
  src/components/mermaid/MermaidChart.vue \
  src/components/breadcrumb/Breadcrumb.vue \
  src/components/breadcrumb/BreadcrumbItem.vue; do
  sed -i 's/ !important//g' "$f"
done
```

---

**Step 2: 验证 lint 清零**

```bash
grep -rn '!important' src/components/mermaid/ --include='*.vue' | wc -l
# 预期：0
grep -rn '!important' src/components/breadcrumb/ --include='*.vue' | wc -l
# 预期：0
```

---

**Step 3: 运行测试**

```bash
pnpm test
```

---

**Step 4: 提交**

```bash
git add src/components/mermaid/ src/components/breadcrumb/
git commit -m "fix(style): remove !important from mermaid/ and breadcrumb/ components

Removes 123 !important declarations.

Ref: ONEUI-FE-00053"
```

---

## Task 8: 修复 toast/ 和 split/ 目录（含特殊处理）

> ⚠️ **特别注意：这两个目录有非 scoped 的全局 style 块**
> - `src/components/split/SplitPane.vue` — `<style>` （无 scoped）
> - `src/components/toast/ToastContainer.vue` — `<style>` （无 scoped）
>
> 这类文件直接删 `!important` 有特异性风险，需要先确认类名是否足够唯一。

**Files:**
- Modify: `src/components/toast/ToastItem.vue` (46处，scoped，正常处理)
- Modify: `src/components/toast/ToastContainer.vue` (17处，全局 style，特殊处理)
- Modify: `src/components/split/SplitPane.vue` (55处，全局 style，特殊处理)

---

**Step 1: 处理 scoped 文件 ToastItem.vue（正常流程）**

```bash
sed -i 's/ !important//g' src/components/toast/ToastItem.vue
grep -c '!important' src/components/toast/ToastItem.vue
# 预期：0
```

---

**Step 2: 检查 ToastContainer.vue 全局 style 的类名唯一性**

```bash
grep -n 'class\|!important' src/components/toast/ToastContainer.vue | head -30
```

检查所有类名（如 `.of-toast-container`）是否以 `of-` 前缀开头。如果是，说明命名空间已足够唯一，可以安全移除 `!important`。

```bash
# 如果类名都是 of- 前缀，直接移除
sed -i 's/ !important//g' src/components/toast/ToastContainer.vue
# 同时将 <style> 改为 <style scoped> 避免未来的全局污染
sed -i 's/<style>/<style scoped>/' src/components/toast/ToastContainer.vue
```

---

**Step 3: 检查 SplitPane.vue 全局 style 的类名唯一性**

```bash
grep -n '^\.' src/components/split/SplitPane.vue | head -20
```

检查类名是否都是 `of-split-*` 前缀。如果是，可以安全移除并加 scoped：

```bash
sed -i 's/ !important//g' src/components/split/SplitPane.vue
sed -i 's/<style>/<style scoped>/' src/components/split/SplitPane.vue
```

> 如果 SplitPane 内部有 `:deep()` 需求（穿透子组件），保留 `<style>` 全局块，但移除所有 `!important`，因全局样式+唯一类名已足够。

---

**Step 4: 验证 lint 清零**

```bash
grep -rn '!important' src/components/toast/ --include='*.vue' | wc -l
# 预期：0
grep -rn '!important' src/components/split/ --include='*.vue' | wc -l
# 预期：0
```

---

**Step 5: 运行测试**

```bash
pnpm test
```

---

**Step 6: 提交**

```bash
git add src/components/toast/ src/components/split/
git commit -m "fix(style): remove !important from toast/ and split/ components

Also converts <style> to <style scoped> for ToastContainer and SplitPane
where class names are already namespaced with 'of-' prefix.

Ref: ONEUI-FE-00053"
```

---

## Task 9: 修复 detail/ + editor/ + gallery/ + ai/ + Dashboard/ 目录

**Files:**
- Modify: `src/components/detail/DetailLayout.vue` (25处)
- Modify: `src/components/detail/CommentItem.vue` (17处)
- Modify: `src/components/detail/PropRow.vue` (10处)
- Modify: `src/components/detail/PropPanel.vue` (5处)
- Modify: `src/components/editor/ContentBlock.vue` (10处)
- Modify: `src/components/editor/BlockQuote.vue` (10处)
- Modify: `src/components/editor/CodeBlock.vue` (8处)
- Modify: `src/components/editor/RefLink.vue` (5处)
- Modify: `src/components/gallery/GalleryCard.vue` (20处)
- Modify: `src/components/gallery/GalleryView.vue` (3处)
- Modify: `src/components/ai/AiMessageBubble.vue` (2处)
- Modify: `src/components/Dashboard/index.vue` (2处)

**合计：约 117 处**

---

**Step 1: 批量移除**

```bash
for f in \
  src/components/detail/DetailLayout.vue \
  src/components/detail/CommentItem.vue \
  src/components/detail/PropRow.vue \
  src/components/detail/PropPanel.vue \
  src/components/editor/ContentBlock.vue \
  src/components/editor/BlockQuote.vue \
  src/components/editor/CodeBlock.vue \
  src/components/editor/RefLink.vue \
  src/components/gallery/GalleryCard.vue \
  src/components/gallery/GalleryView.vue \
  src/components/ai/AiMessageBubble.vue \
  src/components/Dashboard/index.vue; do
  sed -i 's/ !important//g' "$f"
done
```

---

**Step 2: 验证这些目录全部清零**

```bash
for dir in detail editor gallery ai Dashboard; do
  count=$(grep -rn '!important' "src/components/$dir/" --include='*.vue' | wc -l)
  echo "$dir: $count"
done
# 预期：每个目录均为 0
```

---

**Step 3: 运行测试**

```bash
pnpm test
```

---

**Step 4: 提交**

```bash
git add src/components/detail/ src/components/editor/ src/components/gallery/ src/components/ai/ src/components/Dashboard/
git commit -m "fix(style): remove !important from detail/, editor/, gallery/, ai/, Dashboard/

Removes 117 !important declarations. All component directories now clean.

Ref: ONEUI-FE-00053"
```

---

## Task 10: 最终验收——全量验证 + 关闭 Issue

**Files:**
- No code changes（仅验证）

---

**Step 1: 全量 lint 验证 Vue 组件零 !important**

```bash
grep -rn '!important' src/components/ --include='*.vue' | wc -l
# 预期：0

pnpm lint:style 2>&1 | grep 'declaration-no-important' | wc -l
# 预期：0（.vue 文件）
```

---

**Step 2: 确认 markdown.css 豁免状态**

```bash
pnpm lint:style 2>&1 | grep 'error' | wc -l
# 预期：0（markdown.css 的 !important 已通过 .css overrides 豁免）

# 确认 markdown.css 中有说明注释（手动检查）
head -5 src/styles/markdown.css
```

如果 `markdown.css` 顶部没有说明注释，在文件最顶部添加：

```css
/*
 * markdown.css — 第三方 Markdown 渲染样式
 *
 * 本文件中的 !important 是有意保留的。
 * 原因：marked/highlight.js 渲染的 HTML 内容不在 Vue 组件树内，
 *       无法使用 scoped 机制，需要 !important 确保样式能覆盖
 *       宿主页面可能存在的同名选择器。
 */
```

---

**Step 3: 运行全量测试**

```bash
pnpm test
# 预期：全部 PASS
```

---

**Step 4: 运行构建验证**

```bash
pnpm build
# 预期：build 成功，无 CSS 错误
```

---

**Step 5: 统计最终数字**

```bash
echo "=== 修复结果统计 ==="
echo "Vue 组件 !important 数量:"
grep -rn '!important' src/components/ --include='*.vue' | wc -l

echo "markdown.css !important 数量（保留）:"
grep -c '!important' src/styles/markdown.css

echo "stylelint error 数量:"
pnpm lint:style 2>&1 | grep '✖' | wc -l
```

---

**Step 6: 提交最终说明 commit**

```bash
git add src/styles/markdown.css
git commit -m "docs(style): add comment to markdown.css explaining intentional !important

Documents why !important is kept in markdown.css (third-party rendered HTML
outside Vue component tree cannot use scoped mechanism).

Ref: ONEUI-FE-00053"
```

---

**Step 7: 在 FlowAPI 标记 Issue 解决**

```bash
curl -s -X POST http://127.0.0.1:8900/api/issue/detail?issue_id=ONEUI-FE-00053 \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: system-internal' \
  -d '{"project":"oneui","channel":"main"}' | jq '.data.issue.status'
# 确认当前为 open，然后通知用户手动关闭或通过 fix_task_id 关联
```

---

## 验收标准核查表

执行完所有 Task 后，逐项核对：

- [ ] `grep -rn '!important' src/components/ --include='*.vue' | wc -l` 输出为 `0`
- [ ] `pnpm lint:style` 无任何 error（warning 来自 markdown.css，已豁免）
- [ ] `pnpm test` 全部 PASS
- [ ] `pnpm build` 构建成功
- [ ] `src/styles/markdown.css` 顶部有说明注释
- [ ] git log 显示 10 个相关 commit（Task 0 ~ Task 9 + 最终说明 commit）

---

## 故障排查指南

### 问题：移除后某组件样式异常

**症状：** 某个组件移除 `!important` 后，在 dev server 中看起来样式错乱。

**原因：** 该组件被宿主页面的某个全局样式覆盖了。

**排查步骤：**
```bash
# 1. 找到异常的 CSS 属性，例如 display
# 2. 在浏览器 DevTools 中查看该属性的覆盖来源
# 3. 在冲突的全局样式处添加更具体的选择器，而不是恢复 !important
```

**解决方案：** 不要恢复 `!important`，改为提升组件选择器特异性：

```css
/* 方案 A：双类名 */
.of-persona-card.of-persona-card { display: flex; }

/* 方案 B：父子选择器 */
.of-persona-card > .of-persona-card__body { flex: 1; }
```

---

### 问题：`sed` 替换后出现语法错误

**症状：** `pnpm lint:style` 报告 CSS 语法错误而非 !important 错误。

**原因：** 可能存在 `!important` 不带前置空格的写法，如 `flex!important` 或 `!important` 出现在非 CSS 上下文中（如 template 的 class 字符串）。

**排查步骤：**
```bash
# 检查是否有无空格的 !important
grep -n '!important' src/components/base/PersonaCard.vue
# 找到异常行，手动修复
```

---

### 问题：SplitPane 或 ToastContainer 改 scoped 后子组件样式失效

**症状：** 将 `<style>` 改为 `<style scoped>` 后，组件内的第三方子组件样式丢失。

**原因：** scoped 的 `[data-v-xxxx]` 不会穿透到子组件，全局样式中针对子组件的选择器失效。

**解决方案：** 不强制改 scoped，保留 `<style>` 全局块，但确保移除 `!important` 即可（唯一的 `of-` 类名前缀已足够防止污染）：

```bash
# 撤销 scoped 修改
sed -i 's/<style scoped>/<style>/' src/components/split/SplitPane.vue
# 但保留 !important 的移除
```

---

## 执行顺序总结

| Task | 目录/文件 | 估计 !important 数 | 特殊处理 |
|------|----------|-------------------|---------|
| Task 0 | `.stylelintrc.json` | — | 升级规则为 error |
| Task 1 | base/ 前3大文件 | 301 | — |
| Task 2 | tabs/Tabs + base/ 次高4文件 | 279 | — |
| Task 3 | base/ 中密度7文件 | 255 | — |
| Task 4 | base/ 低密度12文件 + TabPanel | 259 | — |
| Task 5 | overlay/ + layout/ | 302 | — |
| Task 6 | timeline/ + table/ | 145 | — |
| Task 7 | mermaid/ + breadcrumb/ | 123 | — |
| Task 8 | toast/ + split/ | 118 | 两个全局 style 块需特殊处理 |
| Task 9 | detail/ + editor/ + gallery/ + ai/ + Dashboard/ | 117 | — |
| Task 10 | 最终验收 | — | 全量验证 + 构建 + 关闭 issue |
| **合计** | | **1899** | |
