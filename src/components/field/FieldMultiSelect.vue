<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
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

const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref({ top: "0px", left: "0px", width: "0px" });
const isOpen = ref(false);

const { isStandalone, currentValue, resolvedLabel, resolvedDisabled } = useFieldBase({
  props,
  focusRef: triggerRef,
});
const options = useFieldOptions(props);
const draftValues = ref<string[]>([]);
const activeIndex = ref(0);

const selectedOptions = computed(() => {
  const set = new Set(draftValues.value);
  return options.value.filter((opt) => set.has(opt.value));
});

function initDraft() {
  draftValues.value = Array.isArray(currentValue.value)
    ? currentValue.value.filter((v): v is string => typeof v === "string")
    : [];
}

function updateDropdownPosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 220)}px`,
  };
}

function toggleValue(optValue: string) {
  const idx = draftValues.value.indexOf(optValue);
  if (idx >= 0) {
    draftValues.value = draftValues.value.filter((v) => v !== optValue);
    return;
  }
  draftValues.value = [...draftValues.value, optValue];
}

function commitAndClose() {
  isOpen.value = false;
  const value = [...draftValues.value];
  emit("commit", value);
  if (isStandalone.value) {
    emit("update:modelValue", value);
  }
}

function cancelAndClose() {
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
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, Math.max(options.value.length - 1, 0));
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    return;
  }
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    const current = options.value[activeIndex.value];
    if (current) toggleValue(current.value);
    return;
  }
  if (e.key === "Escape") {
    e.preventDefault();
    cancelAndClose();
    return;
  }
  if (e.key === "Tab") {
    e.preventDefault();
    commitAndClose();
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
  commitAndClose();
}

onMounted(() => {
  initDraft();
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

watch(
  currentValue,
  () => {
    initDraft();
  },
);
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
        class="of-field-multiselect"
        :aria-label="resolvedLabel"
        :disabled="resolvedDisabled"
        @click="onTriggerClick"
        @keydown="onKeydown"
      >
        <div v-if="selectedOptions.length" class="of-field-multiselect__chips">
          <span
            v-for="opt in selectedOptions"
            :key="opt.value"
            class="of-field-multiselect__badge"
            :style="opt.color ? { background: opt.color } : undefined"
          >
            {{ opt.label }}
          </span>
        </div>
        <span v-else class="of-field-multiselect__placeholder">—</span>
      </button>
  </FieldWrapper>

  <button
    v-else
    ref="triggerRef"
    type="button"
    class="of-field-multiselect"
    aria-label="多选字段编辑器"
    @keydown="onKeydown"
  >
    <div v-if="selectedOptions.length" class="of-field-multiselect__chips">
      <span
        v-for="opt in selectedOptions"
        :key="opt.value"
        class="of-field-multiselect__badge"
        :style="opt.color ? { background: opt.color } : undefined"
      >
        {{ opt.label }}
      </span>
    </div>
    <span v-else class="of-field-multiselect__placeholder">—</span>
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="of-field-multiselect__dropdown"
      :style="dropdownStyle"
    >
      <button
        v-for="(opt, i) in options"
        :key="opt.value"
        type="button"
        class="of-field-multiselect__option"
        role="checkbox"
        :aria-checked="draftValues.includes(opt.value)"
        :class="{ active: i === activeIndex, selected: draftValues.includes(opt.value) }"
        @mouseenter="activeIndex = i"
        @click.stop="toggleValue(opt.value)"
        @focusin="activeIndex = i"
        @keydown.enter.prevent="toggleValue(opt.value)"
        @keydown.space.prevent="toggleValue(opt.value)"
      >
        <span
          class="of-field-multiselect__checkbox"
          :class="{ 'of-field-multiselect__checkbox--checked': draftValues.includes(opt.value) }"
          aria-hidden="true"
        />
        <span
          v-if="opt.color"
          class="of-field-multiselect__badge"
          :style="{ background: opt.color }"
          >{{ opt.label }}</span>
        <span v-else>{{ opt.label }}</span>
      </button>
      <div class="of-field-multiselect__actions">
        <button class="of-field-multiselect__btn" type="button" @click.stop="cancelAndClose">
          取消
        </button>
        <button
          class="of-field-multiselect__btn of-field-multiselect__btn--primary"
          type="button"
          @click.stop="commitAndClose"
        >
          完成
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.of-field-multiselect {
  width: 100%;
  min-height: 28px;
  padding: var(--of-spacing-0_5) var(--of-spacing-1_5);
  display: flex;
  align-items: center;
  outline: none;
  border: none;
  background: transparent;
  text-align: left;
}

.of-field-multiselect:focus-visible,
.of-field-multiselect__option:focus-visible,
.of-field-multiselect__btn:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-field-multiselect__chips {
  display: flex;
  gap: var(--of-spacing-1);
  flex-wrap: wrap;
}

.of-field-multiselect__placeholder {
  font-size: var(--of-font-size-base);
  color: var(--of-text-tertiary, var(--of-color-text-tertiary));
}

.of-field-multiselect__dropdown {
  position: fixed;
  z-index: var(--of-z-toast);
  background: var(--of-surface-elevated, var(--of-surface-panel));
  border: 1px solid var(--of-border-subtle, var(--of-border-strong));
  border-radius: var(--of-radius-lg);
  box-shadow: var(--of-shadow-dropdown);
  overflow: hidden;
}

.of-field-multiselect__option {
  min-height: 30px;
  padding: var(--of-spacing-1_5) var(--of-spacing-2_5);
  font-size: var(--of-font-size-base);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
}

.of-field-multiselect__checkbox {
  width: 14px;
  height: 14px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-300));
  border-radius: var(--of-radius-sm);
  flex-shrink: 0;
  box-sizing: border-box;
  background: var(--of-surface-elevated, var(--of-color-bg-canvas));
}

.of-field-multiselect__checkbox--checked {
  background: var(--of-accent-default, var(--of-text-strong));
  border-color: var(--of-accent-default, var(--of-text-strong));
  box-shadow: inset 0 0 0 2px var(--of-surface-elevated, var(--of-surface-panel));
}

.of-field-multiselect__option:hover,
.of-field-multiselect__option.active {
  background: var(--of-surface-selected, var(--of-color-bg-hover));
}

.of-field-multiselect__option.selected {
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-text-primary, #1a1a1a));
}

.of-field-multiselect__checkbox {
  margin: 0;
  pointer-events: none;
}

.of-field-multiselect__badge {
  display: inline-block;
  padding: 1px var(--of-spacing-1_5);
  border-radius: var(--of-radius-md);
  font-size: var(--of-font-size-sm);
  color: var(--of-color-text-inverse);
  line-height: 18px;
  background: var(--of-accent-default, var(--of-text-strong));
}

.of-field-multiselect__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--of-spacing-2);
  border-top: 1px solid var(--of-border-subtle, var(--of-color-border-light));
  padding: var(--of-spacing-2);
}

.of-field-multiselect__btn {
  border: 1px solid var(--of-border-subtle, var(--of-border-strong));
  background: var(--of-surface-elevated, var(--of-surface-panel));
  border-radius: var(--of-radius-md);
  font-size: var(--of-font-size-sm);
  padding: var(--of-spacing-0_75) var(--of-spacing-2_5);
  cursor: pointer;
}

.of-field-multiselect__btn--primary {
  border-color: var(--of-accent-default, var(--of-text-strong));
  background: var(--of-accent-default, var(--of-text-strong));
  color: var(--of-color-text-inverse);
}
</style>
