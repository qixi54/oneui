import {
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from "vue";
import type {
  DatabaseViewResolvedDetailPresentation,
  DatabaseViewWorkspacePreferences,
} from "../contracts/database";

export const DATABASE_DETAIL_VIEW_ID = "detail";
export const DATABASE_MOBILE_BREAKPOINT = "(max-width: 768px)";
export const DATABASE_WORKSPACE_STORAGE_PREFIX = "oneui-database-workspace:";
export const DEFAULT_SIDE_PANEL_WIDTH = 720;
export const DEFAULT_DRAWER_WIDTH = 900;
export const MIN_DETAIL_PANEL_WIDTH = 420;
export const MAX_DETAIL_PANEL_WIDTH = 1320;

export function clampWorkspaceWidth(width: number, fallback: number): number {
  if (!Number.isFinite(width)) return fallback;
  return Math.max(MIN_DETAIL_PANEL_WIDTH, Math.min(MAX_DETAIL_PANEL_WIDTH, width));
}

export function getWorkspaceStorageKey(tableId?: string): string | null {
  const normalized = (tableId ?? "").trim();
  return normalized ? `${DATABASE_WORKSPACE_STORAGE_PREFIX}${normalized}` : null;
}

export function readWorkspacePreferences(tableId?: string): DatabaseViewWorkspacePreferences {
  const storageKey = getWorkspaceStorageKey(tableId);
  if (!storageKey || typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as DatabaseViewWorkspacePreferences;
  } catch {
    return {};
  }
}

export function writeWorkspacePreferences(
  tableId: string | undefined,
  prefs: DatabaseViewWorkspacePreferences,
) {
  const storageKey = getWorkspaceStorageKey(tableId);
  if (!storageKey || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(prefs));
  } catch {
    // ignore storage failures
  }
}

export function useDatabaseViewport(mediaQuery = DATABASE_MOBILE_BREAKPOINT) {
  const isMobileViewport = ref(false);
  let mobileMediaQuery: MediaQueryList | null = null;

  function syncMobileViewport() {
    isMobileViewport.value = mobileMediaQuery?.matches ?? false;
  }

  onMounted(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    mobileMediaQuery = window.matchMedia(mediaQuery);
    syncMobileViewport();
    mobileMediaQuery.addEventListener("change", syncMobileViewport);
  });

  onBeforeUnmount(() => {
    mobileMediaQuery?.removeEventListener("change", syncMobileViewport);
    mobileMediaQuery = null;
  });

  return {
    isMobileViewport,
  };
}

interface UseDatabaseWorkspaceStateOptions {
  tableId: Readonly<Ref<string | undefined>>;
  activeViewId: Readonly<Ref<string>>;
  initialSearchKeyword?: string;
  initialDetailPresentation?: DatabaseViewResolvedDetailPresentation | null;
  initialSidePanelWidth?: number;
  initialDrawerWidth?: number;
}

export function useDatabaseWorkspaceState(options: UseDatabaseWorkspaceStateOptions) {
  const preferredDetailPresentation = ref<DatabaseViewResolvedDetailPresentation | null>(
    options.initialDetailPresentation ?? null,
  );
  const sidePanelWidth = ref(
    clampWorkspaceWidth(options.initialSidePanelWidth ?? DEFAULT_SIDE_PANEL_WIDTH, DEFAULT_SIDE_PANEL_WIDTH),
  );
  const drawerWidth = ref(
    clampWorkspaceWidth(options.initialDrawerWidth ?? DEFAULT_DRAWER_WIDTH, DEFAULT_DRAWER_WIDTH),
  );
  const searchKeyword = ref(options.initialSearchKeyword ?? "");

  watch(
    [
      options.activeViewId,
      searchKeyword,
      preferredDetailPresentation,
      sidePanelWidth,
      drawerWidth,
    ],
    ([nextViewId, nextSearchKeyword, nextDetailPresentation, nextSidePanelWidth, nextDrawerWidth]) => {
      writeWorkspacePreferences(options.tableId.value, {
        activeViewId: nextViewId,
        searchKeyword: nextSearchKeyword,
        detailPresentation: nextDetailPresentation ?? undefined,
        sidePanelWidth: nextSidePanelWidth,
        drawerWidth: nextDrawerWidth,
      });
    },
    { immediate: true },
  );

  return {
    preferredDetailPresentation,
    sidePanelWidth,
    drawerWidth,
    searchKeyword,
  };
}
