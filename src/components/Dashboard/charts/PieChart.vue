<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";

interface PieDatum {
  name: string;
  value: number;
}

interface Props {
  title?: string;
  data?: PieDatum[];
  colors?: string[];
  doughnut?: boolean;
  showLegend?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  data: () => [
    { name: "Todo", value: 12 },
    { name: "In Progress", value: 9 },
    { name: "Done", value: 18 },
  ],
  colors: () => ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"],
  doughnut: false,
  showLegend: true,
});

const chartRef = ref<HTMLElement | null>(null);
let chart: any = null;
let observer: ResizeObserver | null = null;

const render = () => {
  if (!chartRef.value) return;
  if (!chart) chart = echarts.init(chartRef.value);

  chart.setOption({
    color: props.colors,
    title: props.title ? { text: props.title, left: "center", textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    tooltip: { trigger: "item" },
    legend: props.showLegend ? { bottom: 0 } : undefined,
    series: [
      {
        type: "pie",
        radius: props.doughnut ? ["45%", "70%"] : "65%",
        center: ["50%", props.showLegend ? "45%" : "50%"],
        data: props.data,
        label: { formatter: "{b}: {d}%" },
      },
    ],
  });
};

onMounted(() => {
  render();
  if (chartRef.value) {
    observer = new ResizeObserver(() => chart?.resize());
    observer.observe(chartRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  chart?.dispose();
});

watch(() => [props.title, props.data, props.colors, props.doughnut, props.showLegend], render, {
  deep: true,
});
</script>

<template>
  <div class="of-dashboard-chart">
    <div ref="chartRef" class="of-dashboard-chart__canvas" />
  </div>
</template>

<style scoped>
.of-dashboard-chart,
.of-dashboard-chart__canvas {
  width: 100%;
  height: 100%;
  min-height: 220px;
}
</style>
