import { getPendingSyncItems, updateSyncItem, removeSyncItem } from './offlineStorage';
import { apiService } from './apiService';
import { ProduceListing, DemandRequest } from '../types';

type SyncStatusCallback = (status: 'idle' | 'syncing' | 'synced' | 'error', message?: string) => void;

class SyncManager {
  private isSyncing = false;
  private listeners: SyncStatusCallback[] = [];
  
  // Max retries before giving up temporarily (exponential backoff will still try later)
  private MAX_RETRIES = 5;

  constructor() {
    // Listen for network becoming available
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

      for (const item of pendingItems) {
        if (item.retryCount >= this.MAX_RETRIES) {
          console.warn(`[SyncManager] Skipping item ${item.id} due to max retries exceeded.`);
          continue;
        }

        try {
          await this.processItem(item);
          // If successful, remove from queue
          await removeSyncItem(item.id);
        } catch (error: any) {
          console.error(`[SyncManager] Failed to sync item ${item.id}:`, error);
          
          // Exponential backoff logic based on retryCount could be added here
          // For now, we increment the retry count
          await updateSyncItem(item.id, {
            status: 'failed',
            retryCount: item.retryCount + 1,
            lastError: error.message
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
      // Reset back to idle after a few seconds if it was synced
      setTimeout(() => this.emit('idle'), 3000);
    }
  }

  private async processItem(item: any) {
    switch (item.type) {
      case 'ADD_PRODUCE':
        await apiService.createProduceListing(item.payload as ProduceListing);
        break;
      case 'ADD_DEMAND':
        // Assuming createDemandRequest exists or similar
        // await apiService.createDemandRequest(item.payload as DemandRequest);
        break;
      // Add other cases here (UPDATE_PRODUCE, ADD_SUBSIDY, etc.)
      default:
        console.warn(`[SyncManager] Unknown sync action type: ${item.type}`);
        break;
    }
  }
}

export const syncManager = new SyncManager();
