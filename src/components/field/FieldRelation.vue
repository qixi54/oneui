<script setup lang="ts">
import { nextTick, onMounted, ref, computed } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

type RelationField = FieldDef & { relationMode?: string };

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue | null]; cancel: []; tabNext: [] }>();

const inputRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref("");
const isOpen = ref(false);

// For relation fields, value is typically an id or array of ids
const currentValue = ref<string[]>(
  Array.isArray(props.value)
    ? props.value.filter((v): v is string => typeof v === "string")
    : typeof props.value === "string" && props.value
      ? [props.value]
      : [],
);

const isMulti = computed(() => {
  if (props.field.type !== "relation") return false;
  return (props.field as RelationField).relationMode === "many_to_many";
});

onMounted(() => nextTick(() => inputRef.value?.focus()));

function toggleItem(id: string) {
  if (isMulti.value) {
    const idx = currentValue.value.indexOf(id);
    if (idx >= 0) {
      currentValue.value.splice(idx, 1);
    } else {
      currentValue.value.push(id);
    }
  } else {
    currentValue.value = [id];
    commitValue();
  }
}

function commitValue() {
  if (isMulti.value) {
    emit("commit", currentValue.value.length > 0 ? currentValue.value : null);
  } else {
    emit("commit", currentValue.value[0] ?? null);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
  }
  if (e.key === "Enter") {
    e.preventDefault();
    commitValue();
  }
  if (e.key === "Tab") {
    e.preventDefault();
    commitValue();
    emit("tabNext");
  }
}
</script>

<template>
  <div class="of-field-relation" role="group" aria-label="关联记录选择器">
    <input
      ref="inputRef"
      v-model="searchQuery"
      class="of-field-relation-search"
      type="text"
      :aria-label="field.label"
      placeholder="搜索关联记录..."
      @focus="isOpen = true"
      @keydown="onKeydown"
    />
    <div v-if="currentValue.length > 0" class="of-field-relation-tags">
      <span v-for="id in currentValue" :key="id" class="of-field-relation-tag">
        {{ id }}
        <button type="button" class="of-field-relation-tag-remove" @click="toggleItem(id)">
          ×
        </button>
      </span>
    </div>
    <div class="of-field-relation-hint">关联记录选择器（需由消费方通过 slot 提供数据源）</div>
  </div>
</template>

<style scoped>
.of-field-relation {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 4px;
}
.of-field-relation-search {
  width: 100%;
  padding: 4px 6px;
  font-size: 13px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: 6px;
  outline: none;
  background: var(--of-surface-elevated, transparent);
  color: var(--of-text-primary, var(--of-color-text, #1a1a1a));
}
.of-field-relation-search:focus {
  border-color: var(--of-border-strong, var(--of-text-secondary));
}
.of-field-relation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.of-field-relation-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  font-size: 12px;
  background: var(--of-surface-selected, var(--of-surface-muted));
  color: var(--of-text-primary, var(--of-text-strong));
  border-radius: 6px;
}
.of-field-relation-tag-remove {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--of-text-tertiary, var(--of-text-secondary));
  padding: 0 2px;
  line-height: 1;
}
.of-field-relation-hint {
  font-size: 11px;
  color: var(--of-text-tertiary, var(--of-color-gray-400));
  padding: 2px 4px;
}
</style>
