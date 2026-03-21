---
生成时间: 2026-03-21 14:10:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/CHANGELOG-v0.5.0.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/DESIGN_STANDARD.md
角色定义: ARCH（架构师）
文档生成目的: 将 OneUI 数据页面体验对齐到“右侧详情工作区 + 内容感知列宽 + 行高密度控制”的明确目标，并拆解为可并发执行的实施计划
生成模型: GPT-5 Codex
---

# OneUI Database UX Alignment 计划

## Part 1: 执行摘要

当前 OneUI 的 `DatabaseView/DataTable` 已具备多视图、详情链路、列宽拖拽与虚拟滚动能力，但页面体验仍未完全对齐目标产品形态。主要偏差体现在：

1. 桌面详情仍是 `DetailSheet` 居中弹层，不是右侧工作区
2. 列宽默认值主要依赖固定宽度与手动拖拽，缺少基于字段类型和样本数据的初始推断
3. 行高只有内部固定值与测量机制，没有对外可控的紧凑/标准/宽松密度模式

本计划的目标是将 OneUI 数据页收敛到更接近 Notion/Airtable 的交互层级，并保证页面级解决方案而不是单一组件小修。

## Part 2: 需求分析

本轮需求聚焦在三个明确目标：

1. **详情工作区改造**
   - 桌面端 `DatabaseView` 中的记录详情要切换为右侧工作区
   - `detail` 视图态需要支持更宽的工作区样式，而不是沿用居中弹层
   - 移动端仍保留 sheet 体验，避免强行套桌面交互

2. **内容感知列宽**
   - `DataTable` 初始列宽需要结合字段类型、字段名长度、样本数据内容长度做推断
   - 仍保留现有拖拽调宽和双击 auto-fit
   - 要让“不手调时的默认表现”明显更合理

3. **密度控制**
   - 需要对外暴露行高模式，例如 `compact / standard / comfortable`
   - 虚拟滚动、表头、数据行、移动端列表及详情联动需要保持一致的密度语义

## Part 3: 详细方案

### 3.1 详情工作区

1. 在 `DatabaseView` 中新增桌面端右侧详情工作区渲染路径
2. 用 `SidePanel` 作为桌面 shell，`DetailSheet` 仅保留移动端和全屏 detail 兜底
3. 页面层继续由 `selectedRecord + detailOpen` 主控，不把工作区状态散落回各视图组件

### 3.2 列宽策略

1. 新增列宽推断逻辑，输入来源包括：
   - 字段类型
   - 字段标题长度
   - 样本数据长度
   - 特殊字段（日期、状态、人员、富文本、URL、数字等）的经验最小宽度
2. 在 `useColumnResize` 之前形成初始宽度，再叠加用户拖拽 override
3. 保持现有拖拽与 auto-fit 作为二次调节机制

### 3.3 密度系统

1. 为表格新增统一 density props / state
2. 把 header/body/mobile list/virtual list 的高度计算收敛到统一配置
3. 在 `DatabaseView` 中为页面级场景暴露 density 入口，并支持 toolbar 联动

## Part 4: 实现路线图

| 阶段 | 里程碑 | 说明 |
|------|--------|------|
| Phase 1 | 契约冻结 | 明确 workspace、column sizing、density 的 props / state / fallback 语义 |
| Phase 2 | 并发实现 | 右侧详情工作区、列宽推断、密度系统并发推进 |
| Phase 3 | 页面集成 | 在 `DatabaseView` 中整合三条能力，避免局部能力各自存在 |
| Phase 4 | 验证收口 | 更新 dev/demo/tests/docs，并做回归验证 |

## Part 5: 工作量估计

| 角色 | 工作项 | 估计 |
|------|--------|------|
| ARCH | 契约冻结、计划编排、最终集成 | 0.5 天 |
| FE | 右侧详情工作区 | 1.0 天 |
| FE | 列宽推断逻辑 | 1.0 天 |
| FE | 密度系统与表格高度联动 | 1.0 天 |
| QA | 集成验证与回归 | 0.5 天 |

## Part 6: 风险评估

| 风险 | 等级 | 说明 | 应对 |
|------|------|------|------|
| 详情组件双栈导致状态分裂 | Medium | `SidePanel` 与 `DetailSheet` 并存，可能让 open/close 语义分裂 | 页面层只保留一个 detail state，按 viewport 分支渲染 |
| 列宽推断影响现有布局稳定性 | Medium | 默认宽度变化会影响表格压缩和固定列 | 推断逻辑只作为初始值，保留显式 width 和 override 优先级 |
| 密度系统破坏虚拟滚动计算 | High | 行高变化如果没有统一入口，会导致虚拟滚动错位 | 将 row/header/list 高度集中到单一配置源 |

## Part 7: 验收标准

1. 桌面端 `DatabaseView` 详情默认走右侧工作区
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "SidePanel|workspace|detail panel" src/components/database src/components/table'
   ```
2. `DataTable` 初始列宽具备内容感知推断逻辑，并仍保留 resize/auto-fit
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "infer.*width|sample|autoFitColumn|density" src/components/table src/composables'
   ```
3. 对外存在密度控制，且虚拟滚动使用统一高度配置
   ```bash
   bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && rg -n "compact|comfortable|density|rowHeight" src/components/table src/components/database src/composables'
   ```
4. 核心验证通过
   ```bash
   bash -lc "cd /opt/Oneflow/flowlab/项目/oneui/code/develop && pnpm lint && pnpm type-check && pnpm test -- src/tests/database-view.integration.spec.ts src/tests/table-detail.integration.spec.ts && pnpm build"
   ```

## Part 8: 回滚方案

1. 若右侧工作区回归风险过高，保留 `DetailSheet` 作为 fallback，不让详情链路失效
2. 若列宽推断造成异常布局，允许退回显式 `width/minWidth` 优先，不影响拖拽调宽
3. 若密度系统影响虚拟滚动稳定性，先保留 `standard` 默认密度并关闭外部切换入口

## Part 9: 架构决策记录

1. 本轮定位是“页面解决方案增强”，不是单一 overlay 组件优化
2. 页面层 detail state 必须统一，不接受各视图各自弹自己的详情
3. 列宽推断属于“初始体验优化”，用户 override 永远优先
4. 密度系统属于页面与表格共享契约，不做仅某个局部组件的私有实现

## Part 10: 参考和附录

- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database/DatabaseView.vue`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DetailSheet.vue`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay/SidePanel.vue`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useColumnResize.ts`
- `/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useVirtualList.ts`
