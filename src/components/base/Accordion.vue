<script setup lang="ts">
import { computed } from "vue";

export interface AccordionItem {
  key: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  modelValue?: string | string[];
  multiple?: boolean;
  lazy?: boolean;
}

const props = withDefaults(defineProps<AccordionProps>(), {
  modelValue: undefined,
  multiple: false,
  lazy: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | string[]];
}>();

defineSlots<{
  default?: (props: { item: AccordionItem }) => unknown;
  trigger?: (props: { item: AccordionItem; open: boolean }) => unknown;
}>();

const openKeys = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue;
  }

  if (typeof props.modelValue === "string" && props.modelValue.length > 0) {
    return [props.modelValue];
  }

  return [];
});

function isOpen(key: string) {
  return openKeys.value.includes(key);
}

function toggleItem(item: AccordionItem) {
  if (item.disabled) {
    return;
  }

  const opened = isOpen(item.key);

  if (props.multiple) {
    emit(
      "update:modelValue",
      opened
        ? openKeys.value.filter((key) => key !== item.key)
        : [...openKeys.value, item.key],
    );
    return;
  }

  emit("update:modelValue", opened ? "" : item.key);
}
</script>

<template>
  <div class="of-accordion">
    <section
      v-for="item in items"
      :key="item.key"
      class="of-accordion__item"
      :class="{
        'of-accordion__item--open': isOpen(item.key),
        'of-accordion__item--disabled': item.disabled,
      }"
    >
      <button
        type="button"
        class="of-accordion__trigger"
        :disabled="item.disabled"
        :aria-expanded="isOpen(item.key)"
        :aria-controls="`of-accordion-panel-${item.key}`"
        @click="toggleItem(item)"
      >
        <slot name="trigger" :item="item" :open="isOpen(item.key)">
          <span class="of-accordion__trigger-text">
            <span class="of-accordion__title">{{ item.title }}</span>
            <span v-if="item.subtitle" class="of-accordion__subtitle">
              {{ item.subtitle }}
            </span>
          </span>
        </slot>
        <span class="of-accordion__icon" aria-hidden="true">
          {{ isOpen(item.key) ? "▲" : "▼" }}
        </span>
      </button>

      <div
        v-if="lazy ? isOpen(item.key) : true"
        v-show="lazy ? true : isOpen(item.key)"
        :id="`of-accordion-panel-${item.key}`"
        class="of-accordion__panel"
      >
        <slot :item="item" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.of-accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.of-accordion__item {
  border: 1px solid var(--of-color-gray-200, #e5e7eb);
  border-radius: 12px;
  background: var(--of-color-bg-elevated, #ffffff);
  overflow: hidden;
}

.of-accordion__item--disabled {
  opacity: 0.6;
}

.of-accordion__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.of-accordion__trigger:disabled {
  cursor: not-allowed;
}

.of-accordion__trigger-text {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.of-accordion__title {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--of-color-text, #111827);
}

.of-accordion__subtitle {
  font-size: 12px;
  line-height: 1.5;
  color: var(--of-color-text-secondary, #6b7280);
}

.of-accordion__icon {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1;
  color: var(--of-color-text-secondary, #6b7280);
}

.of-accordion__panel {
  padding: 0 18px 18px;
}
</style>
