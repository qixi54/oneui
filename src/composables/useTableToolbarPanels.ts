import { nextTick, onMounted, onUnmounted, ref, type Ref } from "vue";

export type TableToolbarPanelKey = "filter" | "sort" | "group" | "column";

type PanelStyle = Record<string, string>;
type ButtonRefMap = Record<TableToolbarPanelKey, Ref<HTMLElement | null>>;

export function calcToolbarDropdownStyle(el: HTMLElement | null): PanelStyle {
  if (!el) return {};
  const rect = el.getBoundingClientRect();
  return {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
  };
}

export function useTableToolbarPanels(buttonRefs: ButtonRefMap) {
  const showFilterPanel = ref(false);
  const showSortPanel = ref(false);
  const showGroupPanel = ref(false);
  const showColumnPanel = ref(false);

  const filterDropdownStyle = ref<PanelStyle>({});
  const sortDropdownStyle = ref<PanelStyle>({});
  const groupDropdownStyle = ref<PanelStyle>({});
  const columnDropdownStyle = ref<PanelStyle>({});

  const panelState = {
    filter: { show: showFilterPanel, style: filterDropdownStyle },
    sort: { show: showSortPanel, style: sortDropdownStyle },
    group: { show: showGroupPanel, style: groupDropdownStyle },
    column: { show: showColumnPanel, style: columnDropdownStyle },
  } as const;

  function closeAllPanels() {
    showFilterPanel.value = false;
    showSortPanel.value = false;
    showGroupPanel.value = false;
    showColumnPanel.value = false;
  }

  function togglePanel(panel: TableToolbarPanelKey) {
    (Object.keys(panelState) as TableToolbarPanelKey[]).forEach((key) => {
      if (key !== panel) {
        panelState[key].show.value = false;
      }
    });

    const target = panelState[panel];
    target.show.value = !target.show.value;

    if (target.show.value) {
      nextTick(() => {
        target.style.value = calcToolbarDropdownStyle(buttonRefs[panel].value);
      });
    }
  }

  function closePanel(panel: TableToolbarPanelKey) {
    panelState[panel].show.value = false;
  }

  function handleGlobalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.closest(".of-table-toolbar__btn-group") &&
      !target.closest(".of-table-toolbar__dropdown")
    ) {
      closeAllPanels();
    }
  }

  onMounted(() => document.addEventListener("click", handleGlobalClick, true));
  onUnmounted(() => document.removeEventListener("click", handleGlobalClick, true));

  return {
    showFilterPanel,
    showSortPanel,
    showGroupPanel,
    showColumnPanel,
    filterDropdownStyle,
    sortDropdownStyle,
    groupDropdownStyle,
    columnDropdownStyle,
    togglePanel,
    closePanel,
    closeAllPanels,
  };
}
