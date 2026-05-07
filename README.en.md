# OneFlow UI

[![npm version](https://img.shields.io/npm/v/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![npm downloads](https://img.shields.io/npm/dm/@oneflowui/ui.svg)](https://www.npmjs.com/package/@oneflowui/ui)
[![license](https://img.shields.io/npm/l/@oneflowui/ui.svg)](https://github.com/qixi54/oneui/blob/main/LICENSE)

A **Vue 3 + TypeScript** UI library for building task management and productivity applications. It now includes a page-level `DatabaseView` solution on top of the component layer.

> [中文文档](./README.md)

---

## Components at a Glance

| Category | Components |
|----------|-----------|
| **Views** | DataTable, KanbanBoard, GalleryView, GanttTimeline |
| **AI Chat** | AiMessageList, AiMessageBubble, AiSender, AiThinking, AiStreamingCursor |
| **Dashboard** | Dashboard, BarChart, PieChart, DoughnutChart, NumberCard |
| **Editors** | RichTextEditor, CodeBlock, ContentBlock |
| **Detail** | DetailLayout, PropPanel, CommentItem |
| **Forms** | FormDesigner, 10 field components |
| **Layout** | AppLayout, Sidebar, Navbar, SplitPane |
| **General** | Modal, Dialog, Toast, Tabs, Breadcrumb, MermaidChart, ContextMenu |

---

## Preview

<table>
  <tr>
    <td align="center"><b>Kanban Board</b></td>
    <td align="center"><b>Data Table</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/kanban.png" alt="Kanban" /></td>
    <td><img src="screenshots/table.png" alt="DataTable" /></td>
  </tr>
  <tr>
    <td align="center"><b>Gantt Timeline</b></td>
    <td align="center"><b>Dashboard</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/gantt.png" alt="Gantt" /></td>
    <td><img src="screenshots/dashboard.png" alt="Dashboard" /></td>
  </tr>
  <tr>
    <td align="center"><b>AI Chat</b></td>
    <td align="center"><b>Detail Layout</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/ai.png" alt="AI Chat" /></td>
    <td><img src="screenshots/detail.png" alt="Detail" /></td>
  </tr>
  <tr>
    <td align="center"><b>Rich Text Editor</b></td>
    <td align="center"><b>Mermaid Chart</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/editor.png" alt="Editor" /></td>
    <td><img src="screenshots/mermaid.png" alt="Mermaid" /></td>
  </tr>
</table>

---

## Installation

```bash
# pnpm (recommended)
pnpm add @oneflowui/ui

# npm
npm install @oneflowui/ui

# yarn
yarn add @oneflowui/ui
```

Install peer dependencies as needed:

```bash
pnpm add vue
pnpm add mermaid   # required only when using MermaidChart
```

---

## Quick Start

### Register globally

```ts
import { createApp } from 'vue'
import App from './App.vue'
import OneflowUI from '@oneflowui/ui/plugin'
import '@oneflowui/ui/styles'

const app = createApp(App)
app.use(OneflowUI)
app.mount('#app')
```

### Import on demand

```ts
import { KanbanBoard, DataTable, AiMessageList, MermaidChart } from '@oneflowui/ui'
import '@oneflowui/ui/styles'
```

Note: starting from `0.5.4`, the plugin entry is separated from the root entry. Use `@oneflowui/ui/plugin` for `app.use(...)`, and keep named imports on `@oneflowui/ui`.

If you want a stricter import boundary, stable subpath exports are also available:

```ts
import { useVirtualListStateCache } from '@oneflowui/ui/composables'
import type { DataRecord } from '@oneflowui/ui/types'
```

Recommended convention:
- Import components and common capabilities from the root `@oneflowui/ui` entry.
- Import composables and pure types from `@oneflowui/ui/composables` and `@oneflowui/ui/types` when you want a clearer dependency boundary.
- If you only want tokens and theme layers without plugin registration, use `@oneflowui/ui/theme`.
- Keep `@oneflowui/ui/styles` as the full legacy-compatible style entry.

### Theme Layers

OneUI now ships with a neutral default theme and an optional product skin without changing component logic.

- Default theme: `neutral`
- Optional skin: `ops-console`

Recommended usage is to keep components on shared tokens and switch the theme at the app layer instead of overriding component internals.

```ts
import '@oneflowui/ui/styles'

document.documentElement.dataset.ofTheme = 'neutral'
// or
document.documentElement.dataset.ofTheme = 'ops-console'
```

If you want to decouple “style injection” from “plugin registration”, prefer the dedicated theme entry:

```ts
import '@oneflowui/ui/theme'
```

This structure is meant to keep the component layer reusable while letting product-specific styling live above it.

### Token Override / Theme Bridge

If your app already owns its own design tokens, keep them as the source of truth and bridge them into OneUI through CSS variables. The runtime theme files follow the same idea: `src/styles/variables.css` defines the default `--of-*` surface, while `src/styles/themes/neutral.css` and `src/styles/themes/ops-console.css` only override the semantic layer.

```css
:root {
  --app-surface-canvas: #f6f7f9;
  --app-surface-panel: #ffffff;
  --app-text-primary: #0f172a;
  --app-text-secondary: #526071;
  --app-border-subtle: rgba(15, 23, 42, 0.08);
  --app-accent-default: #334155;

  --of-surface-canvas: var(--app-surface-canvas);
  --of-surface-elevated: var(--app-surface-panel);
  --of-text-primary: var(--app-text-primary);
  --of-text-secondary: var(--app-text-secondary);
  --of-border-subtle: var(--app-border-subtle);
  --of-accent-default: var(--app-accent-default);
}
```

For local theming, scope the bridge to a wrapper instead of mutating the document root:

```css
.ops-preview {
  --app-surface-canvas: #edf3f8;
  --app-surface-panel: rgba(255, 255, 255, 0.88);
  --app-accent-default: #0f4c81;

  --of-surface-canvas: var(--app-surface-canvas);
  --of-surface-elevated: var(--app-surface-panel);
  --of-accent-default: var(--app-accent-default);
}
```

The full token reference, grouped by surface / text / border / accent / state / shadow / radius / spacing / z-index, lives in [`docs/CSS-TOKENS.md`](docs/CSS-TOKENS.md).

### ThemeScope Wrapper

When a single page needs two visual contexts at once, prefer the `ThemeScope` component. It automatically writes `data-of-theme` and `data-of-theme-scope` on the wrapper, so consumers do not need to hand-write attributes.

```vue
<script setup lang="ts">
import { DataTable, ThemeScope } from '@oneflowui/ui'
</script>

<template>
  <ThemeScope theme="ops-console" tag="section" class="ops-preview">
    <div class="ops-preview__panel">
      <h3>Scoped ops-console preview</h3>
      <p>This subtree inherits ops-console tokens while the outer page stays neutral.</p>
    </div>
  </ThemeScope>
</template>
```

Supported values currently match the global theme list:

- `neutral`
- `ops-console`

Direct `data-of-theme-scope` usage is still compatible for older code, but new consumers should use `ThemeScope`.

### ThemeScope Scene Component

If you want to reuse "local theme + title + description + meta/footer slots" together, use `ThemeScopeScene`. It is a lightweight scene shell component that fits enterprise back offices, ops consoles, and task centers.

```vue
<script setup lang="ts">
import { DataTable, ThemeScopeScene } from '@oneflowui/ui'
</script>

<template>
  <ThemeScopeScene
    theme="ops-console"
    tag="section"
    eyebrow="Enterprise Scene"
    title="Task Overview"
    description="This region automatically receives ops-console tokens."
  >
    <template #meta>
      <span class="scene-chip">ThemeScopeScene</span>
    </template>

    <DataTable :rows="rows" :columns="columns" />

    <template #footer>
      <small>footer / notes / actions</small>
    </template>
  </ThemeScopeScene>
</template>
```

`ThemeScopeScene` still reuses `ThemeScope` under the hood, so this is non-breaking. It just packages the common business shell into a reusable component.

### Virtual List State Cache

If a virtual list remounts often and you want to keep `scrollTop`, `containerHeight`, and `invalidateVersion`, reuse the same state by key.
`createVirtualListState()` is still available, while `useVirtualListStateCache()` is the helper for sharing one state across remounts.

```ts
import { useVirtualList, useVirtualListStateCache } from '@oneflowui/ui'

const virtualListState = useVirtualListStateCache('ai-message-list')

const { visibleItems, totalHeight, offsetY } = useVirtualList({
  items: messages,
  itemHeight: 60,
  containerRef,
  state: virtualListState,
})
```

## Release & Verification

If you need to review the current traceable release materials, start with these docs:

- Current release proof: [`docs/plans/2026-05-07-release-0.9.8-proof.md`](docs/plans/2026-05-07-release-0.9.8-proof.md)
- Changelog: [`docs/CHANGELOG-v0.9.8.md`](docs/CHANGELOG-v0.9.8.md)
- Overlay remediation plan: [`docs/plans/2026-03-30-oneui-issues-136-138-remediation-plan.md`](docs/plans/2026-03-30-oneui-issues-136-138-remediation-plan.md)
- Pre-release smoke: [`docs/plans/2026-03-22-oneui-theme-scope-middleware-composer-pre-release-verification.md`](docs/plans/2026-03-22-oneui-theme-scope-middleware-composer-pre-release-verification.md)
- Package entrypoints verification: [`docs/plans/2026-03-22-oneui-package-entrypoints-verification.md`](docs/plans/2026-03-22-oneui-package-entrypoints-verification.md)

The current published version is `0.9.8`; publish, pack, dry-run, consumer smoke, and publish receipt evidence for this round are closed out in `docs/plans/2026-05-07-release-0.9.8-proof.md`.

---

## Usage Examples

### KanbanBoard

```vue
<KanbanBoard
  :records="records"
  kanban-field-id="stage"
  :lane-order="['todo', 'doing', 'done']"
  :lane-titles="{ todo: 'Todo', doing: 'In Progress', done: 'Done' }"
/>
```

### AI Chat Panel

```vue
<script setup>
import { AiMessageList, AiSender, useAiChat } from '@oneflowui/ui'

const { messages, isThinking, send } = useAiChat({
  onRequest: async (content) => {
    // Connect your AI service here
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
    { key: 'title', label: 'Title', width: 'fill' },
    { key: 'status', label: 'Status', width: 120 },
    { key: 'priority', label: 'Priority', width: 100 },
  ]"
  :rows="tasks"
  @row-click="onRowClick"
/>
```

### Toast Notifications

```ts
import { useToast } from '@oneflowui/ui'

const toast = useToast()
toast.success('Saved successfully')
toast.error('Operation failed')
```

### DatabaseView middleware presets

You can compose reusable `DatabaseView` middleware presets for toast, analytics, and optimistic updates:

```ts
import {
  composeDatabaseViewMiddlewares,
  createDatabaseViewAnalyticsMiddleware,
  createDatabaseViewPresetBundle,
  createDatabaseViewPresetMiddleware,
  createDatabaseViewOptimisticMiddleware,
  createDatabaseViewToastMiddleware,
  useDatabaseView,
} from '@oneflowui/ui'

const middleware = composeDatabaseViewMiddlewares(
  createDatabaseViewToastMiddleware({
    onSuccess: (message) => toast.success(message),
    onError: (message) => toast.error(message),
  }),
  createDatabaseViewAnalyticsMiddleware({
    onEvent: (event) => console.log('[db-view]', event.phase, event.action),
  }),
  createDatabaseViewOptimisticMiddleware({
    apply: ({ payload }) => updateLocalRecord(payload),
    revert: ({ payload }) => revertLocalRecord(payload),
  }),
)

const view = useDatabaseView({
  tableId: 'tbl-1',
  actions: {
    middleware,
    onCellEdit: saveCellEdit,
  },
})
```

If you prefer a single factory that returns a ready-to-use middleware, use the official preset bundle helper:

```ts
const presetBundle = createDatabaseViewPresetBundle({
  toast: {
    onSuccess: (message) => toast.success(message),
    onError: (message) => toast.error(message),
  },
  analytics: {
    onEvent: (event) => console.log('[db-view]', event.phase, event.action),
  },
  optimistic: {
    apply: ({ payload }) => updateLocalRecord(payload),
    revert: ({ payload }) => revertLocalRecord(payload),
  },
})

const view = useDatabaseView({
  tableId: 'tbl-1',
  actions: {
    middleware: presetBundle.middleware,
    onCellEdit: saveCellEdit,
  },
})
```

`createDatabaseViewPresetMiddleware` is the one-liner version when you only need the final middleware object:

```ts
const middleware = createDatabaseViewPresetMiddleware({
  toast: {
    onSuccess: (message) => toast.success(message),
    onError: (message) => toast.error(message),
  },
  analytics: {
    onEvent: (event) => console.log('[db-view]', event.phase, event.action),
  },
  optimistic: {
    apply: ({ payload }) => updateLocalRecord(payload),
    revert: ({ payload }) => revertLocalRecord(payload),
  },
})
```

### ThemeScope Scene Template

If you want to evolve `ThemeScope` from a local wrapper into a business scene template, use it as the page shell that organizes the region structure. This fits enterprise dashboards, ops consoles, and task boards: the outer shell fixes the visual context while the inner area hosts cards, tables, metrics, and side notes.

```vue
<script setup lang="ts">
import { ThemeScope } from '@oneflowui/ui'
</script>

<template>
  <ThemeScope theme="ops-console" tag="section" class="enterprise-scene">
    <header class="enterprise-scene__header">
      <h3>Enterprise Scene</h3>
      <p>Theme, layout, and business content are reused together as one template.</p>
    </header>

    <div class="enterprise-scene__body">
      <div class="enterprise-scene__summary">...</div>
      <DataTable :rows="rows" :columns="columns" />
    </div>
  </ThemeScope>
</template>
```

The repository's `src/dev/examples/database/DatabaseEnterpriseDemo.vue` is the dev/examples-level reference for this kind of scene template. It shows the "ThemeScopeScene + DatabaseView + middleware" composition pattern that you can copy into your own project and turn into a real enterprise page.

### Dev Examples / Enterprise Demo

`src/dev/examples/database/DatabaseEnterpriseDemo.vue` is a dev/examples-level consumption pattern used to show a more complete enterprise-style page composition. It is documentation and development sample material, not an npm-exported component, and it does not change the public export surface of `@oneflowui/ui`.
The repository also ships `src/dev/examples/database/DatabasePresetDemo.vue` as a shorter official preset-bundle example, focused on direct `createDatabaseViewPresetBundle` / `actions.middleware` consumption.

If your business app needs something similar, copy the composition idea from the example and wire it to your own data source and action contract instead of depending on a separate production export.

### Combined Consumption Example

If you want to use theme scoping, database action middleware, and virtual list state caching in the same business surface, keep them inside one wrapper component. This is the closest pattern to a real app page and the easiest one to copy.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ThemeScope,
  composeDatabaseViewMiddlewares,
  createDatabaseViewAnalyticsMiddleware,
  createDatabaseViewOptimisticMiddleware,
  createDatabaseViewToastMiddleware,
  useDatabaseView,
  useVirtualList,
  useVirtualListStateCache,
} from '@oneflowui/ui'

const containerRef = ref<HTMLElement | null>(null)
const virtualListState = useVirtualListStateCache('task-feed')

const middleware = composeDatabaseViewMiddlewares(
  createDatabaseViewToastMiddleware({
    onSuccess: (message) => toast.success(message),
    onError: (message) => toast.error(message),
  }),
  createDatabaseViewAnalyticsMiddleware({
    onEvent: (event) => console.log('[db-view]', event.phase, event.action),
  }),
  createDatabaseViewOptimisticMiddleware({
    apply: ({ payload }) => updateLocalRecord(payload),
    revert: ({ payload }) => revertLocalRecord(payload),
  }),
)

const view = useDatabaseView({
  tableId: 'tbl-1',
  actions: {
    middleware,
    onCellEdit: saveCellEdit,
  },
})

const { visibleItems } = useVirtualList({
  items: view.records,
  itemHeight: 60,
  containerRef,
  state: virtualListState,
})

const columns = [
  { key: 'title', label: 'Task', width: 'fill' },
  { key: 'status', label: 'Status', width: 120 },
  { key: 'priority', label: 'Priority', width: 100 },
]
</script>

<template>
  <ThemeScope theme="ops-console" tag="section" class="task-surface">
    <header class="task-surface__header">
      <h3>Task Overview</h3>
      <p>The outer shell uses scoped ops-console tokens while actions, list rendering, and cached state share the same component entry points.</p>
    </header>

    <div ref="containerRef" class="task-surface__list">
      <DataTable :rows="visibleItems" :columns="columns" />
    </div>
  </ThemeScope>
</template>
```

These capabilities can be used independently or combined like above; all of them are non-breaking additions and do not require consumer API changes.

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/qixi54/oneui.git
cd oneui

# Install dependencies
pnpm install

# Start dev server (port 5174)
pnpm dev

# Type check
pnpm type-check

# Run tests
pnpm test

# Build
pnpm build
```

---

## License

MIT
