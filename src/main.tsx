import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { registerServiceWorker } from './services/serviceWorkerRegistration';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Register PWA service worker for offline field support
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);


