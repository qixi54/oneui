<script setup lang="ts">
import { ref } from "vue";
import { Download } from "lucide-vue-next";
import type { TableColumn } from "../../types";

const props = withDefaults(
  defineProps<{
    data: Record<string, unknown>[];
    columns: TableColumn[];
    filename?: string;
    label?: string;
    disabled?: boolean;
    size?: "sm" | "md";
  }>(),
  {
    filename: "export",
    label: "导出 Excel",
    size: "md",
  },
);

const loading = ref(false);

async function handleExport() {
  if (loading.value || props.disabled || !props.data.length) return;
  loading.value = true;
  try {
    // 动态加载 xlsx（调用方需安装：npm install xlsx）
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const XLSX = await import(/* @vite-ignore */ "xlsx").catch(() => {
      throw new Error("请先安装 xlsx 包：npm install xlsx");
    });

    // 构建表头行
    const headers = props.columns.map((c) => c.label);
    const keys = props.columns.map((c) => c.key);

    // 构建数据行
    const rows = props.data.map((row) => keys.map((k) => row[k] ?? ""));

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // 设置列宽（最小 10，按内容估算）
    ws["!cols"] = props.columns.map((col) => ({
      wch: Math.max(10, col.label.length * 2, 20),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${props.filename}.xlsx`);
  } catch (e) {
    console.error("[ExcelExport]", e);
    alert((e as Error).message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <button
    class="of-excel-export"
    :class="[size, { loading, disabled: disabled || !data.length }]"
    :disabled="disabled || !data.length || loading"
    @click="handleExport"
  >
    <Download
      :size="size === 'sm' ? 13 : 15"
      class="of-excel-export__icon"
      :class="{ spinning: loading }"
    />
    <span>{{ loading ? "导出中..." : label }}</span>
  </button>
</template>

<style scoped>
.of-excel-export {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--of-color-gray-700);
  background: #fff;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-md);
  padding: 6px 12px;
  cursor: pointer;
  transition: var(--of-transition-fast);
  white-space: nowrap;
}

.of-excel-export.sm {
  font-size: 12px !important;
  padding: 4px 10px;
}

.of-excel-export:hover:not(.disabled) {
  background: var(--of-color-gray-50);
  border-color: var(--of-color-gray-300);
  color: var(--of-color-gray-800);
}

.of-excel-export.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.of-excel-export.loading {
  pointer-events: none;
  opacity: 0.7;
}

.of-excel-export__icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.of-excel-export__icon.spinning {
  animation: spin 1s linear infinite;
}
</style>
