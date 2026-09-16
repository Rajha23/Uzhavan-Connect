import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type SyncActionType = 
  | 'ADD_PRODUCE'
  | 'UPDATE_PRODUCE'
  | 'ADD_SUBSIDY'
  | 'UPDATE_PROFILE'
  | 'ADD_DEMAND';

export interface SyncQueueItem {
  id: string; // Unique client-side ID (UUID)
  type: SyncActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}

interface UzhavanOfflineDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-status': string; 'by-timestamp': number };
  };
  produceListings: {
    key: string;
    value: any; // We'll store full objects here for offline read
  };
  subsidies: {
    key: string;
    value: any;
  };
  demands: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'uzhavan-offline-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<UzhavanOfflineDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<UzhavanOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncQueueStore.createIndex('by-status', 'status');
          syncQueueStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('produceListings')) {
          db.createObjectStore('produceListings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('subsidies')) {
          db.createObjectStore('subsidies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('demands')) {
          db.createObjectStore('demands', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// -- Sync Queue Operations --

export const addToSyncQueue = async (item: Omit<SyncQueueItem, 'status' | 'retryCount' | 'timestamp'>) => {
  const db = await initDB();
  const fullItem: SyncQueueItem = {
    ...item,
    status: 'pending',
    retryCount: 0,
    timestamp: Date.now()
  };
  await db.put('syncQueue', fullItem);
  return fullItem;
};

export const getPendingSyncItems = async () => {
  const db = await initDB();
  const allItems = await db.getAllFromIndex('syncQueue', 'by-timestamp');
  return allItems.filter(item => item.status === 'pending' || item.status === 'failed');
};

export const updateSyncItem = async (id: string, updates: Partial<SyncQueueItem>) => {
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const item = await tx.store.get(id);
  if (item) {
    await tx.store.put({ ...item, ...updates });
  }
  await tx.done;
};

export const removeSyncItem = async (id: string) => {
  const db = await initDB();
  await db.delete('syncQueue', id);
};

// -- Cached Data Operations --

export const saveProduceListingsLocally = async (listings: any[]) => {
  const db = await initDB();
  const tx = db.transaction('produceListings', 'readwrite');
  // Clear old and insert new to prevent stale data buildup, or just upsert
  await tx.store.clear(); 
  for (const item of listings) {
    await tx.store.put(item);
  }
  await tx.done;
};

export const getLocalProduceListings = async () => {
  const db = await initDB();
  return db.getAll('produceListings');
};

export const saveLocalProduceListing = async (listing: any) => {
  const db = await initDB();
  await db.put('produceListings', listing);
};

export const deleteLocalProduceListing = async (id: string) => {
  const db = await initDB();
  await db.delete('produceListings', id);
};
