import { ref, readonly, onUnmounted, type Ref } from "vue";
import type { WorkerRequest, WorkerResponse } from "../workers/tableWorker";
import tableWorkerSource from "../workers/tableWorkerSource.js?raw";

/** Threshold: only use worker when data exceeds this count */
const WORKER_THRESHOLD = 5000;

export interface UseWorkerSortOptions {
  /** Whether to enable worker offloading (default: auto based on threshold) */
  enabled?: Ref<boolean>;
}

export function useWorkerSort<T extends Record<string, unknown>>(
  options: UseWorkerSortOptions = {},
) {
  const processing = ref(false);
  let worker: Worker | null = null;
  let workerUrl: string | null = null;

  function getWorker(): Worker | null {
    if (worker) return worker;
    try {
      workerUrl = URL.createObjectURL(
        new Blob([tableWorkerSource], {
          type: "text/javascript;charset=utf-8",
        }),
      );
      worker = new Worker(workerUrl, {
        type: "module",
      });
      return worker;
    } catch {
      // Worker not available (SSR, test env, etc.)
      return null;
    }
  }

  function shouldUseWorker(dataLength: number): boolean {
    if (options.enabled?.value === false) return false;
    return dataLength >= WORKER_THRESHOLD;
  }

  function requestSort(data: T[], field: string, order: "asc" | "desc"): Promise<T[]> {
    if (!shouldUseWorker(data.length)) {
      // Synchronous fallback
      return Promise.resolve(
        [...data].sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (typeof av === "number" && typeof bv === "number") {
            return order === "asc" ? av - bv : bv - av;
          }
          return order === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
        }),
      );
    }

    const w = getWorker();
    if (!w) return Promise.resolve([...data]);

    processing.value = true;
    return new Promise<T[]>((resolve) => {
      const handler = (e: MessageEvent<WorkerResponse>) => {
        w.removeEventListener("message", handler);
        processing.value = false;
        if (e.data.type === "sort-result") {
          resolve(e.data.data as T[]);
        } else {
          resolve([...data]); // fallback on error
        }
      };
      w.addEventListener("message", handler);
      w.postMessage({ type: "sort", data, field, order } satisfies WorkerRequest);
    });
  }

  function requestFilter(
    data: T[],
    conditions: Array<{ field: string; operator: string; value: string }>,
    logic: "and" | "or" = "and",
  ): Promise<T[]> {
    if (!shouldUseWorker(data.length)) {
      // Synchronous fallback — delegate to caller's existing filter logic
      return Promise.resolve(data);
    }

    const w = getWorker();
    if (!w) return Promise.resolve(data);

    processing.value = true;
    return new Promise<T[]>((resolve) => {
      const handler = (e: MessageEvent<WorkerResponse>) => {
        w.removeEventListener("message", handler);
        processing.value = false;
        if (e.data.type === "filter-result") {
          resolve(e.data.data as T[]);
        } else {
          resolve(data); // fallback on error
        }
      };
      w.addEventListener("message", handler);
      w.postMessage({ type: "filter", data, conditions, logic } satisfies WorkerRequest);
    });
  }

  onUnmounted(() => {
    worker?.terminate();
    worker = null;
    if (workerUrl) {
      URL.revokeObjectURL(workerUrl);
      workerUrl = null;
    }
  });

  return {
    requestSort,
    requestFilter,
    processing: readonly(processing),
  };
}
