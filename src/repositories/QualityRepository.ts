import { addToSyncQueue, generateClientRequestId } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';
import { 
  QualityChecklistResult, 
  QualitySampleObservation,
  QualityVerificationStatus,
  BuyerConfirmation
} from '../types/quality';

export const QualityRepository = {
  verifyCollection: async (
    batchId: string, 
    userId: string,
    observation: QualitySampleObservation, 
    checklist: QualityChecklistResult,
    calculatedResult: ReturnType<typeof import('../services/qualityEngine').calculateQualityScore>
  ) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const payload = {
      batchId,
      userId,
      observation,
      checklist,
      calculatedResult,
      timestamp: new Date().toISOString()
    };

    const record = await addToSyncQueue({
      action_type: 'VERIFY_QUALITY' as any,
      entity_type: 'ProduceListing', // or QualityRecord
      payload,
      client_request_id: generateClientRequestId()
    });

    if (isOnline) {
      syncManager.syncAll();
    }
    return record;
  },

  buyerConfirm: async (
    batchId: string,
    userId: string,
    confirmation: BuyerConfirmation
  ) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const record = await addToSyncQueue({
      action_type: 'BUYER_CONFIRM_QUALITY' as any,
      entity_type: 'WorkflowOrder',
      payload: {
        batchId,
        userId,
        confirmation
      },
      client_request_id: generateClientRequestId()
    });

    if (isOnline) {
      syncManager.syncAll();
    }
    return record;
  }
};
