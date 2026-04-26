import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/css/App.css';
import './i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';

if (import.meta.env.DEV) {
  const inspector = (await import('@/stores/inspector')).default;
  (window as unknown as { stores: typeof inspector }).stores = inspector;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster richColors position="bottom-right" />
      <main className="bg-background text-foreground h-screen w-screen text-center">
        <App />
      </main>
    </ErrorBoundary>
  </React.StrictMode>,
);
