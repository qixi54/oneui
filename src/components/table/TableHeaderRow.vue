<script setup lang="ts">
import { computed } from "vue";
import { ChevronUp, ChevronDown } from "lucide-vue-next";
import type { TableColumn } from "../../types";

const props = withDefaults(
  defineProps<{
    columns?: TableColumn[];
    selectable?: boolean;
    sortKey?: string;
    sortOrder?: "asc" | "desc";
    allSelected?: boolean;
    indeterminate?: boolean;
  }>(),
  {
    selectable: true,
    sortKey: "",
    sortOrder: "asc",
    allSelected: false,
    indeterminate: false,
  },
);

const emit = defineEmits<{
  sort: [key: string];
  "select-all": [];
}>();

const defaultColumns: TableColumn[] = [
  { key: "id", label: "任务ID", width: 100, align: "left" },
  { key: "title", label: "标题", width: "fill", align: "left" },
  { key: "status", label: "状态", width: 90, align: "left" },
  { key: "role", label: "负责角色", width: 90, align: "left" },
  { key: "priority", label: "优先级", width: 70, align: "left" },
  { key: "updatedAt", label: "更新时间", width: 100, align: "left" },
];

const resolvedColumns = computed(() => props.columns ?? defaultColumns);

function colStyle(col: TableColumn) {
  if (col.width === "fill") return { flex: "1 1 0" };
  return { width: `${col.width}px`, flexShrink: "0", flexGrow: "0" };
}

function handleSort(key: string) {
  emit("sort", key);
}
</script>

<template>
  <div class="of-table-header">
    <!-- Checkbox 列 -->
    <div v-if="selectable" class="of-th of-th-checkbox">
      <input
        type="checkbox"
        class="of-checkbox"
        :checked="allSelected"
        :indeterminate="indeterminate"
        @change="emit('select-all')"
      />
    </div>

    <!-- 数据列 -->
    <div
      v-for="col in resolvedColumns"
      :key="col.key"
      class="of-th"
      :style="colStyle(col)"
      :class="{ 'of-th--sortable': true, 'of-th--active': sortKey === col.key }"
      @click="handleSort(col.key)"
    >
      <span class="of-th-label">{{ col.label }}</span>
      <span class="of-th-sort-icon">
        <ChevronUp
          v-if="sortKey === col.key && sortOrder === 'asc'"
          :size="12"
          class="of-sort-icon-active"
        />
        <ChevronDown
          v-else-if="sortKey === col.key && sortOrder === 'desc'"
          :size="12"
          class="of-sort-icon-active"
        />
        <ChevronDown v-else :size="12" class="of-sort-icon-idle" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.of-table-header {
  display: flex;
  align-items: center;
  background: var(--of-color-gray-50);
  border-bottom: 1px solid var(--of-color-gray-200);
  padding: 0;
  user-select: none;
}

.of-th {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--of-color-gray-500);
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-th--active {
  color: var(--of-color-gray-700);
}

.of-th:hover {
  color: var(--of-color-gray-700);
}

.of-th-checkbox {
  width: 20px;
  flex-shrink: 0;
  flex-grow: 0;
  padding: 10px 12px;
  cursor: default;
}

.of-th-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-th-sort-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.of-sort-icon-active {
  color: var(--of-color-primary-500);
}

.of-sort-icon-idle {
  color: var(--of-color-gray-300);
  opacity: 0;
}

.of-th:hover .of-sort-icon-idle {
  opacity: 1;
}

.of-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--of-color-primary-500);
}
</style>
