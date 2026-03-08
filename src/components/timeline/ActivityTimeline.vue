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
  if (status === "done") return "#52c41a";
  if (status === "start") return "#fa8c16";
  return "#1677ff";
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
          <span
            v-if="row < skeletonRows.length - 1"
            class="of-activity-timeline__line"
          />
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
        <span
          v-if="index < normalizedItems.length - 1"
          class="of-activity-timeline__line"
        />
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
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.of-activity-timeline__skeleton {
  display: flex !important;
  flex-direction: column !important;
}

.of-activity-timeline__item {
  display: flex !important;
  gap: 12px !important;
}

.of-activity-timeline__item:not(:last-child) {
  margin-bottom: 12px !important;
}

.of-activity-timeline__rail {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  flex-shrink: 0 !important;
}

.of-activity-timeline__dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 999px !important;
  margin-top: 4px !important;
  flex-shrink: 0 !important;
}

.of-activity-timeline__dot--skeleton {
  background: #d9d9d9 !important;
}

.of-activity-timeline__line {
  width: 2px !important;
  flex: 1 !important;
  min-height: 18px !important;
  margin-top: 4px !important;
  background: #f0f0f0 !important;
}

.of-activity-timeline__content {
  flex: 1 !important;
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.of-activity-timeline__header {
  display: flex !important;
  align-items: baseline !important;
  gap: 6px !important;
  flex-wrap: wrap !important;
}

.of-activity-timeline__action {
  font-size: 13px !important;
  line-height: 1.5 !important;
  font-weight: 600 !important;
  color: var(--of-color-text, #262626) !important;
}

.of-activity-timeline__actor {
  font-size: 12px !important;
  line-height: 1.5 !important;
  color: var(--of-color-text-secondary, #8c8c8c) !important;
}

.of-activity-timeline__detail {
  margin: 0 !important;
  font-size: 12px !important;
  line-height: 1.6 !important;
  color: var(--of-color-text-secondary, #595959) !important;
  word-break: break-word !important;
}

.of-activity-timeline__time {
  margin: 0 !important;
  font-size: 11px !important;
  line-height: 1.4 !important;
  color: var(--of-color-text-tertiary, #bfbfbf) !important;
}

.of-activity-timeline__progress {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.of-activity-timeline__progress-track {
  flex: 1 !important;
  min-width: 0 !important;
  height: 4px !important;
  border-radius: 999px !important;
  overflow: hidden !important;
  background: #f0f0f0 !important;
}

.of-activity-timeline__progress-fill {
  height: 100% !important;
  border-radius: 999px !important;
  transition: width 0.24s ease !important;
}

.of-activity-timeline__progress-value {
  flex-shrink: 0 !important;
  font-size: 11px !important;
  line-height: 1.4 !important;
  color: var(--of-color-text-secondary, #8c8c8c) !important;
}

.of-activity-timeline__skeleton-bar {
  display: block !important;
  height: 12px !important;
  border-radius: 999px !important;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 37%, #f5f5f5 63%) !important;
  background-size: 400% 100% !important;
  animation: of-activity-timeline-skeleton 1.4s ease infinite !important;
}

.of-activity-timeline__skeleton-bar--lg {
  width: 68% !important;
}

.of-activity-timeline__skeleton-bar--md {
  width: 52% !important;
}

.of-activity-timeline__skeleton-bar--sm {
  width: 36% !important;
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
