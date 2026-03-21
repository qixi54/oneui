<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

type ChartType = "bar" | "pie" | "doughnut" | "number-card" | "table";

type DashboardWidgetData = Record<string, unknown> | unknown[];

interface DashboardWidget {
  id: string;
  type: ChartType;
  title?: string;
  data?: DashboardWidgetData;
  config?: Record<string, unknown>;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    widgets?: DashboardWidget[];
    columns?: number;
    gap?: number;
  }>(),
  {
    title: "Dashboard",
    widgets: () => [],
    columns: 4,
    gap: 16,
  },
);

const chartMap = {
  bar: defineAsyncComponent(() => import("./charts/BarChart.vue")),
  pie: defineAsyncComponent(() => import("./charts/PieChart.vue")),
  doughnut: defineAsyncComponent(() => import("./charts/DoughnutChart.vue")),
  "number-card": defineAsyncComponent(() => import("./charts/NumberCard.vue")),
  table: defineAsyncComponent(() => import("./charts/TableChart.vue")),
};

const dashboardRef = ref<HTMLElement | null>(null);
const dashboardWidth = ref(0);
let resizeObserver: ResizeObserver | null = null;

const resolvedColumns = computed(() => Math.max(1, Math.floor(props.columns)));

const responsiveColumns = computed(() => {
  const width = dashboardWidth.value;
  const base = resolvedColumns.value;
  if (!width) return base;
  if (width < 560) return 1;
  if (width < 840) return Math.min(base, 2);
  if (width < 1120) return Math.min(base, 3);
  return base;
});

const layoutStyle = computed(() => ({
  "--dashboard-columns": String(responsiveColumns.value),
  gap: `${props.gap}px`,
}));

function updateDashboardWidth(entry?: ResizeObserverEntry) {
  if (entry) {
    dashboardWidth.value = Math.round(entry.contentRect.width);
    return;
  }
  dashboardWidth.value = Math.round(dashboardRef.value?.getBoundingClientRect().width ?? 0);
}

onMounted(() => {
  updateDashboardWidth();
  if (typeof ResizeObserver === "undefined" || !dashboardRef.value) return;
  resizeObserver = new ResizeObserver((entries) => {
    if (entries[0]) updateDashboardWidth(entries[0]);
  });
  resizeObserver.observe(dashboardRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

function resolveWidgetStyle(widget: DashboardWidget) {
  const maxSpan = responsiveColumns.value;
  return {
    gridColumn: `span ${Math.min(widget.colSpan ?? 1, maxSpan)}`,
    gridRow: `span ${widget.rowSpan ?? 1}`,
  };
}

const fallbackWidgets = computed<DashboardWidget[]>(() => {
  if (props.widgets.length > 0) return props.widgets;
  return [
    {
      id: "metric-1",
      type: "number-card",
      title: "总任务",
      data: { value: 128, trend: "up", compare: "+12%" },
      colSpan: 1,
    },
    {
      id: "metric-2",
      type: "number-card",
      title: "已完成",
      data: { value: 84, trend: "up", compare: "+8%" },
      colSpan: 1,
    },
    {
      id: "bar-1",
      type: "bar",
      title: "周趋势",
      data: [12, 17, 14, 20, 23, 16, 19],
      colSpan: 2,
    },
    {
      id: "pie-1",
      type: "pie",
      title: "状态分布",
      data: [
        { name: "Todo", value: 34 },
        { name: "In Progress", value: 52 },
        { name: "Done", value: 42 },
      ],
      colSpan: 2,
    },
    {
      id: "table-1",
      type: "table",
      title: "关键任务",
      data: {
        columns: [
          { key: "name", label: "任务" },
          { key: "owner", label: "负责人" },
          { key: "status", label: "状态" },
        ],
        rows: [
          { name: "Migrate Dashboard", owner: "FE", status: "In Progress" },
          { name: "Type Definition", owner: "FE", status: "Done" },
          { name: "Integrate RichText", owner: "FE", status: "Todo" },
        ],
      },
      colSpan: 4,
    },
  ];
});
</script>

<template>
  <section ref="dashboardRef" class="of-dashboard">
    <header class="of-dashboard__header">
      <h3 class="of-dashboard__title">{{ title }}</h3>
    </header>

    <div class="of-dashboard__grid" :style="layoutStyle">
      <article
        v-for="widget in fallbackWidgets"
        :key="widget.id"
        class="of-dashboard__item"
        :style="resolveWidgetStyle(widget)"
      >
        <component
          :is="chartMap[widget.type]"
          :title="widget.title"
          :data="widget.data"
          v-bind="widget.config ?? {}"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.of-dashboard {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  container-type: inline-size;
  background: var(--of-surface-workspace, var(--of-surface-elevated, var(--of-color-bg-elevated)));
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-100)));
  border-radius: var(--of-radius-2xl, var(--of-radius-xl));
  padding: 16px;
  box-sizing: border-box;
}

.of-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.of-dashboard__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--of-text-primary, var(--of-color-text));
}

.of-dashboard__grid {
  display: grid;
  align-items: stretch;
  grid-template-columns: repeat(var(--dashboard-columns, 4), minmax(0, 1fr));
  grid-auto-rows: minmax(220px, auto);
}

.of-dashboard__item {
  min-height: 220px;
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-100)));
  border-radius: var(--of-radius-xl);
  background: var(--of-surface-workspace-raised, var(--of-surface-elevated, var(--of-color-bg-elevated)));
  box-shadow: var(--of-card-shadow, var(--of-shadow-card));
  padding: 14px;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.of-dashboard__item:hover {
  transform: translateY(-1px);
  border-color: var(--of-row-action-border, var(--of-border-strong, var(--of-color-gray-300)));
  box-shadow: var(--of-card-shadow-hover, var(--of-shadow-card-hover));
  background: var(--of-surface-workspace-strong, var(--of-surface-elevated, var(--of-color-bg-elevated)));
}

@media (max-width: 960px) {
  .of-dashboard__item {
    grid-column: span 1;
  }
}
</style>
