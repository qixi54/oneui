<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

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

const layoutStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
  gap: `${props.gap}px`,
}));

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
  <section class="of-dashboard">
    <header class="of-dashboard__header">
      <h3 class="of-dashboard__title">{{ title }}</h3>
    </header>

    <div class="of-dashboard__grid" :style="layoutStyle">
      <article
        v-for="widget in fallbackWidgets"
        :key="widget.id"
        class="of-dashboard__item"
        :style="{
          gridColumn: `span ${widget.colSpan ?? 1}`,
          gridRow: `span ${widget.rowSpan ?? 1}`,
        }"
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
}

.of-dashboard__item {
  min-height: 220px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-100));
  border-radius: var(--of-radius-xl);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  box-shadow: var(--of-card-shadow, var(--of-shadow-card));
  padding: 14px;
}

@media (max-width: 960px) {
  .of-dashboard__grid {
    grid-template-columns: 1fr;
  }

  .of-dashboard__item {
    grid-column: span 1;
  }
}
</style>
