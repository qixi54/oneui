<script setup lang="ts">
interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface RowData {
  id?: string | number;
  [key: string]: string | number | undefined;
}

interface Props {
  title?: string;
  columns?: Column[];
  rows?: RowData[];
}

withDefaults(defineProps<Props>(), {
  title: "",
  columns: () => [
    { key: "name", label: "Name" },
    { key: "status", label: "Status", align: "center" },
    { key: "value", label: "Value", align: "right" },
  ],
  rows: () => [
    { id: 1, name: "Alpha", status: "In Progress", value: 120 },
    { id: 2, name: "Beta", status: "Done", value: 86 },
    { id: 3, name: "Gamma", status: "Todo", value: 42 },
  ],
});
</script>

<template>
  <div class="of-table-chart">
    <p v-if="title" class="of-table-chart__title">{{ title }}</p>
    <div class="of-table-chart__wrapper">
      <table class="of-table-chart__table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="{ textAlign: col.align ?? 'left' }">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.id ?? idx">
            <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align ?? 'left' }">
              {{ row[col.key] ?? "-" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.of-table-chart {
  width: 100%;
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2_5);
}

.of-table-chart__title {
  margin: 0;
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary);
}

.of-table-chart__wrapper {
  overflow: auto;
  border: 1px solid var(--of-border-workspace);
  border-radius: var(--of-radius-lg);
  background: var(--of-surface-card);
  box-shadow: var(--of-elevation-panel);
}

.of-table-chart__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--of-font-size-sm);
}

.of-table-chart__table th,
.of-table-chart__table td {
  padding: var(--of-spacing-2_5) var(--of-spacing-3);
  border-bottom: 1px solid var(--of-border-divider);
  white-space: nowrap;
}

.of-table-chart__table th {
  background: var(--of-surface-muted);
  color: var(--of-text-secondary);
  font-weight: var(--of-font-weight-semibold);
}
</style>
