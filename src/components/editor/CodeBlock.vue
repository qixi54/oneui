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
  background: #1e293b;
  border-radius: var(--of-radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

/* Header */
.code-block__header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.code-block__lang {
  font-family: var(--of-font-mono) !important;
  font-size: 11px !important;
  color: #94a3b8 !important;
  text-transform: lowercase;
}

.code-block__copy-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid #334155;
  border-radius: var(--of-radius-sm);
  padding: 2px 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: var(--of-transition-fast);
  outline: none;
}

.code-block__copy-btn:hover {
  border-color: #475569;
  color: #cbd5e1;
  background: #263246;
}

.code-block__copy-btn--copied {
  color: #4ade80;
  border-color: #166534;
}

.code-block__copy-label {
  font-family: var(--of-font-sans) !important;
  font-size: 11px !important;
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
  font-family: var(--of-font-mono) !important;
  font-size: 12px !important;
  color: #e2e8f0 !important;
  line-height: 1.6;
}
</style>
