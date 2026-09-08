/**
 * Service Worker Registration & PWA Installation Manager
 * Handles offline caching activation, update notifications, and deferred install prompts.
 */

type InstallPromptCallback = (canInstall: boolean) => void;

let deferredPrompt: any = null;
const installListeners: Set<InstallPromptCallback> = new Set();

// Listen for browser install prompt event
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent immediate automatic browser banner
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach((cb) => cb(true));
    console.log('[UZHAVAN PWA] App is installable. Deferred prompt captured.');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((cb) => cb(false));
    console.log('[UZHAVAN PWA] Application successfully installed to homescreen / desktop.');
  });
}

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[UZHAVAN PWA] Service Worker not supported in this browser environment.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[UZHAVAN PWA] Service Worker registered with scope:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[UZHAVAN PWA] New update available. Will activate on next visit.');
        }
      });
    });

    return registration;
  } catch (err) {
    console.error('[UZHAVAN PWA] Service Worker registration failed:', err);
    return null;
  }
};

export const onInstallableChange = (callback: InstallPromptCallback): (() => void) => {
  installListeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => installListeners.delete(callback);
};

export const promptAppInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.warn('[UZHAVAN PWA] Cannot trigger install prompt; prompt not deferred or already installed.');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[UZHAVAN PWA] User install choice:', outcome);
    deferredPrompt = null;
    installListeners.forEach((cb) => cb(false));
    return outcome === 'accepted';
  } catch (err) {
    console.error('[UZHAVAN PWA] Error triggering install prompt:', err);
    return false;
  }
};

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};
