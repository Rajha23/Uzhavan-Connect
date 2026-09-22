import { apiService } from '../services/apiService';
import { addToSyncQueue } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';

export const OrderRepository = {
  createOrder: async (orderData: any) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const record = await addToSyncQueue({
      action_type: 'CREATE_ORDER',
      entity_type: 'Order',
      payload: orderData
    });

    if (isOnline) {
      syncManager.syncAll();
    }

    return record;
  },

  createDemandRequest: async (demandData: any) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    const record = await addToSyncQueue({
      action_type: 'ADD_DEMAND',
      entity_type: 'DemandRequest',
      payload: demandData
    });

    if (isOnline) {
      syncManager.syncAll();
    }

    return record;
  }
};
