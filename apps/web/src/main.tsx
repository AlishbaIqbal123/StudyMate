import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { PomodoroProvider } from './context/PomodoroContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PomodoroProvider>
        <App />
      </PomodoroProvider>
    </ThemeProvider>
  </React.StrictMode>
);
