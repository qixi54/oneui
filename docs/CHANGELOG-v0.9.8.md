---
生成时间: 2026-05-07 20:30:53
参考文档: /opt/Oneflow/flowlab/project/oneui/code/develop/src/components/overlay/SidePanel.vue, /opt/Oneflow/flowlab/project/oneui/code/develop/src/composables/useOverlay.ts, /opt/Oneflow/flowlab/project/oneui/code/develop/src/tests/overlay.integration.spec.ts, /opt/Oneflow/flowlab/project/oneui/code/develop/docs/plans/2026-03-30-oneui-issues-136-138-remediation-plan.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.9.8 overlay hotfix 与发布入口对齐
生成模型: GPT-5 Codex
---

# OneUI v0.9.8 — Overlay SidePanel Configurable Hotfix

## 版本概述

`0.9.8` 是一次 patch release，目标是收口 `SidePanel` 作为 workspace side shell 时的 overlay 行为缺陷，并补齐当前 release 入口文档，避免 npm 已升级但仓库发布说明仍停在旧版本。

## 变更清单

### Fix: SidePanel 支持显式控制 scroll lock 与 focus trap

- `SidePanel` 新增 `lockScroll` 与 `trapFocus` 两个可选 props
- 默认值仍为 `true`，保持现有 modal-like 使用场景兼容
- `SidePanel` 会把这两个控制项透传给 `useOverlay`

### Fix: useOverlay 将焦点陷阱与滚动锁解耦

- `UseOverlayOptions` 新增 `trapFocus?: boolean`
- 打开与关闭阶段只有在 `trapFocus=true` 时才激活或释放 focus trap
- `Escape` 关闭能力保持不变

### Test: Overlay 集成测试补齐

- 新增 `lockScroll=false` 场景，验证不会写入 `document.body.style.overflow = "hidden"`
- 新增 `trapFocus=false` 场景，验证不会抢占外部焦点，同时仍支持 `Escape` 关闭

### Docs: Release 入口对齐

- 更新 `README.md` / `README.en.md` 中的当前发布版本与 proof/changelog 链接
- 在 `docs/ONEUI-INDEX.md` 中新增 `0.9.8` 发布条目

## 验证

- `npx vitest run src/tests/overlay.integration.spec.ts`
- `npm run type-check`
- `npm run build`
- `npm publish --dry-run --access public --registry=https://registry.npmjs.org`
- `npm pack`

## 兼容性

- 向后兼容
- 不传新 prop 时，`SidePanel` 的默认 scroll lock 和 focus trap 行为不变
