<script setup lang="ts">
const props = defineProps<{
  draftCount: number;
}>();

const emit = defineEmits<{
  "commit-all": [];
  "discard-all": [];
}>();
</script>

<template>
  <div class="of-data-table-draft-toolbar">
    <span class="of-data-table-draft-count">{{ props.draftCount }} 条草稿</span>
    <button
      class="of-data-table-draft-btn of-data-table-draft-btn--commit"
      @click="emit('commit-all')"
    >
      全部提交
    </button>
    <button
      class="of-data-table-draft-btn of-data-table-draft-btn--discard"
      @click="emit('discard-all')"
    >
      全部放弃
    </button>
  </div>
</template>

<style scoped>
.of-data-table-draft-toolbar {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  padding: var(--of-spacing-2) var(--of-spacing-3);
  background: var(--of-surface-selected, var(--of-color-bg-active, #f3f4f6));
  border-top: 1px solid var(--of-border-divider, var(--of-border-subtle, #e5e7eb));
  font-size: var(--of-font-size-base);
}

.of-data-table-draft-count {
  color: var(--of-text-secondary, var(--of-color-text-secondary, #4b5563));
  font-weight: var(--of-font-weight-medium);
  flex: 1;
}

.of-data-table-draft-btn {
  padding: var(--of-spacing-1) var(--of-spacing-3);
  border-radius: var(--of-radius-sm);
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  border: none;
  cursor: pointer;
}

.of-data-table-draft-btn--commit {
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #fff));
  color: var(--of-text-primary, var(--of-color-text-primary, #374151));
}

.of-data-table-draft-btn--discard {
  background: var(--of-surface-muted, var(--of-color-bg-hover, #e5e7eb));
  color: var(--of-text-primary, var(--of-color-text-primary, #374151));
}
</style>
