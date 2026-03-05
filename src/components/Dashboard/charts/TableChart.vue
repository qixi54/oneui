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
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align ?? 'left' }"
            >
              {{ row[col.key] ?? '-' }}
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
  gap: 10px;
}

.of-table-chart__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--of-color-text);
}

.of-table-chart__wrapper {
  overflow: auto;
  border: 1px solid var(--of-color-gray-100);
  border-radius: var(--of-radius-md);
}

.of-table-chart__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.of-table-chart__table th,
.of-table-chart__table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--of-color-gray-100);
  white-space: nowrap;
}

.of-table-chart__table th {
  background: var(--of-color-gray-50);
  color: var(--of-color-text-secondary);
  font-weight: 600;
}
</style>
