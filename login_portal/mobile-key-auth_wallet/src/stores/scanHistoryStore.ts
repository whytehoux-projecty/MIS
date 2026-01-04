import { create } from "zustand";
import { STORAGE_KEYS } from "@/constants/config";
import { deleteSecureItem, getSecureItem, setSecureItem } from "@/services/storage/secureStorage";

export type ScanHistoryEntry = {
  id: string;
  createdAt: number;
  serviceName: string | null;
  outcome: "success" | "failure";
  detail?: string;
};

type ScanHistoryState = {
  isHydrated: boolean;
  entries: ScanHistoryEntry[];
  hydrate: () => Promise<void>;
  addEntry: (entry: Omit<ScanHistoryEntry, "id" | "createdAt">) => Promise<void>;
  clear: () => Promise<void>;
};

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeEntries(value: unknown): ScanHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "object" && v !== null)
    .map((v) => v as ScanHistoryEntry)
    .filter(
      (v) =>
        typeof v.id === "string" &&
        typeof v.createdAt === "number" &&
        (v.outcome === "success" || v.outcome === "failure")
    );
}

export const useScanHistoryStore = create<ScanHistoryState>((set, get) => ({
  isHydrated: false,
  entries: [],
  hydrate: async () => {
    if (get().isHydrated) return;
    const json = await getSecureItem(STORAGE_KEYS.SCAN_HISTORY);
    if (!json) {
      set({ isHydrated: true, entries: [] });
      return;
    }
    try {
      const parsed = JSON.parse(json) as unknown;
      set({ isHydrated: true, entries: normalizeEntries(parsed) });
    } catch {
      set({ isHydrated: true, entries: [] });
    }
  },
  addEntry: async (entry) => {
    const next: ScanHistoryEntry = {
      id: makeId(),
      createdAt: Date.now(),
      serviceName: entry.serviceName ?? null,
      outcome: entry.outcome,
      detail: entry.detail,
    };
    const current = get().entries;
    const updated = [next, ...current].slice(0, 50);
    set({ entries: updated });
    await setSecureItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(updated));
  },
  clear: async () => {
    await deleteSecureItem(STORAGE_KEYS.SCAN_HISTORY);
    set({ entries: [] });
  },
}));

