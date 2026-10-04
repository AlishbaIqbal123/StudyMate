import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { PomodoroProvider } from './context/PomodoroContext.js';
import { AuthProvider } from './context/AuthContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PomodoroProvider>
          <App />
        </PomodoroProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
