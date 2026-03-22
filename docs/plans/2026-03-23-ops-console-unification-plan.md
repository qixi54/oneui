---
生成时间: 2026-03-22 05:07:26
参考文档: docs/plans/2026-03-21-oneui-neutral-theme-architecture-plan.md, docs/plans/2026-03-21-oneui-productivity-upgrade-plan.md
角色定义: ARCH
文档生成目的: 把当前 dev-shell 视觉改造、全局命令面板与 One UI 主题统一列入一个可追溯的 plan，方便并发子代理各自闭环。
生成模型: GPT-5 Codex
---

# Ops Console Visual Unification Plan

## 1. 目标

1. 在现有 App.dev 逻辑不变的前提下，建立更加“工业级”“专业感”强的视觉基座，包括微观排版、玻璃质感、语义化色阶与动态呼吸。
2. 构建一个命令级的中控面板（Command Deck），让常用行为（新增任务、查看日志、切换视角）可以统一注册并呈现在 App.vue 顶部/主要区域，提升“中控台”感。
3. 通过一套“主题变量契约”让 One UI 组件库受控于同一组变量，方便未来一键切换版本或加入深色/高对比模式。

## 2. 当前痛点

1. App.dev 的 shell 仍然靠散落在 template 中的 section 组合，缺乏统一的“卡片”骨架和负空间。
2. 主头部导航、命令入口分散，难以复制出“任务中心”层级感。每个 section 都被强列排布，缺乏“中控台”应有的组织结构。
3. One UI 主题目前只控制基础色板，缺少微调（letter-spacing、monospace 数字、间距律、透明边框）以及学习/复用成本低的 CSS 片段。

## 3. 任务拆分（并行）

1. **视觉基础层（CSS shell + theme tokens）**
   - 产出：在 `src/styles/` 下补齐 `ops-shell.css`、扩展 `themes/ops-console.css` 的变量；加入 letter spacing、monospace 数字、透明边框、glass card、breathing transition 等通用类。
   - 验收：CSS 变量在 `:root[data-of-theme="ops-console"]` 和 neutral 数据主题都可用；新增类 `.ops-shell`, `.ops-command-panel`, `.ops-card`, `.ops-grid-breathing` 以及 `.ops-mono`，在 App.vue 中可以直接复用。

2. **App Shell + Command Deck**
   - 产出：在 `src/dev/App.vue` 内加入 `const commandDeck`、`const deckStats` 等数据，并在 template 顶部（header 之下）插入命令卡片区域；利用 `CommandEntry` 模式统一触发 `toast`/`function`，并在锚点处增加 `:class` 以呼应新 CSS。
   - 验收：命令面板支持至少 4 个动作、快捷键展示、与 `sections` 的上下文关联；整体排布与 `ops-shell` CSS 配合后形成明确“控制台首屏”。

3. **验证/发布/文档**
   - 产出：记录 plan、测试（type-check/test/build）、生成 verification proof，补充 docs（plan + release-proof + verification 需要及时更新，避免信息断层）。
   - 验收：`npm run test && npm run build` 通过，相关 docs 文件（本 plan、verification、release-proof）作用明确，满足 AGENTS.md 中的“war story”要求。若无法运行 publish，需要在 release-proof 中注明受限。

## 4. 验收标准

- 所有新增样式依赖 CSS 变量，未硬编码 `#` 色值（除文字/emoji 文案）。
- 命令面板在 `ops-shell` 模式下默认展开，具备稳定交互（点击/hover）且不会破坏已有 sections。
- Tests：`npm run type-check`、`npm run test`、`npm run build` 通过。
- Docs：生成《Ops Console Visual Unification Plan》、对应的 Verification + Release-proof 记录。

## 5. 并行子代理分工预案

1. **CSS Agent**：负责 Visual Foundation（Task 1），输出新的 CSS + token 修改的 diff；需列出关键变量及 rationale，交付前自测 `vite build` 没有 CSS 变量缺失警告。
2. **App Agent**：负责 Command Deck + shell wiring（Task 2）；确认 template 结构与 `sections` 排布兼容，避免引入全局状态污染。
3. **Docs/Release Agent**：负责 Task 3，补充 plan/verifications/release-proof，运行必要命令并记录 logs；若无法 publish，说明原因并提供 next-steps 预案。

## 6. 下一步

执行 `plan` 阶段后，立刻启动三个并行子代理，分别落地 CSS、App shell、文档/验证，待所有输出汇总后才进入 `verification-report/upsert` + `plan/complete` 阶段。
