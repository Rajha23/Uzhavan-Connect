import { getPendingSyncItems, updateSyncItem, removeSyncItem, SyncRecord } from './offlineStorage';
import { apiService } from './apiService';
import { ProduceListing, DemandRequest } from '../types';

type SyncStatusCallback = (status: 'idle' | 'syncing' | 'synced' | 'error', message?: string) => void;

class SyncManager {
  private isSyncing = false;
  private listeners: SyncStatusCallback[] = [];
  
  // Exponential Backoff base settings
  private MAX_RETRIES = 5;
  private RETRY_DELAYS = [5000, 15000, 30000, 60000, 300000]; // 5s, 15s, 30s, 1m, 5m

  constructor() {
    // Note: The global online listener was moved to NetworkContext, but we can keep a failsafe here
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncManager] Network online. Triggering sync...');
        this.syncAll();
      });
    }
  }

  public subscribe(callback: SyncStatusCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private emit(status: 'idle' | 'syncing' | 'synced' | 'error', message?: string) {
    this.listeners.forEach(cb => cb(status, message));
  }

  public async syncAll() {
    if (this.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isSyncing = true;
    this.emit('syncing');

    try {
      const pendingItems = await getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        this.emit('idle');
        this.isSyncing = false;
        return;
      }

      console.log(`[SyncManager] Found ${pendingItems.length} items to sync.`);

      // Sort items by creation time to preserve chronological ordering
      pendingItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (const item of pendingItems) {
        if (item.retry_count >= this.MAX_RETRIES) {
          console.warn(`[SyncManager] Skipping item ${item.client_request_id} due to max retries exceeded.`);
          continue;
        }

        // Exponential backoff check
        if (item.status === 'FAILED' && item.last_attempt_at) {
          const delay = this.RETRY_DELAYS[item.retry_count] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
          const timeSinceLastAttempt = Date.now() - new Date(item.last_attempt_at).getTime();
          if (timeSinceLastAttempt < delay) {
            console.log(`[SyncManager] Waiting for backoff on ${item.client_request_id} (needs ${delay}ms, passed ${timeSinceLastAttempt}ms)`);
            continue;
          }
        }

        try {
          await updateSyncItem(item.client_request_id, {
            status: 'SYNCING',
            last_attempt_at: new Date().toISOString()
          });

          await this.processItem(item);
          
          // IMPORTANT: If successful, we update it to SYNCED instead of deleting it immediately
          // (Or remove it safely depending on business rules)
          await updateSyncItem(item.client_request_id, {
            status: 'SYNCED',
            synced_at: new Date().toISOString()
          });
          // After syncing, we can optionally remove it from the queue if the local database already synced the canonical state
          await removeSyncItem(item.client_request_id);

        } catch (error: any) {
          console.error(`[SyncManager] Failed to sync item ${item.client_request_id}:`, error);
          
          await updateSyncItem(item.client_request_id, {
            status: 'FAILED',
            retry_count: item.retry_count + 1,
            error_message: error.message
          });
        }
      }

      // Check if any items are still pending
      const remainingItems = await getPendingSyncItems();
      if (remainingItems.length === 0) {
        this.emit('synced', 'All offline data synchronized successfully.');
      } else {
        this.emit('error', 'Some items failed to synchronize. Will retry later.');
      }
      
    } catch (error) {
      console.error('[SyncManager] Critical error during sync cycle:', error);
      this.emit('error', 'Synchronization failed due to a critical error.');
    } finally {
      this.isSyncing = false;
      setTimeout(() => this.emit('idle'), 3000);
    }
  }

  private async processItem(item: SyncRecord) {
    // For idempotency, we pass client_request_id to the API. 
    // The apiService must be updated to accept and handle this.
    switch (item.action_type) {
      case 'CREATE_PRODUCE':
        await apiService.createProduceListing({
          ...item.payload,
          client_request_id: item.client_request_id
        });
        break;
      case 'CREATE_ORDER':
        await apiService.createOrder({
          ...item.payload,
          client_request_id: item.client_request_id
        });
        break;
      case 'ADD_DEMAND':
        await apiService.createDemandRequest({
          ...item.payload,
          client_request_id: item.client_request_id
        });
        break;
      default:
        console.warn(`[SyncManager] Unknown sync action type: ${item.action_type}`);
        break;
    }
  }
}

export const syncManager = new SyncManager();
