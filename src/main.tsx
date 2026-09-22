import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { NetworkProvider } from './context/NetworkContext';
import { registerServiceWorker } from './services/serviceWorkerRegistration';
import './i18n/i18n'; // Initialize i18next before rendering
import './index.css';

// Register PWA service worker for offline field support
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <NetworkProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </NetworkProvider>
    </LanguageProvider>
  </React.StrictMode>,
);


