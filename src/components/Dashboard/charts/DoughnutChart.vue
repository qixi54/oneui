<script setup lang="ts">
import PieChart from "./PieChart.vue";

interface PieDatum {
  name: string;
  value: number;
}

defineProps<{
  title?: string;
  data?: PieDatum[];
  colors?: string[];
  showLegend?: boolean;
}>();
</script>

<template>
  <PieChart :title="title" :data="data" :colors="colors" :show-legend="showLegend" doughnut />
</template>
