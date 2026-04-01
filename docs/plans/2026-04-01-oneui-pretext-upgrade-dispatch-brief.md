# Dispatch Brief
request_title: OneUI Pretext Text Layout Upgrade
route_decision: native_parallel
contract_needed: yes
owners: ARCH, FE, QA
parallel_groups: after adapter contract freeze => [AI list integration, Kanban integration]; QA and repo-gate verification stay after both streams land
qa_strategy: 主代理在并行实现收敛后统一跑 targeted vitest、type-check、build，并补 FlowAPI verification/task closeout；不让 QA 子任务提前替代开发期验证

## dispatch_packets
- owner: ARCH
  goal: 引入 pretext 依赖并沉淀统一文本布局 adapter，明确 AI/Kanban/Gallery 的接入边界
  target_files: /opt/Oneflow/flowlab/项目/oneui/code/develop/package.json, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/utils, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests
  do_not_touch: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor, server repos, shared data
  verify_commands: bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npm run type-check && npx vitest run src/tests/useTextLayout.integration.spec.ts'
- owner: FE
  goal: 将 AiMessageList 从字符数估高迁移到文本驱动预测高度，保留现有 scrollToBottom 行为
  target_files: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests
  do_not_touch: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database
  verify_commands: bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npx vitest run src/tests/ai-message-list.integration.spec.ts src/tests/useVirtualList.integration.spec.ts'
- owner: FE
  goal: 升级 Kanban 虚拟卡片高度策略，并为 Gallery 卡片文本布局接入点预留接口
  target_files: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests
  do_not_touch: /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/editor, /opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/database
  verify_commands: bash -lc 'cd /opt/Oneflow/flowlab/项目/oneui/code/develop && npx vitest run src/tests/kanban.integration.spec.ts'
