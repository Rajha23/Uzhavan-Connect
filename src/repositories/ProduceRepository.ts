import { ProduceListing } from '../types';
import { apiService } from '../services/apiService';
import { addToSyncQueue, generateClientRequestId } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';

export const ProduceRepository = {
  createProduceListing: async (listingData: Omit<ProduceListing, 'id' | 'status'>) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // We add it to the sync queue immediately.
    // If online, the sync manager will process it quickly.
    const payloadWithQuality = {
      ...listingData,
      qualityRecord: {
        status: 'SELF_DECLARED',
        confidence: 'LOW',
        grade: listingData.grade || 'STANDARD',
        hasSeriousDefect: false,
        versions: [],
        auditLog: [{
          action: 'BATCH_CREATED',
          userId: listingData.farmerId,
          role: 'FARMER',
          previousStatus: null,
          newStatus: 'SELF_DECLARED',
          timestamp: new Date().toISOString()
        }]
      }
    };

    const record = await addToSyncQueue({
      action_type: 'CREATE_PRODUCE' as any,
      entity_type: 'ProduceListing',
      payload: payloadWithQuality,
      client_request_id: generateClientRequestId()
    });

    if (isOnline) {
      // Trigger sync manually to ensure fast processing
      syncManager.syncAll();
    }

    return record;
  },
  
  getProduceListings: async (filterCrop?: string) => {
    // For read operations, if we're offline we might want to return cached.
    // Assuming apiService has its own cache logic or we fetch direct
    return apiService.getProduceListings(filterCrop);
  }
};
