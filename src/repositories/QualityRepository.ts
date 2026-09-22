import { addToSyncQueue } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';
import { 
  QualityChecklistResult, 
  QualitySampleObservation,
  QualityScore,
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
      action_type: 'VERIFY_QUALITY',
      entity_type: 'ProduceListing', // or QualityRecord
      payload
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
      action_type: 'BUYER_CONFIRM_QUALITY',
      entity_type: 'WorkflowOrder',
      payload: {
        batchId,
        userId,
        confirmation
      }
    });

    if (isOnline) {
      syncManager.syncAll();
    }
    return record;
  }
};
