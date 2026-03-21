---
生成时间: 2026-03-21 15:42:13
参考文档: README.md, docs/DESIGN_STANDARD.md, src/styles/variables.css, src/dev/App.vue, src/components/layout/AppLayout.vue, src/components/layout/Navbar.vue, src/components/layout/Sidebar.vue, src/components/Dashboard/index.vue
角色定义: ARCH（架构师）
文档生成目的: 将 OneUI 从“组件默认自带明显产品气质 + dev 主题覆盖混合”收敛为“中性组件库 + 可选主题层 + 可选中控皮肤层”的可执行改造计划
生成模型: GPT-5 Codex
---

# OneUI Neutral Theme Architecture Plan

## Part 1: 执行摘要

当前 OneUI 已具备较完整的设计 token、布局组件和页面级解决方案，但默认视觉仍混合了“通用组件库风格”“dev 演示页视觉覆盖”“局部组件字面量配色”三类来源，导致库层和应用层的职责边界不够清晰。

本计划的目标不是再做一套更重的中控外观，而是先把 OneUI 收敛成“中性的基础组件库”。完成后，组件库默认应保持克制、中立、可复用；业务系统若需要更强的品牌感或工业中控风格，应通过上层主题文件与页面容器注入，而不是继续在组件内部写死视觉判断。

本轮范围聚焦三件事：

1. 冻结并分层主题契约，区分 foundation token、semantic token、product skin token
2. 收口当前组件默认视觉到中性风格，移除不必要的产品气质和字面量配色
3. 为后续“中控台皮肤”预留独立入口，让业务系统可选挂载，而不是污染库默认样式

## Part 2: 需求分析

### 2.1 当前问题

| 问题 | 当前表现 | 影响 |
|------|----------|------|
| 组件库与应用主题边界不清 | `src/styles/variables.css` 已有 token，但 `src/dev/App.vue` 仍做大段本地主题覆盖 | 用户容易把 demo 风格误认为库默认风格 |
| 视觉默认值不够中性 | `Navbar/Sidebar/Dashboard` 默认带明显主色和产品感 | 业务应用接入时会先被库样式“抢戏” |
| 图表配色仍有字面量 | `Dashboard/charts` 默认色为 hex 字面量 | 主题切换时不能整体联动 |
| 中控风格没有独立皮肤层 | 当前若想做“工业监控大屏”，只能继续修改组件默认样式 | 后续每个业务都容易重复魔改 |

### 2.2 本轮改造目标

1. **默认中性化**
   - 默认主题不强调品牌色，不带明显“紫色 SaaS”或“工业大屏”倾向
   - 布局、卡片、表格、徽章、导航等默认表现收敛为克制的浅灰中性体系

2. **主题分层化**
   - 基础层：颜色、字号、圆角、阴影、间距、字体
   - 语义层：surface、border、text、accent、success、warning、danger
   - 皮肤层：brand、ops-console、demo 等上层主题

3. **业务风格上浮**
   - 中控台的科技感、玻璃感、强调色、图表质感，放到业务皮肤层或页面级容器层
   - OneUI 组件内部不直接决定产品审美，只消费稳定 token

### 2.3 非目标

1. 本轮不重做所有组件的交互逻辑
2. 本轮不把 dev demo 改造成完整中控产品
3. 本轮不引入新的大型主题引擎或 CSS-in-JS 方案
4. 本轮不承诺暗色模式完整落地，暗色模式仅作为后续扩展点

## Part 3: 详细方案

### 3.1 目标架构

将样式契约收敛为四层：

1. **Foundation Tokens**
   - 位置：`src/styles/variables.css`
   - 内容：灰阶、基础色、间距、圆角、阴影、字体、字号、透明度、布局尺寸
   - 规则：不直接表达“品牌”或“中控台”语义

2. **Semantic Tokens**
   - 位置：新增 `src/styles/themes/neutral.css`
   - 内容：`--of-surface-canvas`、`--of-surface-card`、`--of-border-subtle`、`--of-text-primary`、`--of-accent-default`、`--of-chart-series-*`
   - 规则：组件优先消费语义 token，不直接绑基础色阶

3. **Component Defaults**
   - 位置：各组件 `*.vue`
   - 内容：布局结构、状态选择、组件局部变量映射
   - 规则：组件默认只使用语义 token，禁止继续引入新的产品型字面量风格

4. **Product Skins**
   - 位置：新增 `src/styles/themes/ops-console.css`，后续可扩展 `brand-*.css`
   - 内容：上层品牌色、图表强调色、玻璃质感、背景氛围、页面容器修饰
   - 规则：只覆盖 token，不重写组件结构

### 3.2 组件库中性化策略

#### 3.2.1 Layout

涉及文件：

1. `src/components/layout/AppLayout.vue`
2. `src/components/layout/Navbar.vue`
3. `src/components/layout/Sidebar.vue`
3. `src/components/layout/StatusBar.vue`

改造要求：

1. `Navbar` 默认 logo、搜索框、通知按钮、头像的强调色从当前主色优先改为中性 surface/accent 体系
2. `Sidebar` 激活态从当前明显主色块改为更克制的浅灰强调态，保留可由上层主题覆盖
3. `AppLayout` 只保留壳结构和密度逻辑，不承担“品牌感”

#### 3.2.2 Dashboard / Charts

涉及文件：

1. `src/components/Dashboard/index.vue`
2. `src/components/Dashboard/charts/BarChart.vue`
3. `src/components/Dashboard/charts/PieChart.vue`
4. `src/components/Dashboard/charts/DoughnutChart.vue`
5. `src/components/Dashboard/charts/NumberCard.vue`

改造要求：

1. 图表默认色从字面量数组改为 token 驱动
2. 卡片背景、边框、标题层级收敛到中性仪表盘外观
3. 图表组件只提供“干净、专业、可二次皮肤化”的底座，不直接追求大屏风格

#### 3.2.3 信息与表单组件

涉及文件：

1. `src/components/base/*.vue`
2. `src/components/table/*.vue`
3. `src/components/overlay/*.vue`

改造要求：

1. 继续清理直接绑定基础色的写法，优先映射到语义 token
2. 对“卡片、面板、悬浮层、边界线、选中态、禁用态”建立统一语义变量
3. 保持状态色只在真正有语义时发亮，默认表面保持克制

### 3.3 dev 演示页职责收口

涉及文件：

1. `src/dev/App.vue`
2. `src/dev/main.ts`

改造要求：

1. dev demo 默认加载 neutral 主题，作为库默认表现的事实来源
2. 若要展示“中控台风格”，通过显式切换 `ops-console` 皮肤，而不是直接在 `App.vue` 里写一大段 root 覆盖
3. demo 允许展示多皮肤对比，但不能继续作为隐式默认主题来源

### 3.4 决策矩阵

| 场景 | 放在哪一层 | 不允许放在哪一层 |
|------|------------|------------------|
| 灰阶、基础圆角、基础阴影 | Foundation | 组件私有样式 |
| 卡片背景、边界线、主文本、次文本、默认强调色 | Semantic | 业务页面局部覆盖 |
| 组件布局、slot、交互状态机 | Component Defaults | Product Skin |
| 工业大屏背景、品牌主色、图表个性配色、玻璃质感 | Product Skin | Foundation / 组件默认 |

### 3.5 伪代码

```text
load foundation tokens
load neutral semantic theme as default
component styles map semantic tokens to internal states

if app selects product skin:
  load skin token overrides
  do not replace component structure
  do not rewrite component interaction logic

if dev demo wants to show multiple looks:
  switch root theme class or theme css import
  keep neutral theme as baseline snapshot
```

## Part 4: 实现路线图

| 阶段 | 里程碑 | 说明 |
|------|--------|------|
| Phase 1 | 契约冻结 | 定义 theme 分层、命名规则、组件消费边界 |
| Phase 2 | 默认中性化 | 收口 `Layout + Dashboard + 关键 base 组件` 到 neutral token |
| Phase 3 | 皮肤上浮 | 新增 `ops-console` 皮肤，dev demo 改为显式切换 |
| Phase 4 | 验证收口 | type-check、test、build、视觉抽检、文档更新 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 主题分层契约、命名冻结、集成验收 | 0.5 天 |
| FE | neutral 主题抽象与 token 收口 | 1.0 天 |
| FE | layout/dashboard/base 组件默认样式中性化 | 1.0 天 |
| FE | ops-console 皮肤与 dev 切换入口 | 0.5 天 |
| QA | 类型/构建/回归与视觉抽检 | 0.5 天 |

总计：3.5 人天。关键路径为 `主题契约冻结 -> neutral 默认落地 -> demo 切换与验证`。

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| 主题命名不稳定 | High | 一旦语义 token 命名反复变化，后续组件迁移成本会变高 | Phase 1 先冻结命名，不边做边改 |
| 中性化过度导致组件失去可识别性 | Medium | 若所有强调态都被削平，用户可能觉得“没层次” | 保留有限 accent/default/selected 语义，不做纯无色化 |
| dev demo 与库默认表现再次分裂 | High | 若 demo 继续直接写 root 覆盖，会重复旧问题 | demo 只允许加载主题文件，不允许继续堆大段匿名覆盖 |
| 图表视觉回归 | Medium | 默认色迁移到 token 后，图表可能显得更平 | 把质感差异交给 ops skin，而不是留在组件默认层 |

## Part 7: 验收标准

1. 存在明确的 neutral 主题层和 ops-console 皮肤层
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && test -f src/styles/themes/neutral.css && test -f src/styles/themes/ops-console.css'
   ```
2. `Layout` 与 `Dashboard` 默认样式不再直接依赖显性产品色和图表字面量主色
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "#3b82f6|#10b981|#8b5cf6|primary-600|primary-500" src/components/layout src/components/Dashboard'
   ```
3. dev demo 默认加载 neutral 主题，并通过显式入口切换 ops skin
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "neutral|ops-console|theme" src/dev/App.vue src/dev/main.ts'
   ```
4. 核心静态验证通过
   ```bash
   bash -lc "cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check && npm run test && npm run build"
   ```

## Part 8: 回滚方案

1. 若 neutral 主题迁移导致范围过大，可先只覆盖 `Layout + Dashboard + dev theme entry`，其余组件保留现状
2. 若 ops skin 的引入导致 demo 复杂度升高，可先保留单一 neutral 默认，只把 ops skin 文件留为未接线资源
3. 若图表 token 化影响既有展示，可先保留组件 props 自定义色优先级，默认值再改为 token

## Part 9: 架构决策记录

1. OneUI 的定位是“可复用组件库”，不是“默认即某个业务产品的完整视觉”
2. 中控风格属于业务皮肤，不属于基础组件默认风格
3. 主题改造优先走 token 分层，不通过大面积局部覆盖硬压效果
4. dev demo 是库默认表现的验证场，不是匿名样式实验场

## Part 10: 参考和附录

- `src/styles/variables.css`
- `src/dev/App.vue`
- `src/dev/main.ts`
- `src/components/layout/AppLayout.vue`
- `src/components/layout/Navbar.vue`
- `src/components/layout/Sidebar.vue`
- `src/components/Dashboard/index.vue`
- `src/components/Dashboard/charts/BarChart.vue`
- `src/components/Dashboard/charts/PieChart.vue`
- `src/components/base/InfoCard.vue`
