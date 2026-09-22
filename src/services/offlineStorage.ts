/**
 * Uzhavan Connect — Offline Storage Service
 * Uses localStorage as a fallback (no external 'idb' dependency required).
 * Provides sync queue and cached data operations for offline-first operation.
 */

export type SyncActionType =
  | 'CREATE_PRODUCE'
  | 'UPDATE_PRODUCE'
  | 'CREATE_ORDER'
  | 'UPDATE_ORDER'
  | 'ADD_DEMAND'
  | 'UPDATE_PROFILE';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface SyncRecord {
  id: string;
  client_request_id: string;
  action_type: SyncActionType;
  entity_type: string;
  payload: any;
  status: SyncStatus;
  retry_count: number;
  created_at: string;
  updated_at: string;
  last_attempt_at: string | null;
  synced_at: string | null;
  error_message: string | null;
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

export function generateClientRequestId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

// ── Sync Queue Operations ─────────────────────────────────────────────────────

export const initDB = async () => {
  return Promise.resolve();
};

export const addToSyncQueue = async (
  record: Omit<SyncRecord, 'id' | 'status' | 'retry_count' | 'created_at' | 'updated_at' | 'last_attempt_at' | 'synced_at' | 'error_message'>
): Promise<SyncRecord> => {
  const fullRecord: SyncRecord = {
    ...record,
    id: generateClientRequestId(),
    status: 'PENDING',
    retry_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_attempt_at: null,
    synced_at: null,
    error_message: null
  };
  const queue = readJSON<SyncRecord[]>(SYNC_QUEUE_KEY, []);
  queue.push(fullRecord);
  writeJSON(SYNC_QUEUE_KEY, queue);
  return fullRecord;
};

export const getPendingSyncItems = async (): Promise<SyncRecord[]> => {
  const queue = readJSON<SyncRecord[]>(SYNC_QUEUE_KEY, []);
  return queue.filter((item) => item.status === 'PENDING' || item.status === 'FAILED');
};

export const getSyncItemByRequestId = async (client_request_id: string): Promise<SyncRecord | undefined> => {
  const queue = readJSON<SyncRecord[]>(SYNC_QUEUE_KEY, []);
  return queue.find((item) => item.client_request_id === client_request_id);
};

export const updateSyncItem = async (
  client_request_id: string,
  updates: Partial<SyncRecord>
): Promise<void> => {
  const queue = readJSON<SyncRecord[]>(SYNC_QUEUE_KEY, []);
  const idx = queue.findIndex((item) => item.client_request_id === client_request_id);
  if (idx !== -1) {
    queue[idx] = { 
      ...queue[idx], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    writeJSON(SYNC_QUEUE_KEY, queue);
  }
};

// IMPORTANT: Do not blindly delete records. Only mark them as SYNCED unless explicitly discarding.
export const removeSyncItem = async (client_request_id: string): Promise<void> => {
  const queue = readJSON<SyncRecord[]>(SYNC_QUEUE_KEY, []);
  writeJSON(
    SYNC_QUEUE_KEY,
    queue.filter((item) => item.client_request_id !== client_request_id)
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
