---
生成时间: 2026-04-01 13:36:32
参考文档: /opt/Oneflow/flowlab/项目/skills-zho/code/produce/agent-parallel-orchestration/SKILL.md
角色定义: ARCH
文档生成目的: 为 OneUI 展示态文本预览与溢出优化生成可校验的并发派发简报
生成模型: GPT-5 Codex
---

# Dispatch Brief
request_title: OneUI text preview and overflow upgrade
route_decision: flowapi_persistent
contract_needed: yes
owners: ARCH, FE
parallel_groups: after contract => [FE-markdown-preview, FE-info-card, FE-field-cell]
qa_strategy: 主代理完成公共层整合后再统一跑 targeted vitest 与 type-check，不单独派 QA

## dispatch_packets
- owner: FE-markdown-preview
  goal: 将 FieldMarkdownPreview 从字符数截断判断升级为真实溢出检测，并补集成测试
  target_files: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/field/FieldMarkdownPreview.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/field-markdown-preview.integration.spec.ts
  do_not_touch: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor/RichTextEditor.vue, overlay 相关文件, DataTable 主体虚拟化逻辑
  verify_commands: npx vitest run src/tests/field-markdown-preview.integration.spec.ts

- owner: FE-info-card
  goal: 为 InfoCard 增加标题/内容溢出可观测性，不改变 variant API，并补集成测试
  target_files: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/base/InfoCard.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/info-card.integration.spec.ts
  do_not_touch: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/overlay, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor
  verify_commands: npx vitest run src/tests/info-card.integration.spec.ts

- owner: FE-field-cell
  goal: 为 FieldCell 补真实溢出检测入口并对齐 richtext 预览规则，保持 inline edit 不变
  target_files: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/FieldCell.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/table-detail.integration.spec.ts
  do_not_touch: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor/RichTextEditor.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/table/DataTable.vue
  verify_commands: npx vitest run src/tests/table-detail.integration.spec.ts
