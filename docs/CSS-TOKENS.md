---
生成时间: 2026-03-30 16:57:17
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-30-oneui-issues-136-138-remediation-plan.md
角色定义: /opt/Oneflow/SOP/规划文档写作标准.md
文档生成目的: 为 OneUI 的 `--of-*` token 提供消费侧参考、桥接示例和分类索引
生成模型: GPT-5 Codex
---

# CSS Tokens

本文档是 OneUI `--of-*` token 的消费侧参考索引，不是样式真源。

## 真源

以下文件定义了当前运行态 token 真源，新增或调整 token 应优先改这里，再同步更新本文档。

- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/variables.css`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/neutral.css`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/styles/themes/ops-console.css`

## Bridge

如果你的应用已经有自己的设计 token，优先保留自己的命名，再桥接到 OneUI 的 `--of-*` 命名空间。

```css
:root {
  --app-surface-canvas: #f6f7f9;
  --app-surface-panel: #ffffff;
  --app-text-primary: #0f172a;
  --app-border-subtle: rgba(15, 23, 42, 0.08);
  --app-accent-default: #334155;

  --of-surface-canvas: var(--app-surface-canvas);
  --of-surface-elevated: var(--app-surface-panel);
  --of-text-primary: var(--app-text-primary);
  --of-border-subtle: var(--app-border-subtle);
  --of-accent-default: var(--app-accent-default);
}
```

局部场景建议直接把 bridge 挂在 wrapper 上：

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

## 分类索引

### Surface

| Token | Default | Notes |
|---|---|---|
| `--of-surface-canvas` | `#f6f7f9` | App canvas |
| `--of-surface-elevated` | `#ffffff` | Cards, popups, raised containers |
| `--of-surface-panel` | `#fbfcfd` | Panel background |
| `--of-surface-muted` | `#f1f3f6` | Subtle background |
| `--of-surface-selected` | `#eceff3` | Selected state |
| `--of-surface-workspace` | `#ffffff` | Workspace base |
| `--of-surface-workspace-raised` | `#ffffff` | Workspace raised layer |
| `--of-surface-workspace-strong` | `#f8fafc` | Strong workspace layer |
| `--of-surface-overlay` | `rgba(0, 0, 0, 0.4)` | Backdrop overlay |

### Text

| Token | Default | Notes |
|---|---|---|
| `--of-text-primary` | `#0f172a` | Main text |
| `--of-text-secondary` | `#526071` | Secondary text |
| `--of-text-tertiary` | `#7a8797` | Tertiary text |
| `--of-text-strong` | `#09111f` | Strong text |
| `--of-text-inverse` | `#ffffff` | Inverse text |
| `--of-text-muted` | `#cbd5e1` | Muted text |
| `--of-text-placeholder` | `var(--of-text-tertiary)` | Placeholder text |
| `--of-link-default` | `#334155` | Link default |
| `--of-link-hover` | `#1f2a37` | Link hover |
| `--of-link-visited` | `#475569` | Link visited |

### Border

| Token | Default | Notes |
|---|---|---|
| `--of-border-subtle` | `rgba(15, 23, 42, 0.08)` | Light border |
| `--of-border-strong` | `rgba(15, 23, 42, 0.14)` | Strong border |
| `--of-border-workspace` | `var(--of-workspace-border)` | Workspace border |
| `--of-border-active` | `var(--of-border-strong)` | Active border |
| `--of-border-default` | `var(--of-border-subtle)` | Default border |
| `--of-border-divider` | `var(--of-border-subtle)` | Divider line |
| `--of-border-color` | `var(--of-border-subtle)` | Compatibility alias |
| `--of-border` | `1px solid var(--of-border-color)` | Border shorthand |

### Accent

| Token | Default | Notes |
|---|---|---|
| `--of-accent-default` | `#334155` | Default accent |
| `--of-accent-strong` | `#0f172a` | Strong accent |
| `--of-accent-soft` | `#dbe2ea` | Soft accent |
| `--of-link-default` | `#334155` | Link default |
| `--of-link-hover` | `#1f2a37` | Link hover |
| `--of-link-visited` | `#475569` | Link visited |

### State

| Token | Default | Notes |
|---|---|---|
| `--of-color-success` | `#22c55e` | Success base |
| `--of-color-warning` | `#d97706` | Warning base |
| `--of-color-error` | `#dc2626` | Error base |
| `--of-color-info` | `#2563eb` | Info base |
| `--of-priority-p0-text` | `#dc2626` | Priority P0 text |
| `--of-priority-p0-bg` | `#fee2e2` | Priority P0 background |
| `--of-status-todo-text` | `#64748b` | Status text |
| `--of-status-done-bg` | `#dcfce7` | Done background |
| `--of-role-fe-text` | `#059669` | FE role text |
| `--of-badge-purple-border` | `#c4b5fd` | Badge border |

### Shadow

| Token | Default | Notes |
|---|---|---|
| `--of-shadow-card` | `0 2px 12px rgba(0, 0, 0, 0.04)` | Card shadow |
| `--of-shadow-card-hover` | `0 2px 12px 0 rgba(0, 0, 0, 0.08)` | Card hover shadow |
| `--of-shadow-dropdown` | `0 4px 16px rgba(0, 0, 0, 0.12)` | Dropdown shadow |
| `--of-shadow-modal` | `0 8px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08)` | Modal shadow |
| `--of-shadow-drawer` | `-12px 0 32px rgba(0, 0, 0, 0.12), -2px 0 8px rgba(0, 0, 0, 0.08)` | Drawer shadow |
| `--of-shadow-panel` | `-2px 0 20px rgba(0, 0, 0, 0.13)` | SidePanel shadow |
| `--of-shadow-toast` | `0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)` | Toast shadow |
| `--of-shadow-popover` | `0 4px 12px rgba(0, 0, 0, 0.08)` | Popover shadow |
| `--of-shadow-overlay-lg` | `0 8px 24px rgba(0, 0, 0, 0.15)` | Large overlay shadow |

### Radius

| Token | Default | Notes |
|---|---|---|
| `--of-radius-sm` | `0.25rem` | Small radius |
| `--of-radius-md` | `0.375rem` | Medium radius |
| `--of-radius-lg` | `0.5rem` | Large radius |
| `--of-radius-xl` | `0.625rem` | Extra large radius |
| `--of-radius-2xl` | `1.25rem` | Strong radius |
| `--of-radius-full` | `9999px` | Full pill |

### Spacing

| Token | Default | Notes |
|---|---|---|
| `--of-spacing-0_5` | `0.125rem` | 0.5 spacing |
| `--of-spacing-1` | `0.25rem` | 1 spacing |
| `--of-spacing-2` | `0.5rem` | 2 spacing |
| `--of-spacing-3` | `0.75rem` | 3 spacing |
| `--of-spacing-4` | `1rem` | 4 spacing |
| `--of-spacing-6` | `1.5rem` | 6 spacing |
| `--of-spacing-8` | `2rem` | 8 spacing |
| `--of-spacing-10` | `2.5rem` | 10 spacing |

### Z-Index

| Token | Default | Notes |
|---|---|---|
| `--of-z-base` | `1` | Base layer |
| `--of-z-raised` | `2` | Raised layer |
| `--of-z-sticky` | `10` | Sticky layer |
| `--of-z-dropdown` | `100` | Dropdown layer |
| `--of-z-sidebar` | `199` | Sidebar layer |
| `--of-z-navbar` | `200` | Navbar layer |
| `--of-z-overlay` | `1000` | Overlay layer |
| `--of-z-modal` | `1001` | Modal layer |
| `--of-z-popover` | `1002` | Popover layer |
| `--of-z-context-menu` | `1003` | Context menu layer |
| `--of-z-toast` | `9999` | Toast layer |

### Other High-Frequency Tokens

| Token | Default | Notes |
|---|---|---|
| `--of-font-sans` | `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` | Default font |
| `--of-font-mono` | `"JetBrains Mono", "Fira Code", ui-monospace, monospace` | Monospace font |
| `--of-font-size-xs` | `0.6875rem` | Font size |
| `--of-font-weight-semibold` | `600` | Font weight |
| `--of-line-height-normal` | `1.5` | Line height |
| `--of-transition-normal` | `all 0.2s ease` | Transition |
| `--of-navbar-height` | `56px` | Navbar height |
| `--of-sidebar-width` | `240px` | Sidebar width |

## Maintenance

1. This document is for consumers only; it is not the source of truth.
2. When a token changes, update `src/styles/variables.css` and the relevant theme file first, then sync this document.
3. Prefer wrapper-scoped bridges over direct app-specific overrides of component internals.
