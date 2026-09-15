import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncManager } from '../services/syncManager';
import { useApp } from '../context/AppContext';

export const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'pending'>('idle');
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const { syncOfflineQueue } = useApp();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (syncStatus === 'idle' && isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-200">
      {!isOnline && (
        <div className="flex items-center gap-2 text-rose-600">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs font-semibold">Offline</span>
        </div>
      )}
      
      {isOnline && syncStatus === 'pending' && (
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Pending Sync</span>
          <button 
            onClick={syncOfflineQueue}
            className="ml-2 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded"
          >
            Sync Now
          </button>
        </div>
      )}

      {syncStatus === 'syncing' && (
        <div className="flex items-center gap-2 text-blue-600">
          <RefreshCcw className="w-4 h-4 animate-spin" />
          <span className="text-xs font-semibold">Synchronizing...</span>
        </div>
      )}

      {syncStatus === 'synced' && (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-semibold">Synced</span>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Sync Failed</span>
          <button 
            onClick={syncOfflineQueue}
            className="ml-2 text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
