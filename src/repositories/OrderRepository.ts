import { apiService } from '../services/apiService';
import { addToSyncQueue, generateClientRequestId } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';

export const OrderRepository = {
  createOrder: async (orderData: any) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const record = await addToSyncQueue({
      action_type: 'CREATE_ORDER' as any,
      entity_type: 'Order',
      payload: orderData,
      client_request_id: generateClientRequestId()
    });

    if (isOnline) {
      syncManager.syncAll();
    }

    return record;
  },

  createDemandRequest: async (demandData: any) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const record = await addToSyncQueue({
      action_type: 'ADD_DEMAND' as any,
      entity_type: 'DemandRequest',
      payload: demandData,
      client_request_id: generateClientRequestId()
    });

    if (isOnline) {
      syncManager.syncAll();
    }

    return record;
  }
};
