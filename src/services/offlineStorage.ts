/**
 * Uzhavan Connect — Offline Storage Service
 * Uses localStorage as a fallback (no external 'idb' dependency required).
 * Provides sync queue and cached data operations for offline-first operation.
 */

export type SyncActionType =
  | 'ADD_PRODUCE'
  | 'UPDATE_PRODUCE'
  | 'ADD_SUBSIDY'
  | 'UPDATE_PROFILE'
  | 'ADD_DEMAND';

export interface SyncQueueItem {
  id: string;
  type: SyncActionType;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}

const SYNC_QUEUE_KEY = 'uzhavan_offline_sync_queue';
const PRODUCE_LISTINGS_KEY = 'uzhavan_offline_produce_listings';

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[offlineStorage] Failed to write to localStorage', err);
  }
}

// ── Sync Queue Operations ─────────────────────────────────────────────────────

export const initDB = async () => {
  // No-op — we use localStorage, no IndexedDB init required
  return Promise.resolve();
};

export const addToSyncQueue = async (
  item: Omit<SyncQueueItem, 'status' | 'retryCount' | 'timestamp'>
): Promise<SyncQueueItem> => {
  const fullItem: SyncQueueItem = {
    ...item,
    status: 'pending',
    retryCount: 0,
    timestamp: Date.now(),
  };
  const queue = readJSON<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
  queue.push(fullItem);
  writeJSON(SYNC_QUEUE_KEY, queue);
  return fullItem;
};

export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  const queue = readJSON<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
  return queue.filter((item) => item.status === 'pending' || item.status === 'failed');
};

export const updateSyncItem = async (
  id: string,
  updates: Partial<SyncQueueItem>
): Promise<void> => {
  const queue = readJSON<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
  const idx = queue.findIndex((item) => item.id === id);
  if (idx !== -1) {
    queue[idx] = { ...queue[idx], ...updates };
    writeJSON(SYNC_QUEUE_KEY, queue);
  }
};

export const removeSyncItem = async (id: string): Promise<void> => {
  const queue = readJSON<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
  writeJSON(
    SYNC_QUEUE_KEY,
    queue.filter((item) => item.id !== id)
  );
};

// ── Cached Data Operations ────────────────────────────────────────────────────

export const saveProduceListingsLocally = async (listings: unknown[]): Promise<void> => {
  writeJSON(PRODUCE_LISTINGS_KEY, listings);
};

export const getLocalProduceListings = async (): Promise<unknown[]> => {
  return readJSON<unknown[]>(PRODUCE_LISTINGS_KEY, []);
};

export const saveLocalProduceListing = async (listing: { id: string }): Promise<void> => {
  const listings = readJSON<{ id: string }[]>(PRODUCE_LISTINGS_KEY, []);
  const idx = listings.findIndex((l) => l.id === listing.id);
  if (idx !== -1) {
    listings[idx] = listing;
  } else {
    listings.push(listing);
  }
  writeJSON(PRODUCE_LISTINGS_KEY, listings);
};

export const deleteLocalProduceListing = async (id: string): Promise<void> => {
  const listings = readJSON<{ id: string }[]>(PRODUCE_LISTINGS_KEY, []);
  writeJSON(
    PRODUCE_LISTINGS_KEY,
    listings.filter((l) => l.id !== id)
  );
};
