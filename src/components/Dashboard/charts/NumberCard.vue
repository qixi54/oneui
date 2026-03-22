<script setup lang="ts">
import { computed } from "vue";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-vue-next";

interface Props {
  title?: string;
  value?: number;
  unit?: string;
  compare?: string;
  trend?: "up" | "down";
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Metric",
  value: 0,
  unit: "",
  compare: "",
  trend: undefined,
  color: "var(--of-accent-strong)",
});

const displayValue = computed(() => {
  if (props.value >= 10000) return `${(props.value / 10000).toFixed(1)}w${props.unit}`;
  return `${props.value}${props.unit}`;
});
</script>

<template>
  <div class="of-number-card">
    <p class="of-number-card__title">{{ title }}</p>
    <div class="of-number-card__value-row">
      <p class="of-number-card__value" :style="{ color }">{{ displayValue }}</p>
      <TrendingUpIcon v-if="trend === 'up'" class="of-number-card__trend up" :size="16" />
      <TrendingDownIcon
        v-else-if="trend === 'down'"
        class="of-number-card__trend down"
        :size="16"
      />
    </div>
    <p v-if="compare" class="of-number-card__compare">环比 {{ compare }}</p>
  </div>
</template>

<style scoped>
.of-number-card {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border: 1px solid var(--of-border-workspace);
  border-radius: var(--of-radius-xl);
  background:
    linear-gradient(145deg, var(--of-surface-panel), var(--of-surface-workspace-raised)),
    var(--of-surface-workspace-raised);
  box-shadow: var(--of-elevation-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.of-number-card__title {
  margin: 0;
  font-size: 13px;
  color: var(--of-text-secondary);
}

.of-number-card__value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.of-number-card__value {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.of-number-card__trend.up {
  color: var(--of-color-success);
}

.of-number-card__trend.down {
  color: var(--of-color-error);
}

.of-number-card__compare {
  margin: 0;
  font-size: 12px;
  color: var(--of-text-tertiary);
}
</style>
