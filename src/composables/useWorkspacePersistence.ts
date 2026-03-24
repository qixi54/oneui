import { computed, ref } from "vue";
import type { WorkspacePersistenceSnapshot } from "../types";

export interface WorkspacePersistenceBackend {
  load: (workspaceId: string) => Promise<WorkspacePersistenceSnapshot | null>;
  save: (workspaceId: string, snapshot: WorkspacePersistenceSnapshot) => Promise<void>;
  clear: (workspaceId: string) => Promise<void>;
}

export interface UseWorkspacePersistenceOptions {
  workspaceId: string;
  backend?: WorkspacePersistenceBackend;
  initialSnapshot?: WorkspacePersistenceSnapshot;
  autoLoad?: boolean;
  autoSave?: boolean;
}

const STORAGE_PREFIX = "oneui-workspace:";

function createLocalStorageBackend(): WorkspacePersistenceBackend {
  return {
    async load(workspaceId: string) {
      try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${workspaceId}`);
        return raw ? (JSON.parse(raw) as WorkspacePersistenceSnapshot) : null;
      } catch {
        return null;
      }
    },
    async save(workspaceId: string, snapshot: WorkspacePersistenceSnapshot) {
      localStorage.setItem(`${STORAGE_PREFIX}${workspaceId}`, JSON.stringify(snapshot));
    },
    async clear(workspaceId: string) {
      localStorage.removeItem(`${STORAGE_PREFIX}${workspaceId}`);
    },
  };
}

export function useWorkspacePersistence(options: UseWorkspacePersistenceOptions) {
  const backend = options.backend ?? createLocalStorageBackend();
  const snapshot = ref<WorkspacePersistenceSnapshot>({
    ...(options.initialSnapshot ?? {}),
  });
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const hydrated = ref(false);
  const autoSave = options.autoSave !== false;

  const storageKey = computed(() => options.workspaceId.trim());

  async function hydrate() {
    if (!storageKey.value) return;
    loading.value = true;
    error.value = null;
    try {
      const loaded = await backend.load(storageKey.value);
      if (loaded) {
        snapshot.value = { ...snapshot.value, ...loaded };
      }
    } catch (err) {
      error.value = err as Error;
    } finally {
      hydrated.value = true;
      loading.value = false;
    }
  }

  async function save(next?: Partial<WorkspacePersistenceSnapshot>) {
    if (!storageKey.value) return;
    const merged = { ...snapshot.value, ...(next ?? {}) };
    snapshot.value = merged;
    try {
      await backend.save(storageKey.value, merged);
    } catch (err) {
      error.value = err as Error;
    }
  }

  async function clear() {
    if (!storageKey.value) return;
    snapshot.value = { ...(options.initialSnapshot ?? {}) };
    try {
      await backend.clear(storageKey.value);
    } catch (err) {
      error.value = err as Error;
    }
  }

  function patch(next: Partial<WorkspacePersistenceSnapshot>) {
    snapshot.value = { ...snapshot.value, ...next };
    if (autoSave) {
      void save();
    }
  }

  if (options.autoLoad !== false) {
    void hydrate();
  }

  return {
    snapshot,
    loading,
    error,
    hydrated,
    hydrate,
    save,
    patch,
    clear,
  };
}
