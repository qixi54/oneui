---
生成时间: 2026-03-22 16:57:58
参考文档: package.json, vite.config.ts, README.md, README.en.md, scripts/consumer-smoke-entrypoints.sh
角色定义: /opt/Oneflow/SOP/规划文档写作标准.md
文档生成目的: 记录 OneUI 包入口治理（composables/theme subpath exports）本轮实现与验证证据
生成模型: GPT-5
---

# OneUI 包入口治理验证

## 变更目标

- 增加 `@oneflowui/ui/composables` 入口，明确 composables 消费边界
- 增加 `@oneflowui/ui/theme` 入口，将样式注入与插件注册解耦
- 收紧 `sideEffects`，显式保留 CSS 与主题入口的副作用
- 补充文档与测试，确保外部 consumer 能真实消费新入口

## 涉及文件

- `package.json`
- `vite.config.ts`
- `src/theme.ts`
- `src/tests/package-entrypoints.integration.spec.ts`
- `src/dev/DatabaseViewDemo.vue`
- `src/dev/App.vue`
- `README.md`
- `README.en.md`
- `docs/ONEUI-INDEX.md`
- `scripts/consumer-smoke-entrypoints.sh`

## 验证命令

### 仓库内验证

```bash
npm run type-check
npm run test
npm run lint
npm run lint:style
npm run build
```

### 打包与外部 consumer smoke

```bash
npm pack --pack-destination /tmp/oneui_pkg_entry_084
npm publish --dry-run --registry=https://registry.npmjs.org
scripts/consumer-smoke-entrypoints.sh /tmp/oneui_pkg_entry_084 /tmp/oneui_pkg_entry_084/oneflowui-ui-0.8.4.tgz
```

## 验证结果

- `npm run type-check` 通过
- `npm run test` 通过，当前为 `19` 个测试文件、`80` 个测试
- `npm run lint` 通过
- `npm run lint:style` 通过
- `npm run build` 通过
- `npm pack` 成功生成 tarball：`/tmp/oneui_pkg_entry_084/oneflowui-ui-0.8.4.tgz`
- `npm publish --dry-run --registry=https://registry.npmjs.org` 通过
- `scripts/consumer-smoke-entrypoints.sh` 通过，双 host 矩阵均成功

## 外部消费证据

- Tarball：`/tmp/oneui_pkg_entry_084/oneflowui-ui-0.8.4.tgz`
- dry-run 日志：`/tmp/oneui_pkg_entry_084/npm-publish-dry-run.log`
- Vite 5.4.21 install 日志：`/tmp/oneui_pkg_entry_084/consumer-5.4.21-install.log`
- Vite 5.4.21 build 日志：`/tmp/oneui_pkg_entry_084/consumer-5.4.21-build.log`
- Vite 8.0.1 install 日志：`/tmp/oneui_pkg_entry_084/consumer-8.0.1-install.log`
- Vite 8.0.1 build 日志：`/tmp/oneui_pkg_entry_084/consumer-8.0.1-build.log`

## 结果判定

- 新增 subpath exports 与构建产物对齐
- 外部 consumer 可同时消费：
  - `@oneflowui/ui`
  - `@oneflowui/ui/composables`
  - `@oneflowui/ui/theme`
- 当前仍未发布新 npm 版本；本轮结论是“已完成发布前入口治理与消费验证”
