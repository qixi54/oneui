# 组件开发模板

新建 OneUI 组件时，从 `ComponentTemplate.vue` 复制并重命名。

## 强制规范（5 条）

1. **attrs 透传**：`defineOptions({ inheritAttrs: false })` + 根元素 `v-bind="$attrs"`
2. **Props 默认值**：所有 `optional` prop 必须用 `withDefaults`，不允许裸 `defineProps`
3. **图标类型**：`icon` prop 使用 `Component` 类型而非 `string`，用 `resolveIcon()` 渲染
4. **色值 Token**：禁止 `rgba()` / `rgb()` / `#hex` 字面量，必须用 `var(--of-color-*)`
5. **ARIA**：所有交互元素必须有语义 ARIA 属性

## 使用方式

```bash
cp src/components/_template/ComponentTemplate.vue src/components/base/MyWidget.vue
# 然后替换 of-component-name → of-my-widget，按需修改 props/emits/template
```
