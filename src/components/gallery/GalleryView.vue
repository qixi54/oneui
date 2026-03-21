<script setup lang="ts">
import { computed } from "vue";
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

const gridStyle = computed(() => ({
  "--columns": props.columns,
}));

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
  <div class="gallery-view" :style="gridStyle">
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
  grid-template-columns: repeat(var(--columns, 4), 260px);
  gap: 16px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  align-items: start;
}

/* Add Button */
.gallery-view__add-btn {
  width: 260px;
  min-height: 140px;
  border: 1.5px dashed var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-xl);
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--of-transition-normal);
  outline: none;
}

.gallery-view__add-btn:hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
  border-color: var(--of-border-strong, var(--of-color-gray-300));
}

.gallery-view__add-icon {
  color: var(--of-text-tertiary, var(--of-color-gray-400));
}

.gallery-view__add-label {
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  font-weight: 500;
}
</style>
