<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useBreakpoint } from "@/composables/useBreakpoint";
import type { CellValue } from "@/components/table/FieldCell.vue";
import FieldWrapper from "./FieldWrapper.vue";
import {
  useFieldBase,
  useFieldOptions,
  type StandaloneOptionsFieldProps,
} from "@/composables/useFieldBase";

const props = defineProps<StandaloneOptionsFieldProps>();
const emit = defineEmits<{
  commit: [value: CellValue];
  cancel: [];
  tabNext: [];
  "update:modelValue": [value: CellValue];
}>();

const { isMobile } = useBreakpoint();

const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });
const isOpen = ref(false);

const { isStandalone, currentValue, resolvedLabel, resolvedDisabled } = useFieldBase({
  props,
  focusRef: triggerRef,
});
const options = useFieldOptions(props);
const currentStringValue = computed(() =>
  typeof currentValue.value === "string" ? currentValue.value : null,
);
const selectedIndex = computed(() => {
  return options.value.findIndex((opt) => opt.value === currentStringValue.value);
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
  if (isStandalone.value) {
    emit("update:modelValue", raw);
  }
}

function closeAsCancel() {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit("cancel");
}

function onKeydown(e: KeyboardEvent) {
  if (resolvedDisabled.value) return;
  if (!isOpen.value && isStandalone.value) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      isOpen.value = true;
      nextTick(() => updateDropdownPosition());
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      emit("cancel");
    }
    return;
  }
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

function onTriggerClick() {
  if (!isStandalone.value || resolvedDisabled.value) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    updateDropdownPosition();
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
  if (!isStandalone.value) {
    isOpen.value = true;
    nextTick(() => {
      updateDropdownPosition();
    });
  }
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
  return options.value.find((opt) => opt.value === currentStringValue.value);
});
</script>

<template>
  <FieldWrapper
    v-if="isStandalone"
    :label="label"
    :required="required"
    :disabled="resolvedDisabled"
    :error="error"
  >
      <button
        ref="triggerRef"
        type="button"
        class="of-field-select of-field-select--standalone"
        role="listbox"
        :aria-label="resolvedLabel"
        :disabled="resolvedDisabled"
        @click="onTriggerClick"
        @keydown="onKeydown"
      >
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
      </button>
  </FieldWrapper>

  <div
    v-else
    ref="triggerRef"
    class="of-field-select"
    tabindex="0"
    role="listbox"
    :aria-label="resolvedLabel"
    @keydown="onKeydown"
  >
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
  </div>

  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="of-field-select__dropdown"
      :class="{ 'of-field-select__dropdown--sheet': isMobile }"
      :style="isMobile ? {} : dropdownStyle"
    >
      <div
        class="of-field-select__option of-field-select__option--clear"
        role="option"
        tabindex="0"
        :aria-selected="selectedIndex === -1"
        :class="{ active: activeIndex === -1, selected: selectedIndex === -1 }"
        @click.stop="selectValue(null)"
        @focusin="activeIndex = -1"
        @keydown.enter.prevent="selectValue(null)"
        @keydown.space.prevent="selectValue(null)"
      >
        —
      </div>
      <div
        v-for="(opt, i) in options"
        :key="opt.value"
        class="of-field-select__option"
        role="option"
        tabindex="0"
        :aria-selected="i === selectedIndex"
        :class="{ active: i === activeIndex, selected: i === selectedIndex }"
        @mouseenter="activeIndex = i"
        @click.stop="selectValue(opt.value)"
        @focusin="activeIndex = i"
        @keydown.enter.prevent="selectValue(opt.value)"
        @keydown.space.prevent="selectValue(opt.value)"
      >
        <span v-if="opt.color" class="of-field-select__badge" :style="{ background: opt.color }">
          {{ opt.label }}
        </span>
        <span v-else>{{ opt.label }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.of-field-select {
  width: 100%;
  min-height: 28px;
  padding: var(--of-spacing-0_5) var(--of-spacing-1_5);
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
  border: none;
  background: transparent;
  text-align: left;
}

.of-field-select:focus-visible,
.of-field-select__option:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-field-select--standalone {
  justify-content: flex-start;
}

.of-field-select__display {
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary, var(--of-color-text-primary));
}

.of-field-select__dropdown {
  position: fixed;
  z-index: var(--of-z-toast);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  border: 1px solid var(--of-border-subtle, var(--of-border-strong));
  border-radius: var(--of-radius-lg);
  box-shadow: var(--of-shadow-dropdown);
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
}

.of-field-select__option {
  min-height: 30px;
  padding: var(--of-spacing-1_5) var(--of-spacing-2_5);
  font-size: var(--of-font-size-base);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.of-field-select__option:hover,
.of-field-select__option.active {
  background: var(--of-surface-selected, var(--of-color-bg-hover));
}

.of-field-select__option.selected {
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-text-primary));
}

.of-field-select__option--clear {
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-border-light));
}

.of-field-select__badge {
  display: inline-block;
  padding: 1px var(--of-spacing-1_5);
  border-radius: var(--of-radius-md);
  font-size: var(--of-font-size-sm);
  color: var(--of-color-text-inverse);
  line-height: 18px;
}

/* Mobile bottom-sheet mode — higher specificity to override base dropdown */
.of-field-select .of-field-select__dropdown--sheet {
  position: fixed;
  top: auto;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-height: 50dvh;
  border-radius: var(--of-radius-2xl) var(--of-radius-2xl) 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.of-field-select__dropdown--sheet .of-field-select__option {
  min-height: 44px;
  font-size: var(--of-font-size-lg);
  padding: var(--of-spacing-3) var(--of-spacing-4);
}

@media (max-width: 768px), (pointer: coarse) {
  .of-field-select {
    min-height: 44px;
    font-size: var(--of-font-size-lg);
    padding: var(--of-spacing-2) var(--of-spacing-3);
  }
}
</style>
