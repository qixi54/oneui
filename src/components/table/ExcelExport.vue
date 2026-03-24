<script setup lang="ts">
import { ref } from "vue";
import { Download } from "lucide-vue-next";
import type { TableColumn } from "../../types";

interface XlsxModuleLike {
  utils: {
    aoa_to_sheet(data: unknown[][]): Record<string, unknown>;
    book_new(): Record<string, unknown>;
    book_append_sheet(
      workbook: Record<string, unknown>,
      worksheet: Record<string, unknown>,
      name: string,
    ): void;
  };
  writeFile(workbook: Record<string, unknown>, filename: string): void;
}

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
const loadOptionalModule = new Function(
  "moduleName",
  "return import(moduleName)",
) as (moduleName: string) => Promise<unknown>;

async function handleExport() {
  if (loading.value || props.disabled || !props.data.length) return;
  loading.value = true;
  try {
    // 动态加载 xlsx（调用方需安装：npm install xlsx）
    const XLSX = (await loadOptionalModule("xlsx").catch(() => {
      throw new Error("请先安装 xlsx 包：npm install xlsx");
    })) as XlsxModuleLike;

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
  gap: var(--of-spacing-1_5);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-primary, var(--of-color-gray-700));
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-md);
  padding: var(--of-spacing-1_5) var(--of-spacing-3);
  cursor: pointer;
  transition: var(--of-transition-fast);
  white-space: nowrap;
}

.of-excel-export.sm {
  font-size: var(--of-font-size-sm);
  padding: var(--of-spacing-1) var(--of-spacing-2_5);
}

.of-excel-export:hover:not(.disabled) {
  background: var(--of-surface-muted, var(--of-color-gray-50));
  border-color: var(--of-border-strong, var(--of-color-gray-300));
  color: var(--of-text-primary, var(--of-color-gray-800));
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
