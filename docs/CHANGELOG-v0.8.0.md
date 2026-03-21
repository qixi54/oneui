---
生成时间: 2026-03-22 00:20:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-productivity-upgrade-plan.md, /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-productivity-upgrade-verification.md
角色定义: ARCH
文档生成目的: 记录 OneUI v0.8.0 产品力提升迭代的关键变更、验证与发布收口
生成模型: GPT-5 Codex
---

# OneUI v0.8.0 — Productive UX Upgrade

## 版本概述

本轮把 OneUI 重点从“修复兼容与视觉残留”转向“生产效率提升”。

1. 详情工作流统一为 `DatabaseView` + `DetailLayout` + `Drawer/SidePanel`。
2. 表格交互支持行内编辑与行级快捷动作协同。
3. 增强容器感知响应策略，减少多场景下的空间浪费。
4. 语义化主题 token 覆盖常用高可见组件，提升产品一致性。

## 验证与发布范围

1. 仓库验证
   - `npm run type-check`
   - `npm run test`
   - `npm run build`
   - `npm run lint`
   - `npm run lint:style`
2. 发布与消费侧门禁
   - `npm publish --dry-run --registry=https://registry.npmjs.org`
   - `npm pack`
   - `rg -n "/assets/|new Worker\\(new URL\\(|import.meta.url" dist`
   - 外部消费者构建（Vite 5.4.21 / Vite 8.0.1）

## 溯源资料

1. [OneUI 生产力升级计划](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-productivity-upgrade-plan.md)
2. [OneUI 生产力升级验证](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-21-oneui-productivity-upgrade-verification.md)
3. [OneUI 0.8.0 发布证明](/opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-03-22-release-0.8.0-proof.md)
4. `/tmp/closeout-evidence-2026-03-22/` 下 closeout 验证日志全量留痕

## 结论

`0.8.0` 完成了产品力提升主线的核心交付，功能、验证、发布门禁链路已闭环，建议作为当前推荐主线版本。下一步的收口动作仅剩 FlowAPI 平台交付档位升级说明（`upgrade_delivery_profile`）的治理层面处理。

### 额外收口（2026-03-22）

1. 清理开发期残留 lint 告警（template shadow）：
   - `src/components/database/DatabaseView.vue`
   - `vue/no-template-shadow` 从 2 条 warning 降为 0（重复复验可追溯日志见 `tmp/closeout-evidence-2026-03-22/lint-after.log`）
