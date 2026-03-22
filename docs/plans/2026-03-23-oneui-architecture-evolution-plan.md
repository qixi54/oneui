---
生成时间: 2026-03-23 10:32:00
参考文档: docs/plans/2026-03-22-oneui-modularization-phase9-plan.md, docs/plans/2026-03-21-warning-governance-plan.md, docs/plans/2026-03-23-ops-console-unification-plan.md
角色定义: ARCH
文档生成目的: 建立 One UI 的长期演进框架，覆盖包体积治理、视图编排、i18n 和中间件层，保证体验优化可持续扩展。
生成模型: GPT-5 Codex
---

# OneUI 架构演进与长期工程化 Plan

## 一、为什么现在要做

中控台优化应从“外观修饰”进入“能力增殖”阶段。当前最有价值的顺序是先建立基础治理，再推进交互能力。

1. 先把体积治理和可观测建立起来，避免后续功能扩展带来不可控膨胀。
2. 再把动作链条统一抽象，让页面不再重复实现同一类逻辑。
3. 最后通过编排能力，让配置化交付替代手工拼装，形成长期生产力曲线。

## 二、目标

1. 建立 bundle 与 tree-shaking 可量化机制，不让非必要样式和组件进入发布体积。
2. 抽象统一的容器感知滚动策略（virtualization）方向，降低多视图维护成本。
3. 引入 action middleware 与状态机测试，减少行为分散。
4. 先构建 i18n 标签自动注入协议，再渐进落地 AI 操作调用。

## 三、阶段化路线

### Phase 1：可观测与体积治理（P0）

1. 添加 `scripts/` 下的 size guard，生成每次构建后的 `dist` 大小差异。
2. 建立 `sideEffects` 白名单核对规则，防止误把可树摇模块标记为副作用。
3. 输出 `metrics/bundle-budget.md` 与告警阈值，低风险回滚策略先行。

### Phase 2：交互协议抽象（P0）

1. 在 `DatabaseView` 动作层定义统一 action schema。
2. 增加通用动作中间件链（日志、统一错误弹窗、乐观更新）。
3. 让业务层仅注入差异逻辑，不再重复定义通用 try-catch。

### Phase 3：视图编排起步（P1）

1. 为表格、看板、画廊定义同一视图描述 schema。
2. 输出 schema-to-view 的首版生成器（最小可用页面）。
3. 记录动作与视图变更日志，支持回放与排查。

### Phase 4：国际化与 AI 操作协同（P2）

1. 规范 label key -> i18n key 的自动映射规则。
2. 让 AI 输入可映射 `action API`（先只读动作先行）。
3. 保留严格白名单校验，避免执行动作越权。

## 四、并行拆解

1. **Bundle Agent**：脚本化体积门禁与发布前检查。
2. **Middleware Agent**：DatabaseView 动作中间件和异常总线实现。
3. **Schema Agent**：视图编排器原型与 schema 设计。
4. **Testing Agent**：状态机、快照验证与回归闭环。

## 五、验收标准

1. size guard 可在本地复现，且有趋势报告。
2. action middleware 下新增通用行为可被至少两个页面复用。
3. 视图编排原型能从配置生成最小可用页面。
4. 覆盖关键状态转换的 state-machine 测试通过（empty、loading、data、error）。

## 六、依赖与排期

1. Phase 1 与 2 并发启动，Phase 3 依赖 action 协议定义落地。
2. 工程化变更先在 App 与样例路径验证后再扩展到全组件。
3. 每个 phase 结束提交独立 verification 文档，并同步更新 changelog 与 release proof。

## 七、交付边界

1. 不新增后端数据库 schema，不改外部接口。
2. 不改变现有公共运行时 API（除非明确标记 breaking change）。
3. 若体积门禁阻断严重，允许临时调整阈值后进入观察窗口，后续回收。
