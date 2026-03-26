<script setup lang="ts">
import { ref } from "vue";
import { CopyIcon, CheckIcon } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
    copyable?: boolean;
  }>(),
  {
    language: "bash",
    copyable: true,
  },
);

const copied = ref(false);

async function handleCopy() {
  if (copied.value) return;
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // clipboard not available
  }
}
</script>

<template>
  <div class="code-block">
    <!-- Header: language + copy -->
    <div class="code-block__header">
      <span class="code-block__lang">{{ language }}</span>
      <button
        v-if="copyable"
        class="code-block__copy-btn"
        :class="{ 'code-block__copy-btn--copied': copied }"
        :title="copied ? '已复制' : '复制代码'"
        @click="handleCopy"
      >
        <CheckIcon v-if="copied" :size="13" />
        <CopyIcon v-else :size="13" />
        <span class="code-block__copy-label">{{ copied ? "已复制" : "复制" }}</span>
      </button>
    </div>

    <!-- Code -->
    <pre class="code-block__pre"><code class="code-block__code">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--of-surface-panel, var(--of-color-gray-800));
  border-radius: var(--of-radius-md);
  padding: var(--of-spacing-3_5) var(--of-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
  overflow: hidden;
}

/* Header */
.code-block__header {
  display: flex;
  align-items: center;
  margin-bottom: var(--of-spacing-1_5);
}

.code-block__lang {
  font-family: var(--of-font-mono);
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  text-transform: lowercase;
}

.code-block__copy-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1);
  background: transparent;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-700));
  border-radius: var(--of-radius-sm);
  padding: var(--of-spacing-0_5) var(--of-spacing-2);
  cursor: pointer;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  transition: var(--of-transition-fast);
  outline: none;
}

.code-block__copy-btn:hover {
  border-color: var(--of-border-strong, var(--of-color-gray-600));
  color: var(--of-text-secondary, var(--of-color-gray-300));
  background: var(--of-surface-muted, var(--of-color-gray-900));
}

.code-block__copy-btn:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.code-block__copy-btn--copied {
  color: var(--of-color-success);
  border-color: var(--of-color-success);
}

.code-block__copy-label {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-xs);
}

/* Code */
.code-block__pre {
  margin: 0;
  padding: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.code-block__code {
  font-family: var(--of-font-mono);
  font-size: var(--of-font-size-sm);
  color: var(--of-text-primary, var(--of-color-gray-200));
  line-height: var(--of-line-height-relaxed);
}
</style>
