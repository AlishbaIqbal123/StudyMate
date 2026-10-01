import React from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  RefreshCw,
  Menu,
  Plus,
  Terminal,
  Clock,
  CheckSquare,
  LayoutDashboard,
  Mic,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface HeaderProps {
  serverHealthy: boolean;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onRefresh: () => void;
  onResetDb: () => void;
  isResetting: boolean;
  onToggleMobileMenu: () => void;
  onOpenAddModal?: () => void;
}

const SCREEN_TITLES: Record<string, { title: string; subtitle: string; icon: any }> = {
  dashboard: {
    title: 'Academic Hub',
    subtitle: 'Daily coursework schedule & performance summary',
    icon: LayoutDashboard,
  },
  assignments: {
    title: 'Assignments & Tasks',
    subtitle: 'Kanban pipeline & priority tracking',
    icon: CheckSquare,
  },
  planner: {
    title: 'Smart Study Planner',
    subtitle: 'Pomodoro focus timer & interval schedule',
    icon: Clock,
  },
  voice: {
    title: 'Alexa+ Voice Console',
    subtitle: 'Conversational academic agent & speech interaction',
    icon: Mic,
  },
  telemetry: {
    title: 'AI Assistant & Diagnostics',
    subtitle: 'Test assistant actions, check sync status, and explore saved data',
    icon: Sparkles,
  },
};

export const Header: React.FC<HeaderProps> = ({
  serverHealthy,
  activeScreen,
  setActiveScreen,
  onRefresh,
  onResetDb,
  isResetting,
  onToggleMobileMenu,
  onOpenAddModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const screenInfo = SCREEN_TITLES[activeScreen] || SCREEN_TITLES.dashboard;
  const Icon = screenInfo.icon;

  return (
    <header className="sticky top-0 z-30 w-full bg-app-card/90 border-b border-app-border backdrop-blur-md transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Current Screen Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-app-muted hover:text-app-text hover:bg-app-subtle transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-themePrimary-500/10 text-[#4f91b0] items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-headline text-sm sm:text-base font-bold text-app-text truncate">
                {screenInfo.title}
              </h1>
              <p className="hidden md:block text-[11px] text-app-muted truncate">
                {screenInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions, Theme, Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick Add Assignment Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 rounded-xl text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shadow-sm shadow-[#4f91b0]/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          )}

          {/* Server Status Indicator */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-app-subtle border border-app-border text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                serverHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline text-[11px] font-semibold text-app-text">
              {serverHealthy ? 'Ready' : 'Offline'}
            </span>
          </div>

          {/* Light / Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-app-subtle hover:bg-app-border/40 text-app-text border border-app-border transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#4f91b0]" />
            )}
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-app-subtle hover:bg-app-border/40 text-app-muted hover:text-app-text border border-app-border transition cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDb}
            disabled={isResetting}
            className="px-2.5 py-1.5 text-xs font-headline font-semibold rounded-xl bg-app-subtle hover:bg-app-border/40 text-app-muted hover:text-app-text border border-app-border transition flex items-center space-x-1 cursor-pointer"
            title="Restore sample demo data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xl:inline text-[11px]">
              {isResetting ? 'Resetting...' : 'Reset'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
