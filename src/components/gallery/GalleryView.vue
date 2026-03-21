<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { PlusIcon } from "lucide-vue-next";
import GalleryCard from "./GalleryCard.vue";
import { buildGalleryItems } from "../../types";
import type { DataRecord, GalleryItem, TableSchema, ViewConfig } from "../../types";

const props = withDefaults(
  defineProps<{
    items?: GalleryItem[];
    records?: DataRecord[];
    schema?: TableSchema;
    view?: ViewConfig;
    coverFieldId?: string;
    cardFieldIds?: string[];
    columns?: number;
    addable?: boolean;
  }>(),
  {
    items: () => [],
    records: () => [],
    schema: undefined,
    view: undefined,
    coverFieldId: "",
    cardFieldIds: () => [],
    columns: 4,
    addable: true,
  },
);

const emit = defineEmits<{
  "card-click": [item: GalleryItem];
  add: [];
}>();

const galleryRef = ref<HTMLElement | null>(null);
const galleryWidth = ref(0);
let resizeObserver: ResizeObserver | null = null;

const resolvedColumns = computed(() => Math.max(1, Math.floor(props.columns)));

const responsiveColumns = computed(() => {
  const width = galleryWidth.value;
  const base = resolvedColumns.value;
  if (!width) return base;
  if (width < 520) return 1;
  if (width < 820) return Math.min(base, 2);
  if (width < 1120) return Math.min(base, 3);
  return base;
});

const gridStyle = computed(() => ({
  "--gallery-columns": String(responsiveColumns.value),
  "--gallery-card-min-width": responsiveColumns.value <= 1 ? "0px" : "220px",
}));

function updateGalleryWidth(entry?: ResizeObserverEntry) {
  if (entry) {
    galleryWidth.value = Math.round(entry.contentRect.width);
    return;
  }
  galleryWidth.value = Math.round(galleryRef.value?.getBoundingClientRect().width ?? 0);
}

onMounted(() => {
  updateGalleryWidth();
  if (typeof ResizeObserver === "undefined" || !galleryRef.value) return;
  resizeObserver = new ResizeObserver((entries) => {
    if (entries[0]) updateGalleryWidth(entries[0]);
  });
  resizeObserver.observe(galleryRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

// ─── view-driven config with direct-prop override ─────────────────────────
const effectiveCoverFieldId = computed(
  () => props.coverFieldId || props.view?.galleryCoverFieldId || "",
);

const effectiveCardFieldIds = computed(() => {
  if (props.cardFieldIds?.length) return props.cardFieldIds;
  if (props.view?.galleryCardFields?.length) return props.view.galleryCardFields;
  // 兜底：如果有 view.visibleFields，取其去掉 cover 字段
  if (props.view?.visibleFields?.length) {
    return props.view.visibleFields.filter((f) => f !== effectiveCoverFieldId.value);
  }
  return [];
});

const resolvedItems = computed(() => {
  if (props.items.length > 0) return props.items;
  if (props.records.length > 0) {
    return buildGalleryItems(props.records, {
      coverFieldId: effectiveCoverFieldId.value || undefined,
      cardFieldIds: effectiveCardFieldIds.value,
    });
  }
  return [];
});
</script>

<template>
  <div ref="galleryRef" class="gallery-view" :style="gridStyle">
    <GalleryCard
      v-for="item in resolvedItems"
      :key="item.id"
      :item="item"
      @click="emit('card-click', item)"
    />

    <!-- Add Card Button -->
    <button v-if="addable" class="gallery-view__add-btn" @click="emit('add')">
      <PlusIcon :size="18" class="gallery-view__add-icon" />
      <span class="gallery-view__add-label">添加</span>
    </button>
  </div>
</template>

<style scoped>
.gallery-view {
  display: grid;
  grid-template-columns: repeat(var(--gallery-columns, 4), minmax(var(--gallery-card-min-width, 220px), 1fr));
  gap: 16px;
  overflow-x: auto;
  padding: 12px;
  align-items: start;
  container-type: inline-size;
  background: var(--of-surface-workspace, var(--of-surface-elevated, var(--of-color-bg-elevated)));
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-100)));
  border-radius: var(--of-radius-2xl, var(--of-radius-xl));
  box-sizing: border-box;
}

/* Add Button */
.gallery-view__add-btn {
  width: 100%;
  min-height: 140px;
  border: 1.5px dashed var(--of-row-action-border, var(--of-border-subtle, var(--of-color-gray-200)));
  border-radius: var(--of-radius-xl);
  background: var(--of-surface-workspace-raised, var(--of-surface-elevated, var(--of-color-bg-elevated)));
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
  outline: none;
}

.gallery-view__add-btn:hover {
  transform: translateY(-1px);
  background: var(--of-row-action-hover, var(--of-surface-muted, var(--of-color-gray-50)));
  border-color: var(--of-row-action-active, var(--of-border-strong, var(--of-color-gray-300)));
  box-shadow: var(--of-card-shadow-hover, var(--of-shadow-card-hover));
}

.gallery-view__add-btn:focus-visible {
  border-color: var(--of-status-active, var(--of-accent-default, var(--of-color-gray-400)));
  box-shadow: 0 0 0 3px var(--of-accent-soft, rgba(15, 23, 42, 0.12));
}

.gallery-view__add-icon {
  color: var(--of-status-active, var(--of-text-tertiary, var(--of-color-gray-400)));
}

.gallery-view__add-label {
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-row-action-text, var(--of-text-tertiary, var(--of-color-gray-400)));
  font-weight: 500;
}
</style>
