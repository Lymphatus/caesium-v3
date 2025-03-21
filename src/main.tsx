import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import './assets/css/App.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <main className="w-screen h-screen text-center bg-background text-foreground">
        <App />
      </main>
    </HeroUIProvider>
  </React.StrictMode>,
);
