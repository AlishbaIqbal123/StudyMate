import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { PomodoroProvider } from './context/PomodoroContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { ClerkProvider } from '@clerk/react';
import './index.css';

const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_PUBLISHABLE_KEY =
  envKey && !envKey.includes('your_clerk_publishable_key')
    ? envKey
    : 'pk_test_Y29uY2lzZS13YXJ0aG9nLTUuY2xlcmsuYWNjb3VudHMuZGV2JA';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <AuthProvider>
          <PomodoroProvider>
            <App />
          </PomodoroProvider>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
