type StorageDriver = {
  getString(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
};

const memoryStore = new Map<string, string>();

function createFallbackDriver(): StorageDriver {
  return {
    delete(key) {
      memoryStore.delete(key);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    },
    getString(key) {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
      return memoryStore.get(key) ?? null;
    },
    set(key, value) {
      memoryStore.set(key, value);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    }
  };
}

// This boundary is intentionally MMKV-shaped so native storage can be swapped in
// without rewriting the app session layer.
export const storage = createFallbackDriver();
