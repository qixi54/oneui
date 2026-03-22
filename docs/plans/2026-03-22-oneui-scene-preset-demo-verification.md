---
生成时间: 2026-03-22 17:32:00
参考文档: /opt/Oneflow/flowlab/项目/oneui/code/develop/README.md
角色定义: /opt/Oneflow/flowlab/项目/oneui/code/develop/AGENTS.md
文档生成目的: 记录 ThemeScopeScene、ThemeScopeDemo、DatabasePresetDemo 本轮收口的验证证据
生成模型: GPT-5 Codex
---

# OneUI Scene / Preset Demo 收口验证

## 本轮目标

1. 将 `ThemeScopeScene` 收口为正式公共组件能力。
2. 将 `ThemeScopeDemo`、`DatabasePresetDemo` 收口为 dev/examples 级参考实现。
3. 统一 README、索引文档、demo 文案和测试断言，避免“能力已加但说明和验证未对齐”。

## 影响范围

- 公共组件导出
  - `src/components/common/ThemeScopeScene.vue`
  - `src/components/common/index.ts`
  - `src/index.ts`
- dev/examples
  - `src/dev/App.vue`
  - `src/dev/ThemeScopeDemo.vue`
  - `src/dev/DatabaseEnterpriseDemo.vue`
  - `src/dev/DatabasePresetDemo.vue`
  - `src/dev/DatabaseViewDemo.vue`
- 文档
  - `README.md`
  - `README.en.md`
  - `docs/ONEUI-INDEX.md`
- 测试
  - `src/tests/theme-scope.integration.spec.ts`
  - `src/tests/theme-scope-demo.integration.spec.ts`
  - `src/tests/database-enterprise-demo.integration.spec.ts`
  - `src/tests/database-preset-demo.integration.spec.ts`
  - `src/tests/database-view-demo.integration.spec.ts`

## 收口结论

- `ThemeScopeScene` 作为公共组件保留并导出。
- `ThemeScopeDemo` 作为轻量主题作用域参考实现保留。
- `DatabasePresetDemo` 作为 preset bundle 官方示例保留。
- `DatabaseEnterpriseDemo` 继续保留为更完整的企业级组合示例。
- `DatabaseViewDemo` 作为页面级 demo 容器，承接 enterprise demo 与 preset demo。

## 验证命令

```bash
npm run test -- src/tests/theme-scope-demo.integration.spec.ts src/tests/theme-scope.integration.spec.ts src/tests/database-enterprise-demo.integration.spec.ts src/tests/database-preset-demo.integration.spec.ts src/tests/database-view-demo.integration.spec.ts
npm run type-check
npm run lint
npm run lint:style
npm run build
npm run test
```

## 验证结果

- 定向测试通过：`5` 个测试文件，`8` 个测试通过。
- 全量测试通过：`21` 个测试文件，`84` 个测试通过。
- `type-check` 通过。
- `lint` 通过。
- `lint:style` 通过。
- `build` 通过。

## 备注

- 本轮未发布新 npm 版本。
- 当前 npm 公开版本仍为 `0.8.5`。
- 本轮目标是补齐场景层能力、示例层能力和对应留痕，不涉及新的 registry 发布动作。
