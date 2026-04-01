<script setup lang="ts">
import { computed } from "vue";
import { CircleIcon, TagIcon, UserIcon, CalendarIcon, FolderIcon } from "lucide-vue-next";
import { measureTextBlock } from "@/composables";
import type { ColorMap, GalleryItem } from "../../types";
import {
  DEFAULT_PRIORITY_MAP,
  DEFAULT_STATUS_MAP,
  mergeColorMap,
  resolveBadge,
} from "../../composables/useBadge";

const props = withDefaults(
  defineProps<{
    item: GalleryItem;
    priorityColorMap?: ColorMap;
    statusColorMap?: ColorMap;
  }>(),
  {
    priorityColorMap: undefined,
    statusColorMap: undefined,
  },
);

const emit = defineEmits<{
  click: [item: GalleryItem];
}>();

const bannerColor = computed(
  () =>
    props.item.bannerColor ??
    "var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6))",
);
const hasImageCover = computed(
  () => typeof props.item.cover === "string" && /^https?:\/\//.test(props.item.cover),
);

const visibleProps = computed(() => (props.item.extraProps ?? []).slice(0, 2));
const mergedPriorityMap = computed(() =>
  mergeColorMap(DEFAULT_PRIORITY_MAP, props.priorityColorMap),
);
const mergedStatusMap = computed(() => mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap));
const priorityBadge = computed(() => resolveBadge(props.item.priority, mergedPriorityMap.value));
const statusBadge = computed(() => resolveBadge(props.item.status, mergedStatusMap.value));

const iconMap: Record<string, typeof CircleIcon> = {
  tag: TagIcon,
  user: UserIcon,
  calendar: CalendarIcon,
  folder: FolderIcon,
};

function resolveIcon(name?: string) {
  if (!name) return CircleIcon;
  return iconMap[name.toLowerCase()] ?? CircleIcon;
}

const formattedDate = computed(() => {
  const d = props.item.updatedAt ?? props.item.createdAt;
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
});

const CARD_CONTENT_WIDTH = 260 - 16 * 2;
const GALLERY_TITLE_FONT = "600 16px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
const GALLERY_BODY_FONT = "400 14px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
const GALLERY_TAG_FONT = "500 12px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
const GALLERY_TITLE_LINE_HEIGHT = 22;
const GALLERY_BODY_LINE_HEIGHT = 20;
const GALLERY_META_LINE_HEIGHT = 16;
const GALLERY_TAG_LINE_HEIGHT = 18;

function estimateGalleryCardHeight() {
  const titleLayout = measureTextBlock({
    text: props.item.title,
    font: GALLERY_TITLE_FONT,
    maxWidth: CARD_CONTENT_WIDTH,
    lineHeight: GALLERY_TITLE_LINE_HEIGHT,
    minHeight: GALLERY_TITLE_LINE_HEIGHT,
  });
  const descriptionLayout = props.item.description
    ? measureTextBlock({
        text: props.item.description,
        font: GALLERY_BODY_FONT,
        maxWidth: CARD_CONTENT_WIDTH,
        lineHeight: GALLERY_BODY_LINE_HEIGHT,
      })
    : null;
  const badgeLayout = measureTextBlock({
    text: [statusBadge.value.label, priorityBadge.value.label].filter(Boolean).join(" "),
    font: GALLERY_TAG_FONT,
    maxWidth: CARD_CONTENT_WIDTH,
    lineHeight: GALLERY_TAG_LINE_HEIGHT,
    minHeight: GALLERY_TAG_LINE_HEIGHT,
  });
  const propRows = visibleProps.value.length > 0 ? visibleProps.value.length : 0;
  const coverHeight = hasImageCover.value ? 120 : 6;
  const bodyPadding = 28;
  const propsHeight = propRows > 0 ? propRows * GALLERY_META_LINE_HEIGHT + (propRows - 1) * 8 : 0;
  const footerHeight = GALLERY_META_LINE_HEIGHT;

  return Math.max(
    180,
    coverHeight +
      bodyPadding +
      titleLayout.height +
      (descriptionLayout ? 10 + descriptionLayout.height : 0) +
      8 +
      badgeLayout.height +
      (propsHeight > 0 ? 10 + propsHeight : 0) +
      10 +
      footerHeight +
      24,
  );
}

const predictedHeight = computed(() => estimateGalleryCardHeight());
</script>

<template>
  <button
    class="gallery-card"
    type="button"
    :style="{ '--of-gallery-card-predicted-height': `${predictedHeight}px` }"
    :data-gallery-card-predicted-height="predictedHeight"
    @click="emit('click', item)"
  >
    <!-- Cover -->
    <img v-if="hasImageCover" class="gallery-card__cover" :src="item.cover" alt="" />
    <div v-else class="gallery-card__banner" :style="{ backgroundColor: bannerColor }" />

    <!-- Card Body -->
    <div class="gallery-card__body">
      <!-- Title -->
      <div class="gallery-card__title">{{ item.title }}</div>

      <!-- Description -->
      <div v-if="item.description" class="gallery-card__desc">
        {{ item.description }}
      </div>

      <!-- Divider -->
      <div class="gallery-card__divider" />

      <!-- Semantic badges -->
      <div class="gallery-card__badges">
        <span class="gallery-card__badge" :style="statusBadge.style">
          <span
            v-if="statusBadge.dot"
            class="gallery-card__badge-dot"
            :style="{ backgroundColor: statusBadge.dot }"
          />
          {{ statusBadge.label }}
        </span>
        <span class="gallery-card__badge" :style="priorityBadge.style">
          <span
            v-if="priorityBadge.dot"
            class="gallery-card__badge-dot"
            :style="{ backgroundColor: priorityBadge.dot }"
          />
          {{ priorityBadge.label }}
        </span>
      </div>

      <!-- Extra Props -->
      <div v-if="visibleProps.length > 0" class="gallery-card__props">
        <div v-for="prop in visibleProps" :key="prop.key" class="gallery-card__prop-row">
          <component :is="resolveIcon(prop.icon)" class="gallery-card__prop-icon" :size="12" />
          <span class="gallery-card__prop-key">{{ prop.key }}</span>
          <span class="gallery-card__prop-spacer" />
          <span class="gallery-card__prop-value">{{ prop.value }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="gallery-card__footer">
        <span class="gallery-card__task-id">
          <span
            class="gallery-card__status-dot"
            :style="{ backgroundColor: statusBadge.dot ?? statusBadge.style.color }"
          />
          {{ item.id }}
        </span>
        <span class="gallery-card__footer-spacer" />
        <span class="gallery-card__date">{{ formattedDate }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.gallery-card {
  width: 260px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  padding: 0;
  border-radius: var(--of-radius-xl);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  box-shadow: var(--of-shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: var(--of-transition-normal);
  display: flex;
  flex-direction: column;
  text-align: left;
}

.gallery-card:hover {
  box-shadow: var(--of-shadow-card-hover);
  transform: translateY(-2px);
}

/* Banner */
.gallery-card__banner {
  height: 6px;
  flex-shrink: 0;
}

.gallery-card__cover {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

/* Body */
.gallery-card__body {
  padding: var(--of-spacing-3_5) var(--of-spacing-4) var(--of-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2_5);
  flex: 1;
}

/* Title */
.gallery-card__title {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-gray-900));
  line-height: 1.4;
  word-break: break-word;
}

/* Description */
.gallery-card__desc {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-text-secondary, var(--of-color-gray-500));
  line-height: var(--of-line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider */
.gallery-card__divider {
  height: 1px;
  background: var(--of-border-subtle, var(--of-color-gray-100));
  flex-shrink: 0;
}

/* Semantic badges */
.gallery-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-2);
}

.gallery-card__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: 2px 8px;
  border-radius: 999px;
  font-family: var(--of-font-sans);
  font-size: 12px;
  font-weight: var(--of-font-weight-medium);
  line-height: 1.5;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.gallery-card__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* Props */
.gallery-card__props {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
}

.gallery-card__prop-row {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
}

.gallery-card__prop-icon {
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  flex-shrink: 0;
}

.gallery-card__prop-key {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-text-secondary, var(--of-color-gray-500));
  white-space: nowrap;
}

.gallery-card__prop-spacer {
  flex: 1;
}

.gallery-card__prop-value {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-text-primary, var(--of-color-gray-700));
  font-weight: var(--of-font-weight-medium);
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer */
.gallery-card__footer {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.gallery-card__task-id {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_25);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary, var(--of-color-gray-500));
}

.gallery-card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.gallery-card__footer-spacer {
  flex: 1;
}

.gallery-card__date {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary, var(--of-color-gray-400));
}
</style>
