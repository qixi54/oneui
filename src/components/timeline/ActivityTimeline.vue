<script setup lang="ts">
import { computed } from "vue";

export type ActivityTimelineStatus = "done" | "start" | "default";

export interface TimelineItem {
  action: string;
  actor?: string;
  detail?: string;
  progress?: number;
  time?: string;
  status?: ActivityTimelineStatus;
}

export interface ActivityTimelineProps {
  items: TimelineItem[];
  loading?: boolean;
}

const props = withDefaults(defineProps<ActivityTimelineProps>(), {
  loading: false,
});

defineSlots<{
  item?: (props: { item: TimelineItem; index: number }) => unknown;
}>();

const skeletonRows = [0, 1, 2];

const normalizedItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    status: item.status ?? "default",
  })),
);

function getDotColor(status: ActivityTimelineStatus): string {
  if (status === "done") return "var(--of-color-success)";
  if (status === "start") return "var(--of-color-warning)";
  return "var(--of-color-info)";
}

function getProgressValue(progress?: number): number | null {
  if (typeof progress !== "number" || Number.isNaN(progress)) return null;
  return Math.min(100, Math.max(0, progress));
}
</script>

<template>
  <div class="of-activity-timeline" :aria-busy="loading">
    <div v-if="loading" class="of-activity-timeline__skeleton" aria-hidden="true">
      <div
        v-for="row in skeletonRows"
        :key="row"
        class="of-activity-timeline__item of-activity-timeline__item--skeleton"
      >
        <div class="of-activity-timeline__rail">
          <span class="of-activity-timeline__dot of-activity-timeline__dot--skeleton" />
          <span v-if="row < skeletonRows.length - 1" class="of-activity-timeline__line" />
        </div>
        <div class="of-activity-timeline__content">
          <span class="of-activity-timeline__skeleton-bar of-activity-timeline__skeleton-bar--lg" />
          <span class="of-activity-timeline__skeleton-bar of-activity-timeline__skeleton-bar--md" />
          <span class="of-activity-timeline__skeleton-bar of-activity-timeline__skeleton-bar--sm" />
        </div>
      </div>
    </div>

    <div
      v-for="(item, index) in normalizedItems"
      v-else
      :key="`${item.action}-${item.time ?? index}-${index}`"
      class="of-activity-timeline__item"
    >
      <div class="of-activity-timeline__rail">
        <span
          class="of-activity-timeline__dot"
          :style="{ backgroundColor: getDotColor(item.status) }"
        />
        <span v-if="index < normalizedItems.length - 1" class="of-activity-timeline__line" />
      </div>

      <div class="of-activity-timeline__content">
        <slot name="item" :item="item" :index="index">
          <div class="of-activity-timeline__header">
            <span class="of-activity-timeline__action">{{ item.action }}</span>
            <span v-if="item.actor" class="of-activity-timeline__actor">
              {{ item.actor }}
            </span>
          </div>

          <p v-if="item.detail" class="of-activity-timeline__detail">
            {{ item.detail }}
          </p>

          <div
            v-if="getProgressValue(item.progress) !== null"
            class="of-activity-timeline__progress"
          >
            <div class="of-activity-timeline__progress-track">
              <div
                class="of-activity-timeline__progress-fill"
                :style="{
                  width: `${getProgressValue(item.progress)}%`,
                  backgroundColor: getDotColor(item.status),
                }"
              />
            </div>
            <span class="of-activity-timeline__progress-value">
              {{ getProgressValue(item.progress) }}%
            </span>
          </div>

          <p v-if="item.time" class="of-activity-timeline__time">
            {{ item.time }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.of-activity-timeline {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.of-activity-timeline__skeleton {
  display: flex;
  flex-direction: column;
}

.of-activity-timeline__item {
  display: flex;
  gap: 12px;
}

.of-activity-timeline__item:not(:last-child) {
  margin-bottom: 12px;
}

.of-activity-timeline__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.of-activity-timeline__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 4px;
  flex-shrink: 0;
}

.of-activity-timeline__dot--skeleton {
  background: var(--of-color-gray-300, #d9d9d9);
}

.of-activity-timeline__line {
  width: 2px;
  flex: 1;
  min-height: 18px;
  margin-top: 4px;
  background: var(--of-color-gray-100, #f0f0f0);
}

.of-activity-timeline__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.of-activity-timeline__header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.of-activity-timeline__action {
  font-size: 13px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--of-color-text-primary, #262626);
}

.of-activity-timeline__actor {
  font-size: 12px;
  line-height: 1.5;
  color: var(--of-color-text-secondary, #8c8c8c);
}

.of-activity-timeline__detail {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--of-color-text-secondary, #595959);
  word-break: break-word;
}

.of-activity-timeline__time {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--of-color-text-tertiary, #bfbfbf);
}

.of-activity-timeline__progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.of-activity-timeline__progress-track {
  flex: 1;
  min-width: 0;
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--of-color-gray-100, #f0f0f0);
}

.of-activity-timeline__progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.24s ease;
}

.of-activity-timeline__progress-value {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--of-color-text-secondary, #8c8c8c);
}

.of-activity-timeline__skeleton-bar {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--of-color-gray-100, #f5f5f5) 25%,
    var(--of-color-gray-200, #ebebeb) 37%,
    var(--of-color-gray-100, #f5f5f5) 63%
  );
  background-size: 400% 100%;
  animation: of-activity-timeline-skeleton 1.4s ease infinite;
}

.of-activity-timeline__skeleton-bar--lg {
  width: 68%;
}

.of-activity-timeline__skeleton-bar--md {
  width: 52%;
}

.of-activity-timeline__skeleton-bar--sm {
  width: 36%;
}

@keyframes of-activity-timeline-skeleton {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
