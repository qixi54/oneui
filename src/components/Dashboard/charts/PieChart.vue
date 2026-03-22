<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { echarts, type EChartsType } from "../../../utils/echarts";

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
  colors: () => [
    "var(--of-chart-series-1)",
    "var(--of-chart-series-2)",
    "var(--of-chart-series-3)",
    "var(--of-chart-series-4)",
    "var(--of-chart-series-5)",
  ],
  doughnut: false,
  showLegend: true,
});

const chartRef = ref<HTMLElement | null>(null);
let chart: EChartsType | null = null;
let observer: ResizeObserver | null = null;

function resolveColor(value: string): string {
  if (typeof window === "undefined" || !value.startsWith("var(")) return value;
  const token = value.slice(4, -1).trim();
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || value;
}

const render = () => {
  if (!chartRef.value) return;
  if (!chart) chart = echarts.init(chartRef.value);
  const palette = props.colors.map(resolveColor);

  chart.setOption({
    color: palette,
    title: props.title
      ? {
          text: props.title,
          left: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: 600,
            color: resolveColor("var(--of-text-primary)"),
          },
        }
      : undefined,
    tooltip: { trigger: "item" },
    legend: props.showLegend
      ? { bottom: 0, textStyle: { color: resolveColor("var(--of-text-secondary)") } }
      : undefined,
    series: [
      {
        type: "pie",
        radius: props.doughnut ? ["45%", "70%"] : "65%",
        center: ["50%", props.showLegend ? "45%" : "50%"],
        data: props.data,
        label: { formatter: "{b}: {d}%" },
        itemStyle: {
          borderColor: resolveColor("var(--of-surface-workspace-raised)"),
          borderWidth: 2,
        },
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
