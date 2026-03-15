<script setup lang="ts">
import { ref, watch } from "vue";
import { GripVertical, Eye, EyeOff, X } from "lucide-vue-next";
import { VueDraggable } from "vue-draggable-plus";
import type { TableColumn } from "../../types";

const props = defineProps<{
  columns: TableColumn[];
  visible?: boolean;
}>();

const emit = defineEmits<{
  "update:columns": [columns: TableColumn[]];
  close: [];
}>();

// 本地副本，带 hidden 字段支持
interface ManagedColumn extends TableColumn {
  hidden?: boolean;
}

const localColumns = ref<ManagedColumn[]>([]);

watch(
  () => props.columns,
  (val) => {
    localColumns.value = val.map((c) => ({ ...c }));
  },
  { immediate: true, deep: true },
);

function emitUpdate() {
  emit(
    "update:columns",
    localColumns.value.map((c) => ({ ...c })),
  );
}

function toggleVisible(col: ManagedColumn) {
  col.hidden = !col.hidden;
  emitUpdate();
}

function showAll() {
  localColumns.value.forEach((c) => (c.hidden = false));
  emitUpdate();
}

function hideAll() {
  localColumns.value.forEach((c) => (c.hidden = true));
  emitUpdate();
}

function onDragEnd() {
  emitUpdate();
}
</script>

<template>
  <div v-if="visible !== false" class="of-col-manager">
    <div class="of-col-manager__header">
      <span class="of-col-manager__title">管理列</span>
      <button class="of-col-manager__close" @click="emit('close')">
        <X :size="14" />
      </button>
    </div>

    <div class="of-col-manager__actions">
      <button class="of-col-manager__action-btn" @click="showAll">
        <Eye :size="12" /> 显示全部
      </button>
      <button class="of-col-manager__action-btn" @click="hideAll">
        <EyeOff :size="12" /> 隐藏全部
      </button>
    </div>

    <VueDraggable
      v-model="localColumns"
      handle=".of-col-manager__drag"
      :animation="150"
      @end="onDragEnd"
    >
      <div v-for="col in localColumns" :key="col.key" class="of-col-manager__row">
        <span class="of-col-manager__drag">
          <GripVertical :size="14" />
        </span>
        <input
          type="checkbox"
          class="of-col-manager__checkbox"
          :checked="!col.hidden"
          @change="toggleVisible(col)"
        />
        <span class="of-col-manager__label" :class="{ dimmed: col.hidden }">{{ col.label }}</span>
      </div>
    </VueDraggable>
  </div>
</template>

<style scoped>
.of-col-manager {
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-xl);
  box-shadow: var(--of-shadow-modal);
  min-width: 220px;
  padding: 12px 16px;
  font-family: var(--of-font-sans);
}

.of-col-manager__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.of-col-manager__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--of-color-gray-800);
}

.of-col-manager__close {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--of-color-gray-400);
  padding: 2px;
  border-radius: var(--of-radius-sm);
  display: flex;
  align-items: center;
}

.of-col-manager__close:hover {
  color: var(--of-color-gray-600);
  background: var(--of-color-gray-100);
}

.of-col-manager__actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.of-col-manager__action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-family: var(--of-font-sans);
  color: var(--of-color-gray-500);
  background: var(--of-color-gray-50);
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-md);
  padding: 3px 8px;
  cursor: pointer;
}

.of-col-manager__action-btn:hover {
  background: var(--of-color-gray-100);
  color: var(--of-color-gray-700);
}

.of-col-manager__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--of-color-gray-50);
}

.of-col-manager__row:last-child {
  border-bottom: none;
}

.of-col-manager__drag {
  color: var(--of-color-gray-300);
  cursor: grab;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.of-col-manager__drag:active {
  cursor: grabbing;
}

.of-col-manager__checkbox {
  cursor: pointer;
  flex-shrink: 0;
}

.of-col-manager__label {
  font-size: 12px;
  color: var(--of-color-gray-800);
  flex: 1;
}

.of-col-manager__label.dimmed {
  color: var(--of-color-gray-400);
  text-decoration: line-through;
}
</style>
