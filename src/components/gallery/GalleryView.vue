<script setup lang="ts">
import { computed } from "vue";
import { PlusIcon } from "lucide-vue-next";
import GalleryCard from "./GalleryCard.vue";
import { buildGalleryItems } from "../../types";
import type { DataRecord, GalleryItem } from "../../types";

const props = withDefaults(
  defineProps<{
    items?: GalleryItem[];
    records?: DataRecord[];
    coverFieldId?: string;
    cardFieldIds?: string[];
    columns?: number;
    addable?: boolean;
  }>(),
  {
    items: () => [],
    records: () => [],
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

const resolvedItems = computed(() => {
  if (props.items.length > 0) return props.items;
  if (props.records.length > 0) {
    return buildGalleryItems(props.records, {
      coverFieldId: props.coverFieldId || undefined,
      cardFieldIds: props.cardFieldIds,
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
  border: 1.5px dashed var(--of-color-gray-200);
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
  background: var(--of-color-gray-50);
  border-color: var(--of-color-gray-300);
}

.gallery-view__add-icon {
  color: var(--of-color-gray-400);
}

.gallery-view__add-label {
  font-family: var(--of-font-sans);
  font-size: 13px;
  color: var(--of-color-gray-400);
  font-weight: 500;
}
</style>
