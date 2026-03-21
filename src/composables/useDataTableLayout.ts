import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties, type Ref } from "vue";
import type { Density } from "../types";
import { TABLE_DENSITY_METRICS } from "../types/data-table";

export function useDataTableLayout(params: {
  tableContainerRef: Ref<HTMLElement | null>;
  density: Ref<Density>;
  containerResponsive: Ref<boolean>;
  isMobile: Ref<boolean>;
}) {
  const { tableContainerRef, density, containerResponsive, isMobile } = params;
  const tableContainerWidth = ref(0);
  let tableResizeObserver: ResizeObserver | null = null;

  function syncTableContainerWidth() {
    tableContainerWidth.value = tableContainerRef.value?.clientWidth ?? 0;
  }

  onMounted(() => {
    syncTableContainerWidth();
    if (typeof ResizeObserver === "undefined" || !tableContainerRef.value) return;
    tableResizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      tableContainerWidth.value = entry.contentRect.width;
    });
    tableResizeObserver.observe(tableContainerRef.value);
  });

  onBeforeUnmount(() => {
    tableResizeObserver?.disconnect();
    tableResizeObserver = null;
  });

  const containerDensity = computed<Density>(() => {
    if (!containerResponsive.value || isMobile.value) {
      return density.value;
    }
    if (tableContainerWidth.value > 0 && tableContainerWidth.value <= 860) {
      return "compact";
    }
    if (tableContainerWidth.value > 0 && tableContainerWidth.value <= 1080 && density.value === "comfortable") {
      return "standard";
    }
    return density.value;
  });

  const densityMetrics = computed(() => TABLE_DENSITY_METRICS[containerDensity.value]);
  const densityClass = computed(() => `of-data-table--${containerDensity.value}`);
  const containerWidthClass = computed(() => {
    if (tableContainerWidth.value > 0 && tableContainerWidth.value <= 860) {
      return "of-data-table--container-tight";
    }
    if (tableContainerWidth.value > 0 && tableContainerWidth.value <= 1080) {
      return "of-data-table--container-medium";
    }
    return "of-data-table--container-wide";
  });
  const densityStyle = computed<CSSProperties>(() => ({
    "--of-data-table-group-row-height": `${densityMetrics.value.groupRowHeight}px`,
    "--of-data-table-mobile-card-padding-x": `${densityMetrics.value.mobileCardPaddingX}px`,
    "--of-data-table-mobile-card-padding-y": `${densityMetrics.value.mobileCardPaddingY}px`,
    "--of-data-table-new-row-padding-x": `${densityMetrics.value.mobileCardPaddingX}px`,
    "--of-data-table-new-row-padding-y": `${densityMetrics.value.mobileCardPaddingY}px`,
    "--of-data-table-fill-min-width": `${densityMetrics.value.fillMinWidth}px`,
  }));

  return {
    tableContainerWidth,
    containerDensity,
    densityMetrics,
    densityClass,
    containerWidthClass,
    densityStyle,
    syncTableContainerWidth,
  };
}
