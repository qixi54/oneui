<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { echarts, type EChartsType } from "../../../utils/echarts";

interface Props {
  title?: string;
  xAxisData?: string[];
  seriesName?: string;
  data?: number[];
  colors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  xAxisData: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  seriesName: "Value",
  data: () => [120, 200, 150, 80, 70, 110, 130],
  colors: () => ["var(--of-chart-series-1)"],
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
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 12, right: 12, top: props.title ? 42 : 16, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: props.xAxisData,
      axisLabel: { color: resolveColor("var(--of-text-tertiary)") },
      axisLine: { lineStyle: { color: resolveColor("var(--of-border-workspace)") } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: resolveColor("var(--of-text-tertiary)") },
      splitLine: { lineStyle: { color: resolveColor("var(--of-border-divider)") } },
    },
    series: [
      {
        name: props.seriesName,
        type: "bar",
        barMaxWidth: 36,
        data: props.data,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
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

watch(() => [props.title, props.xAxisData, props.seriesName, props.data, props.colors], render, {
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
