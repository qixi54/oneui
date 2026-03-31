<script setup lang="ts">
import { ref } from "vue";
import { ChevronDownIcon } from "lucide-vue-next";
import PropRow from "./PropRow.vue";
import type { PropItem } from "../../types";

const props = withDefaults(
  defineProps<{
    items: PropItem[];
    title?: string;
    collapsible?: boolean;
  }>(),
  {
    title: "属性",
    collapsible: false,
  },
);

const collapsed = ref(false);

function toggleCollapse() {
  if (props.collapsible) {
    collapsed.value = !collapsed.value;
  }
}
</script>

<template>
  <div class="prop-panel">
    <!-- 标题行 -->
    <component
      :is="collapsible ? 'button' : 'div'"
      class="prop-panel__header"
      :class="{ 'prop-panel__header--collapsible': collapsible }"
      :type="collapsible ? 'button' : undefined"
      @click="toggleCollapse"
    >
      <span class="prop-panel__title">{{ title }}</span>
      <ChevronDownIcon
        v-if="collapsible"
        class="prop-panel__chevron"
        :class="{ 'prop-panel__chevron--up': !collapsed }"
        :size="14"
      />
    </component>

    <!-- 属性列表 -->
    <div v-show="!collapsed" class="prop-panel__body">
      <PropRow
        v-for="item in items"
        :key="item.key"
        :prop-key="item.key"
        :type="item.type"
        :value="item.value"
        :status-color-map="item.statusColorMap"
        :priority-color-map="item.priorityColorMap"
        :custom-color-map="item.customColorMap"
        :value-color="item.valueColor"
        :value-bg="item.valueBg"
        :dot-color="item.dotColor"
      />

      <!-- 额外内容插槽 -->
      <div v-if="$slots.extra" class="prop-panel__extra">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.prop-panel {
  width: 100%;
  max-width: 320px;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-lg);
  padding: var(--of-spacing-5);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.prop-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--of-spacing-4);
}

.prop-panel__header--collapsible {
  cursor: pointer;
  user-select: none;
}

.prop-panel__header--collapsible:hover .prop-panel__title {
  color: var(--of-color-gray-900);
}

.prop-panel__title {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-gray-700);
  transition: var(--of-transition-fast);
}

.prop-panel__chevron {
  color: var(--of-color-gray-400);
  transition: transform 0.2s ease;
  transform: rotate(-90deg);
  flex-shrink: 0;
}

.prop-panel__chevron--up {
  transform: rotate(0deg);
}

.prop-panel__body {
  display: flex;
  flex-direction: column;
}

.prop-panel__extra {
  margin-top: var(--of-spacing-3);
  padding-top: var(--of-spacing-3);
  border-top: 1px solid var(--of-color-gray-100);
}
</style>
