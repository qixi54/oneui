<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

const props = defineProps<{
  icon: string | Component;
  iconColor?: "blue" | "green" | "orange" | "red" | "purple";
  value: string | number;
  label: string;
}>();

/**
 * StatisticCard 组件 - 统计卡片
 *
 * 用于在仪表板中展示统计数据
 *
 * @example
 * <StatisticCard
 *   icon="database"
 *   icon-color="blue"
 *   value="1,234"
 *   label="知识库数量"
 * />
 */

defineOptions({ inheritAttrs: false });

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: {
    bg: "var(--of-surface-muted)",
    text: "var(--of-accent-default)",
  },
  green: {
    bg: "var(--of-surface-panel)",
    text: "var(--of-text-strong)",
  },
  orange: {
    bg: "var(--of-surface-selected)",
    text: "var(--of-accent-strong)",
  },
  red: {
    bg: "var(--of-surface-muted)",
    text: "var(--of-text-primary)",
  },
  purple: {
    bg: "var(--of-surface-panel)",
    text: "var(--of-text-secondary)",
  },
};

const colorClass = computed(() => {
  const color = props.iconColor || "blue";
  return colorMap[color] || colorMap.blue;
});
</script>

<template>
  <div class="of-statistic-card" v-bind="$attrs">
    <div class="of-statistic-card__icon-container" :style="{ backgroundColor: colorClass.bg }">
      <component
        :is="resolveIcon(icon)"
        class="of-statistic-card__icon"
        :style="{ color: colorClass.text }"
      />
    </div>
    <div class="of-statistic-card__content">
      <p class="of-statistic-card__value">{{ value }}</p>
      <p class="of-statistic-card__label">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.of-statistic-card {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-4);
  padding: var(--of-spacing-4);
  background: var(--of-surface-elevated, var(--of-color-bg-canvas));
  border: 1px solid var(--of-border-subtle);
  border-radius: var(--of-radius-lg);
}

.of-statistic-card__icon-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--of-radius-md);
  flex-shrink: 0;
}

.of-statistic-card__icon {
  width: 24px;
  height: 24px;
}

.of-statistic-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.of-statistic-card__value {
  font-size: 18px;
  font-weight: 700;
  color: var(--of-color-text);
  margin: 0;
  padding: 0;
}

.of-statistic-card__label {
  font-size: 12px;
  color: var(--of-color-text-secondary);
  margin: 0;
  padding: 0;
}
</style>
