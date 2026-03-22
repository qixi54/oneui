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
  gap: 8px;
  padding: 8px 12px;
  background: var(--of-surface-selected, var(--of-color-bg-active, #f3f4f6));
  border-top: 1px solid var(--of-border-divider, var(--of-border-subtle, #e5e7eb));
  font-size: 13px;
}

.of-data-table-draft-count {
  color: var(--of-text-secondary, var(--of-color-text-secondary, #4b5563));
  font-weight: 500;
  flex: 1;
}

.of-data-table-draft-btn {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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
