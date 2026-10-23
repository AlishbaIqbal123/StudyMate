import React, { useState } from 'react';
import {
  Sun,
  Moon,
  RefreshCw,
  Menu,
  Plus,
  Clock,
  CheckSquare,
  LayoutDashboard,
  Mic,
  Home,
  ChevronDown,
  ShieldCheck,
  Radio,
  LogOut,
  UserCheck,
  Check,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { getPreviewTasksRemaining } from '../api.js';

interface HeaderProps {
  serverHealthy: boolean;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onRefresh: () => void;
  onResetDb: () => void;
  isResetting: boolean;
  onToggleMobileMenu: () => void;
  onOpenAddModal?: () => void;
  onStudentChanged?: () => void;
}

const SCREEN_TITLES: Record<string, { title: string; subtitle: string; icon: any }> = {
  home: {
    title: 'Showcase',
    subtitle: 'Architecture, live study desk, and voice simulator',
    icon: Home,
  },
  dashboard: {
    title: 'Academic Dashboard',
    subtitle: 'Daily coursework schedule and study metrics',
    icon: LayoutDashboard,
  },
  assignments: {
    title: 'Assignments & Tasks',
    subtitle: 'Coursework pipeline and deadline tracking',
    icon: CheckSquare,
  },
  planner: {
    title: 'Study Planner',
    subtitle: 'Pomodoro focus timer and scheduled intervals',
    icon: Clock,
  },
  voice: {
    title: 'Voice Console',
    subtitle: 'Alexa+ conversational dialogue and speech actions',
    icon: Mic,
  },
  telemetry: {
    title: 'System Diagnostics',
    subtitle: 'MCP tools inspector, server health, and database records',
    icon: Terminal,
  },
};

export const Header: React.FC<HeaderProps> = ({
  serverHealthy,
  activeScreen,
  onRefresh,
  onResetDb,
  isResetting,
  onToggleMobileMenu,
  onOpenAddModal,
}) => {
  const { theme, toggleTheme } = useTheme();
  const screenInfo = SCREEN_TITLES[activeScreen] || SCREEN_TITLES.dashboard;
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    logout,
    openClerkSignIn,
    toggleAlexaAccountLinking,
  } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0E121B] border-b border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Current Screen Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight truncate">
              {screenInfo.title}
            </h1>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {screenInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions, Status, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Server Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                serverHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              {serverHealthy ? 'MCP Ready' : 'Server Offline'}
            </span>
          </div>

          {/* Quick Add Assignment Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          )}

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDb}
            disabled={isResetting}
            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-lg transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xl:inline text-[11px]">
              {isResetting ? 'Resetting...' : 'Reset Data'}
            </span>
          </button>

          {/* Light / Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Student Profile Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 dark:bg-white/[0.05] dark:border-white/[0.08] dark:hover:bg-white/[0.08] transition cursor-pointer text-xs"
            >
              <div className="w-5 h-5 rounded-md bg-slate-300 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden">
                {user?.avatar && user.avatar.startsWith('http') ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || 'SP'
                )}
              </div>
              <span className="hidden sm:inline font-medium text-xs truncate max-w-[100px] text-slate-900 dark:text-white">
                {isAuthenticated ? user.name.split(' ')[0] : 'Demo Pass'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 z-40 w-72 bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/15 rounded-xl shadow-xl p-3 space-y-2">
                <div className="px-1 py-1 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {isAuthenticated ? user.name : 'Student Sandbox'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {user.studentId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.major}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>

                  <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-white/[0.04] dark:border-white/10 text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Radio className={`w-3 h-3 ${user.alexaLinked ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className="text-slate-700 dark:text-slate-200">Alexa Voice</span>
                    </div>
                    <button
                      onClick={toggleAlexaAccountLinking}
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded cursor-pointer transition ${
                        user.alexaLinked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/10'
                      }`}
                    >
                      {user.alexaLinked ? 'Linked' : 'Pair'}
                    </button>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-white/[0.03] dark:border-white/10 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                      <span>SANDBOX LIMIT</span>
                      <span>{getPreviewTasksRemaining()} / 5 tasks</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                      Full multi-device cloud sync unlocks when you sign in with your student account.
                    </p>
                  </div>
                )}

                <div className="pt-1 border-t border-slate-200 dark:border-white/10">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openClerkSignIn();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-white font-medium text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sign In with Clerk</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 text-xs transition cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
