---
生成时间: 2026-04-01 12:00:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/docs/plans/2026-04-01-oneui-pretext-upgrade-plan.md
角色定义: ARCH
文档生成目的: 验证 OneUI Pretext 文本布局升级已收口统一 adapter、AI 消息列表与 Kanban/Gallery 首批接入
生成模型: GPT-5 Codex
---

# OneUI Pretext Upgrade Verification

## 1. 交付范围

- issue: `ONEUI-ARCH-00063`
- issue: `ONEUI-FE-00147`
- issue: `ONEUI-FE-00149`
- plan: `49d5036e-d150-460e-92ef-5bd06261e8f3`
- execution tasks: `ONEUI-ARCH-00065`, `ONEUI-FE-00151`, `ONEUI-FE-00152`

## 2. 代码变更

- [package.json](/opt/Oneflow/flowlab/项目/oneui/code/develop/package.json)
  新增 `@chenglou/pretext` 依赖
- [useTextLayout.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/useTextLayout.ts)
  新增统一文本布局 adapter，封装 `prepare/layout`、缓存与 fallback
- [composables/index.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/composables/index.ts)
  导出文本布局 adapter
- [AiMessageList.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/ai/AiMessageList.vue)
  改为按容器宽度与文本布局预测消息气泡高度
- [KanbanColumn.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/kanban/KanbanColumn.vue)
  虚拟卡片高度改为基于标题、描述、badge 的文本预测，并保留 `measureRow` 修正
- [GalleryCard.vue](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/components/gallery/GalleryCard.vue)
  增加共享 adapter 驱动的预测高度 hook
- [useTextLayout.integration.spec.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/useTextLayout.integration.spec.ts)
  覆盖缓存复用、fallback、locale/cache reset
- [ai-message-list.integration.spec.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/ai-message-list.integration.spec.ts)
  验证 AI 列表走 adapter 且 `scrollToBottom` 不回归
- [kanban.integration.spec.ts](/opt/Oneflow/flowlab/项目/oneui/code/develop/src/tests/kanban.integration.spec.ts)
  验证 Kanban 虚拟高度随文本变化，并校验 Gallery 预测高度 hook

## 3. 验收结果

### 3.1 定向测试

命令：

```bash
npx vitest run src/tests/useTextLayout.integration.spec.ts src/tests/ai-message-list.integration.spec.ts src/tests/kanban.integration.spec.ts
```

结果：

- 通过
- `3 files / 9 tests` 全部通过

### 3.2 类型检查

命令：

```bash
npm run type-check
```

结果：

- 通过
- `vue-tsc --noEmit` 通过

### 3.3 构建验证

命令：

```bash
npx vite build --outDir /tmp/oneui-pretext-dist
```

结果：

- 通过
- 产物输出至 `/tmp/oneui-pretext-dist`

## 4. 影响边界

- 本地代码：已修改
- 共享数据：未修改
- 测试服务器代码：未同步
- 生产服务器代码：未同步

## 5. 结论

`ONEUI-ARCH-00063` 已关闭：OneUI 现已具备统一文本布局 adapter，不再让组件各自维护字符数估高公式。

`ONEUI-FE-00147` 已关闭：`AiMessageList` 现按容器宽度、字体与行高预测消息高度，并保留原有滚动收口行为。

`ONEUI-FE-00149` 已关闭：`KanbanColumn` 的虚拟高度已接入共享文本布局能力，`GalleryCard` 也已补上统一预测高度接入点。
