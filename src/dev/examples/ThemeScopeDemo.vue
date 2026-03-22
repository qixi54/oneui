<script setup lang="ts">
import { computed } from "vue";
import { ThemeScope, ThemeScopeScene } from "../../index";

defineOptions({ name: "ThemeScopeDemo" });

defineProps<{
  globalTheme: "neutral" | "ops-console";
  scopedTheme: "neutral" | "ops-console";
  snippet: string;
}>();

const sceneSnippet = computed(
  () => `<ThemeScopeScene
  theme="ops-console"
  tag="section"
  eyebrow="Scoped Component Tree"
  title="任务总览"
  description="更贴近业务消费的场景壳层"
>
  <template #meta>
    <span class="theme-scope-preview__chip">ThemeScopeScene</span>
  </template>
</ThemeScopeScene>`,
);
</script>

<template>
  <div class="theme-scope-demo">
    <section class="dev-section">
      <h2>局部主题作用域</h2>
      <p class="dev-desc">
        外层继续跟随全局 Theme，但这个 wrapper 会用 `ThemeScope` 注入另一套 token，
        用来验证局部区域可以和根节点主题并存。
      </p>
      <ThemeScope
        :theme="scopedTheme"
        tag="section"
        class="theme-scope-preview"
      >
        <div class="theme-scope-preview__surface">
          <div class="theme-scope-preview__kicker">Scoped Theme</div>
          <h3 class="theme-scope-preview__title">{{ scopedTheme }}</h3>
          <p class="theme-scope-preview__copy">
            全局：{{ globalTheme }} / 局部：{{ scopedTheme }}
          </p>
          <div class="theme-scope-preview__chips">
            <span class="theme-scope-preview__chip">surface</span>
            <span class="theme-scope-preview__chip">accent</span>
            <span class="theme-scope-preview__chip">border</span>
          </div>
          <pre class="theme-scope-preview__code">{{ snippet }}</pre>
        </div>
      </ThemeScope>
    </section>

    <section class="dev-section">
      <h2>组件级场景壳层</h2>
      <p class="dev-desc">
        更接近业务消费的写法，是把真实组件子树直接放进 `ThemeScopeScene`。
        这不会改变组件 API，只会让局部区域继承另一套 token，同时保留标题、说明和 meta/footer 槽位。
      </p>
      <ThemeScopeScene
        theme="ops-console"
        tag="section"
        eyebrow="Scoped Component Tree"
        title="任务总览"
        description="这个区域里的组件将继承 ops-console token，适合命令台、运营面板或嵌入式业务工作区。"
        class="theme-scope-preview theme-scope-preview--component"
      >
        <template #meta>
          <span class="theme-scope-preview__chip">ThemeScopeScene</span>
          <span class="theme-scope-preview__chip">data-of-theme-scope="ops-console"</span>
        </template>

        <div class="theme-scope-preview__surface theme-scope-preview__surface--component">
          <div class="theme-scope-preview__header">
            <div>
              <h3 class="theme-scope-preview__title">任务总览</h3>
              <p class="theme-scope-preview__copy">
                这个区域里的组件将继承 ops-console token，适合命令台、运营面板或嵌入式业务工作区。
              </p>
            </div>
          </div>
          <div class="theme-scope-preview__metrics">
            <div class="theme-scope-preview__metric">
              <span class="theme-scope-preview__metric-value">18</span>
              <span class="theme-scope-preview__metric-label">已完成</span>
            </div>
            <div class="theme-scope-preview__metric">
              <span class="theme-scope-preview__metric-value">6</span>
              <span class="theme-scope-preview__metric-label">进行中</span>
            </div>
          </div>
          <div class="theme-scope-preview__table">
            <div class="theme-scope-preview__table-row theme-scope-preview__table-row--head">
              <span>任务</span>
              <span>状态</span>
              <span>优先级</span>
            </div>
            <div class="theme-scope-preview__table-row">
              <span>补齐主题文案</span>
              <span>进行中</span>
              <span>P1</span>
            </div>
            <div class="theme-scope-preview__table-row">
              <span>加 wrapper 示例</span>
              <span>已完成</span>
              <span>P2</span>
            </div>
          </div>
        </div>

        <template #footer>
          <pre class="theme-scope-preview__code">{{ sceneSnippet }}</pre>
        </template>
      </ThemeScopeScene>
    </section>
  </div>
</template>

<style scoped>
.theme-scope-demo {
  display: grid;
  gap: 24px;
}

.theme-scope-preview {
  padding: 1px;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--of-accent-default) 42%, transparent),
    color-mix(in oklab, var(--of-border-strong) 30%, transparent)
  );
}

.theme-scope-preview__surface {
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 17px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background:
    radial-gradient(circle at top right, color-mix(in oklab, var(--of-accent-soft) 68%, transparent), transparent 46%),
    var(--of-surface-elevated, var(--of-color-bg-elevated));
  box-shadow: var(--of-elevation-card, var(--of-shadow-card));
}

.theme-scope-preview__surface--component {
  gap: 14px;
}

.theme-scope-preview__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.theme-scope-preview__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.theme-scope-preview__metric {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-muted, var(--of-color-bg-hover));
}

.theme-scope-preview__metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--of-text-primary, var(--of-color-text-primary));
}

.theme-scope-preview__metric-label {
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
}

.theme-scope-preview__table {
  display: grid;
  gap: 8px;
}

.theme-scope-preview__table-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 0.8fr;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  color: var(--of-text-primary, var(--of-color-text-primary));
  font-size: 13px;
}

.theme-scope-preview__table-row--head {
  background: var(--of-surface-muted, var(--of-color-bg-hover));
  color: var(--of-text-secondary, var(--of-color-text-secondary));
  font-weight: 700;
}

.theme-scope-preview__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
}

.theme-scope-preview__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--of-text-primary, var(--of-color-text-primary));
}

.theme-scope-preview__copy {
  margin: 0;
  max-width: 520px;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
  line-height: 1.6;
}

.theme-scope-preview__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.theme-scope-preview__code {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-color-bg-code);
  color: var(--of-color-gray-100);
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

.theme-scope-preview__chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  background: var(--of-surface-muted, var(--of-color-bg-hover));
  color: var(--of-text-primary, var(--of-color-text-primary));
  font-size: 12px;
  font-weight: 600;
}
</style>
