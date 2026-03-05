<script setup lang="ts">
import { computed } from "vue";
import type { ColorMap } from "../../types";
import {
  DEFAULT_PRIORITY_MAP,
  DEFAULT_STATUS_MAP,
  resolveBadge,
  mergeColorMap,
} from "../../composables/useBadge";

const props = withDefaults(
  defineProps<{
    /** 属性名称 */
    propKey: string;
    /** 属性值（原始字符串，显示 label 由 colorMap 决定） */
    value: string;
    /**
     * 渲染类型：
     * - 'status'    使用 statusColorMap 渲染彩色徽章
     * - 'priority'  使用 priorityColorMap 渲染彩色徽章
     * - 'badge'     使用 customColorMap 渲染自定义徽章
     * - 'date'      纯文字，不加徽章
     * - 'text'      纯文字，不加徽章（默认）
     */
    type?: "status" | "priority" | "badge" | "date" | "text";
    /**
     * 状态颜色映射（type='status' 时使用），与内置默认合并
     */
    statusColorMap?: ColorMap;
    /**
     * 优先级颜色映射（type='priority' 时使用），与内置默认合并
     */
    priorityColorMap?: ColorMap;
    /**
     * 自定义颜色映射（type='badge' 时使用），完全由外部控制
     */
    customColorMap?: ColorMap;
    /**
     * 直接指定徽章文字颜色（不使用 colorMap 时）
     */
    valueColor?: string;
    /**
     * 直接指定徽章背景色（不使用 colorMap 时）
     */
    valueBg?: string;
    /**
     * 直接指定圆点颜色（存在则显示圆点）
     */
    dotColor?: string;
  }>(),
  {
    type: "text",
  },
);

const isPlainText = computed(() => !props.type || props.type === "date" || props.type === "text");

const resolved = computed(() => {
  if (isPlainText.value) return null;

  if (props.type === "status") {
    return resolveBadge(props.value, mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap));
  }
  if (props.type === "priority") {
    return resolveBadge(props.value, mergeColorMap(DEFAULT_PRIORITY_MAP, props.priorityColorMap));
  }
  if (props.type === "badge" && props.customColorMap) {
    return resolveBadge(props.value, props.customColorMap);
  }
  // 直接使用传入的 valueColor / valueBg
  return null;
});

const badgeStyle = computed(() => {
  if (resolved.value) return resolved.value.style;
  return {
    color: props.valueColor ?? "var(--of-color-gray-700)",
    background: props.valueBg ?? "var(--of-color-gray-100)",
  };
});

const badgeLabel = computed(() => resolved.value?.label ?? props.value);

const dotColor = computed(() => resolved.value?.dot ?? props.dotColor);
const showDot = computed(() => !!dotColor.value);
</script>

<template>
  <div class="prop-row">
    <span class="prop-row__key">{{ propKey }}</span>
    <div class="prop-row__value-area">
      <!-- 纯文字 (date / text) -->
      <span v-if="isPlainText" class="prop-row__plain-text">{{ value }}</span>

      <!-- 徽章 -->
      <span v-else class="prop-row__badge" :style="badgeStyle">
        <span v-if="showDot" class="prop-row__dot" :style="{ backgroundColor: dotColor }" />
        {{ badgeLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.prop-row {
  width: 100%;
  padding: 8px 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--of-color-gray-100);
}
.prop-row:last-child {
  border-bottom: none;
}

.prop-row__key {
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: var(--of-color-gray-500) !important;
  width: 80px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prop-row__value-area {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.prop-row__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 8px;
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prop-row__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.prop-row__plain-text {
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  color: var(--of-color-gray-700) !important;
  line-height: 1.5;
}
</style>
