<script setup lang="ts">
import { computed } from "vue";
import { CircleIcon, TagIcon, UserIcon, CalendarIcon, FolderIcon } from "lucide-vue-next";
import type { GalleryItem } from "../../types";

const props = withDefaults(
  defineProps<{
    item: GalleryItem;
  }>(),
  {},
);

const emit = defineEmits<{
  click: [item: GalleryItem];
}>();

const bannerColor = computed(() => props.item.bannerColor ?? "#BFDBFE");
const hasImageCover = computed(
  () => typeof props.item.cover === "string" && /^https?:\/\//.test(props.item.cover),
);

const visibleProps = computed(() => (props.item.extraProps ?? []).slice(0, 2));

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

const statusDotColor: Record<string, string> = {
  todo: "var(--of-color-gray-400)",
  in_progress: "var(--of-color-info)",
  blocked: "var(--of-color-warning)",
  done: "var(--of-color-success)",
};

const dotColor = computed(() => statusDotColor[props.item.status] ?? "var(--of-color-gray-400)");
</script>

<template>
  <div class="gallery-card" @click="emit('click', item)">
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
          <span class="gallery-card__status-dot" :style="{ backgroundColor: dotColor }" />
          {{ item.id }}
        </span>
        <span class="gallery-card__footer-spacer" />
        <span class="gallery-card__date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-card {
  width: 260px;
  background: var(--of-color-bg-elevated);
  border-radius: var(--of-radius-xl);
  border: 1px solid var(--of-color-gray-200);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  cursor: pointer;
  transition: var(--of-transition-normal);
  display: flex;
  flex-direction: column;
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
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

/* Title */
.gallery-card__title {
  font-family: var(--of-font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--of-color-gray-900);
  line-height: 1.4;
  word-break: break-word;
}

/* Description */
.gallery-card__desc {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-color-gray-500);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider */
.gallery-card__divider {
  height: 1px;
  background: var(--of-color-gray-100);
  flex-shrink: 0;
}

/* Props */
.gallery-card__props {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gallery-card__prop-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gallery-card__prop-icon {
  color: var(--of-color-gray-400);
  flex-shrink: 0;
}

.gallery-card__prop-key {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-color-gray-500);
  white-space: nowrap;
}

.gallery-card__prop-spacer {
  flex: 1;
}

.gallery-card__prop-value {
  font-family: var(--of-font-sans);
  font-size: 12px;
  color: var(--of-color-gray-700);
  font-weight: 500;
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
  gap: 5px;
  font-family: var(--of-font-sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--of-color-primary-500);
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
  font-size: 11px;
  color: var(--of-color-gray-400);
}
</style>
