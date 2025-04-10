import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import './assets/css/App.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <main className="dark:bg-background bg-default-200 text-foreground h-screen w-screen text-center">
        <App />
      </main>
    </HeroUIProvider>
  </React.StrictMode>,
);
