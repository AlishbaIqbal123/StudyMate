import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { PomodoroProvider } from './context/PomodoroContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { ClerkProvider } from '@clerk/react';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

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
