<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue]; cancel: []; tabNext: [] }>();

const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });
const isOpen = ref(true);

const options = computed(() => props.field.options ?? []);
const selectedIndex = computed(() => {
  const currentValue = typeof props.value === "string" ? props.value : null;
  return options.value.findIndex((opt) => opt.value === currentValue);
});
const activeIndex = ref(0);

function updateDropdownPosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 160)}px`,
  };
}

function selectValue(raw: string | null) {
  isOpen.value = false;
  emit("commit", raw);
}

function closeAsCancel() {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit("cancel");
}

function onKeydown(e: KeyboardEvent) {
  if (!options.value.length) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeAsCancel();
    }
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, options.value.length - 1);
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    selectValue(options.value[activeIndex.value]?.value ?? null);
    return;
  }
  if (e.key === "Escape") {
    e.preventDefault();
    closeAsCancel();
    return;
  }
  if (e.key === "Tab") {
    e.preventDefault();
    selectValue(options.value[activeIndex.value]?.value ?? null);
    emit("tabNext");
  }
}

function onWindowPointerDown(e: MouseEvent) {
  const target = e.target as Node | null;
  if (!target) return;
  if (triggerRef.value?.contains(target)) return;
  if (dropdownRef.value?.contains(target)) return;
  closeAsCancel();
}

onMounted(() => {
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
  nextTick(() => {
    updateDropdownPosition();
    triggerRef.value?.focus();
  });
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
  window.addEventListener("mousedown", onWindowPointerDown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
  window.removeEventListener("mousedown", onWindowPointerDown, true);
});

watch(selectedIndex, (idx) => {
  if (idx >= 0) activeIndex.value = idx;
});

const selectedOption = computed(() => {
  const currentValue = typeof props.value === "string" ? props.value : null;
  return options.value.find((opt) => opt.value === currentValue);
});
</script>

<template>
  <div ref="triggerRef" class="of-field-select" tabindex="0" @keydown="onKeydown">
    <span
      v-if="selectedOption?.color"
      class="of-field-select__badge"
      :style="{ background: selectedOption.color }"
    >
      {{ selectedOption.label }}
    </span>
    <span v-else class="of-field-select__display">
      {{ selectedOption?.label ?? "—" }}
    </span>

    <Teleport to="body">
      <div v-if="isOpen" ref="dropdownRef" class="of-field-select__dropdown" :style="dropdownStyle">
        <div
          class="of-field-select__option of-field-select__option--clear"
          :class="{ active: activeIndex === -1, selected: selectedIndex === -1 }"
          @click.stop="selectValue(null)"
        >
          —
        </div>
        <div
          v-for="(opt, i) in options"
          :key="opt.value"
          class="of-field-select__option"
          :class="{ active: i === activeIndex, selected: i === selectedIndex }"
          @mouseenter="activeIndex = i"
          @click.stop="selectValue(opt.value)"
        >
          <span
            v-if="opt.color"
            class="of-field-select__badge"
            :style="{ background: opt.color }"
            >{{ opt.label }}</span
          >
          <span v-else>{{ opt.label }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.of-field-select {
  width: 100%;
  min-height: 28px;
  padding: 2px 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}

.of-field-select__display {
  font-size: 13px;
  color: var(--of-color-text-primary);
}

.of-field-select__dropdown {
  position: fixed;
  z-index: 9999;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-border-color);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
}

.of-field-select__option {
  min-height: 30px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.of-field-select__option:hover,
.of-field-select__option.active {
  background: var(--of-color-bg-hover);
}

.of-field-select__option.selected {
  font-weight: 600;
}

.of-field-select__option--clear {
  border-bottom: 1px solid var(--of-color-border-light);
}

.of-field-select__badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--of-color-text-inverse);
  line-height: 18px;
}
</style>
