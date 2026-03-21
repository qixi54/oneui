---
生成时间: 2026-03-21 15:22:35
参考文档: docs/plans/2026-03-21-package-boundary-governance-plan.md
角色定义: ARCH
文档生成目的: 记录 OneUI package boundary 治理的实现验证、宿主矩阵结果与收口结论
生成模型: GPT-5 Codex
---

# OneUI Package Boundary Governance Verification

## 验证命令

```bash
pnpm type-check
pnpm build
npm pack
cd /tmp/oneui-consumer-vlatest-058 && npm install --force /opt/Oneflow/flowlab/项目/oneui/code/develop/oneflowui-ui-0.5.8.tgz && npm run build
cd /tmp/oneui-consumer-v5-058 && npm install --force /opt/Oneflow/flowlab/项目/oneui/code/develop/oneflowui-ui-0.5.8.tgz && npm run build
```

## 实现结果

1. `src/utils/icon.ts` 不再在初始模块中内联整张图标动态映射表。
2. 新增 `src/utils/iconRegistry.ts`，把字符串图标到 lucide 模块的映射拆到独立异步模块。
3. `plugin` 全量安装路径保留原有对外契约，但字符串图标的运行时解析改为首次使用时再加载 registry。

## 宿主矩阵结果

### Vite 8.0.1 plugin consumer

- 构建通过
- 不再出现 chunk size warning
- 关键产物：
  - `dist/assets/index-BwTXgK8S.js` 约 `32.12 kB`
  - `dist/assets/iconRegistry-cZGKWyfZ.js` 约 `6.35 kB`
  - `dist/assets/useMarkdown-B6Zbq6n5.js` 约 `112.74 kB`
  - `dist/assets/echarts-CLvv_2dP.js` 约 `273.97 kB`

说明：
`useMarkdown`、`RichTextEditor`、`echarts` 仍为独立异步 chunk，但已经不再把图标 registry 和大段动态映射表压进宿主主 chunk。

### Vite 5.4.21 plugin consumer

- 构建通过
- 无 chunk size warning
- 关键产物：
  - `dist/assets/index-D2ZGdrk9.js` 约 `387.10 kB`
  - `dist/assets/iconRegistry-DMA7BzzR.js` 约 `5.26 kB`

说明：
Vite 5 宿主下也没有再出现 500 kB 以上的单 chunk 告警。

## 结论

本轮 package boundary 治理已解决此前 `Vite 8 plugin consumer` 的首包膨胀问题，当前结果满足：

1. 根入口 / plugin 入口保持现有 API 语义。
2. 字符串图标注册表已移出初始 chunk。
3. `Vite 5.x` 与 `Vite 8.x` 的 plugin consumer 均构建通过，且无 chunk size warning。
4. 治理结果已具备回写 FlowAPI task / plan closeout 的证据基础。
