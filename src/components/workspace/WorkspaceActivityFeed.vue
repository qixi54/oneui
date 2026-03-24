<script setup lang="ts">
import type { WorkspaceActivityItem } from "../../types";

const props = withDefaults(
  defineProps<{
    items?: WorkspaceActivityItem[];
    emptyText?: string;
  }>(),
  {
    items: () => [],
    emptyText: "暂无活动记录",
  },
);

defineOptions({ name: "WorkspaceActivityFeed" });
</script>

<template>
  <section class="of-workspace-activity-feed">
    <slot name="header" />

    <div v-if="props.items.length" class="of-workspace-activity-feed__list">
      <article
        v-for="item in props.items"
        :key="item.id"
        class="of-workspace-activity-feed__item"
      >
        <div class="of-workspace-activity-feed__item-head">
          <span class="of-workspace-activity-feed__author">{{ item.author }}</span>
          <span v-if="item.action" class="of-workspace-activity-feed__action">{{ item.action }}</span>
          <time class="of-workspace-activity-feed__time">{{ item.time }}</time>
        </div>
        <p class="of-workspace-activity-feed__content">{{ item.content }}</p>
      </article>
    </div>
    <p v-else class="of-workspace-activity-feed__empty">{{ props.emptyText }}</p>

    <slot name="footer" />
  </section>
</template>

<style scoped>
.of-workspace-activity-feed {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
  width: 100%;
}

.of-workspace-activity-feed__list {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
}

.of-workspace-activity-feed__item {
  display: grid;
  gap: var(--of-spacing-1);
  padding: 0 0 var(--of-spacing-2) var(--of-spacing-2_5);
  border-left: 2px solid #f1f5f9;
  border-bottom: 1px solid #f3f4f6;
}

.of-workspace-activity-feed__item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.of-workspace-activity-feed__item-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--of-spacing-1_5);
  font-size: var(--of-font-size-xs);
}

.of-workspace-activity-feed__author {
  color: var(--of-text-primary, var(--of-color-text, #111827));
  font-weight: var(--of-font-weight-medium);
}

.of-workspace-activity-feed__action,
.of-workspace-activity-feed__time {
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-workspace-activity-feed__content {
  margin: 0;
  color: var(--of-text-primary, var(--of-color-text, #111827));
  font-size: var(--of-font-size-xs);
  line-height: var(--of-line-height-relaxed);
}

.of-workspace-activity-feed__empty {
  margin: 0;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  font-size: var(--of-font-size-sm);
}
</style>
