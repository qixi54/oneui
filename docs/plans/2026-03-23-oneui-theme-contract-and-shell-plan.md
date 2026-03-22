---
生成时间: 2026-03-23 10:24:00
参考文档: docs/plans/2026-03-22-oneui-modularization-phase8-plan.md, docs/plans/2026-03-22-oneui-modularization-phase10-plan.md, docs/plans/2026-03-21-oneui-neutral-theme-architecture-plan.md, docs/plans/2026-03-23-ops-console-unification-plan.md
角色定义: ARCH
文档生成目的: 建立一套可复用的 One UI 主题与外观契约，解决“组件风格与应用布局”耦合导致的视觉错位问题，降低后续改版成本。
生成模型: GPT-5 Codex
---

# OneUI 主题契约与壳层统一 Plan

## 一、当前结论

先前已完成的中控壳层改造提升了 App.vue 的感知层体验，但 One UI 组件仍有“默认家具感”与 App 外观契约脱节。此轮将主题治理改为一个独立工作流：

1. 核心目标是建立“统一变量优先级链”，让 One UI 组件按应用语义自动映射。
2. 一次性补齐中性与 ops-console 的语义边界，不在业务代码中频繁改组件。
3. 先完成“主题可控”，再逐步做“高频交互”改造。

## 二、目标

1. 确定 `variables.css` 为唯一语义源，主题文件只做场景覆盖。
2. One UI 组件不再“写死外观”，必须通过 `--of-*` 系列变量定义半透明边框、文本层次、数值字体、按钮边角与动效基线。
3. App 侧新增可复用的 `ops-shell` 套件，不要求改动每个页面结构。

## 三、范围

1. `src/styles/variables.css`
2. `src/styles/themes/neutral.css`
3. `src/styles/themes/ops-console.css`
4. `src/dev/App.vue`
5. `src/styles/theme-bridge.css`（新增：仅在不破坏现有 API 时创建）

## 四、执行策略

### A. 主题变量分层（P0）

1. 建立“语义优先”映射关系：
   - 基础 token：`--of-border-subtle/--of-border-strong/--of-shell-border`
   - 状态 token：`--of-status-success/--of-status-warning/--of-status-error`
   - 排版 token：`--of-font-code/--of-type-note/--of-number-tracking`
   - 卡片与动作面板 token：`--of-surface-elevated/--of-surface-card/--of-surface-hover`
2. 在 `variables.css` 中补齐缺失 alias，并加入默认回退。
3. 主题文件只覆盖可见差异，不覆盖底层语义。

### B. 组件可注入的主题边界（P1）

1. 设计一个 `theme-scoped wrapper` 思路：在关键区域加 `data-oneui-theme-scope`，并提供局部变量覆盖；不改组件公开 API。
2. 先给 `src/dev/App.vue` 的 Shell 区域提供 scoped scope，验证“同页多风格并存”。
3. 把边界规则写入注释规范：只允许在 scope wrapper 里覆盖 `--of-*` 变量。

### C. 可读性与专业感（P1）

1. 把 `letter-spacing`、`font-variant-numeric`、`--of-shell-row-border` 的应用整理为可复用 class。
2. 统一透明边界、浅阴影和间距节奏。
3. 保持已有 App 功能不变，仅优化外观参数。

## 五、并行分解（可直接并发）

1. **Theme Foundation Agent**：处理 `variables.css` 与主题层映射。
2. **Ops Shell Agent**：处理 `src/dev/App.vue` 中命令面板和 shell 的 class 契约。
3. **Docs & Governance Agent**：输出 plan、验收标准、回归清单，并确认与已有计划 ID 的引用一致。

## 六、验收标准

1. `npm run type-check/test/build` 通过。
2. `neutral` 与 `ops-console` 主题均可无改业务逻辑切换。
3. 同一个页面中至少可通过 wrapper 区域隔离出不同视觉语境（本轮为演示级）。
4. `src/styles` 中任何新增颜色使用都可追溯到 `--of-*`。

## 七、风险与回滚

1. 变量回退链有误会引发视觉退化：回滚该文件提交并保留原 alias。
2. CSS 覆盖层过深导致样式权重失控：保持单一 scoped wrapper，不允许全站 `!important`。
3. 影响较大的主题差异可分批发布，不与交互改造并行。

## 八、下一步

1. 先冻结本计划为本轮执行主线。
2. 再执行 `Task 分解 Plan` 为 3 个并发子任务。
