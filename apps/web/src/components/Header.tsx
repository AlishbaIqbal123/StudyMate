import React, { useState } from 'react';
import {
  Sparkles,
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
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { DEMO_STUDENTS } from '../api.js';

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
    title: 'Showcase & Overview',
    subtitle: 'Product features, Alexa+ voice demo, and MCP architecture',
    icon: Home,
  },
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
  onStudentChanged,
}) => {
  const { theme, toggleTheme } = useTheme();
  const screenInfo = SCREEN_TITLES[activeScreen] || SCREEN_TITLES.dashboard;
  const Icon = screenInfo.icon;
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, openAuthModal, logout, loginWithDemoAccount } = useAuth();

  const handleSelectDemo = async () => {
    await loginWithDemoAccount();
    setProfileDropdownOpen(false);
    if (onStudentChanged) onStudentChanged();
  };

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
          {/* Student Profile Quick Switcher & University Auth */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-app-subtle border border-app-border hover:border-cyan-500/40 text-app-text transition cursor-pointer text-xs"
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-cyan-500/30">
                {user?.avatar || 'ST'}
              </div>
              <span className="hidden sm:inline font-headline font-semibold text-xs truncate max-w-[100px]">
                {user ? user.name.split(' ')[0] : 'Sign In'}
              </span>
              {user?.alexaLinked && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" title="Alexa+ Linked" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-app-muted transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 z-40 w-64 bg-app-card border border-app-border rounded-xl shadow-xl p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-2 py-1.5 border-b border-app-border">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-app-text truncate">{user?.name || 'Guest Student'}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {user?.studentId || 'ID: 2026-STU'}
                    </span>
                  </div>
                  <p className="text-[10px] text-app-muted truncate mt-0.5">{user?.major || 'Unregistered'}</p>
                  <p className="text-[10px] text-app-muted truncate">{user?.email}</p>

                  {/* Alexa Linked Status */}
                  <div className="mt-2 flex items-center justify-between px-2 py-1 rounded-lg bg-app-subtle border border-app-border text-[10px]">
                    <div className="flex items-center space-x-1.5">
                      <Radio className={`w-3 h-3 ${user?.alexaLinked ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                      <span className="font-medium text-app-text">Alexa+ Voice</span>
                    </div>
                    <span className={`text-[9px] font-semibold ${user?.alexaLinked ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {user?.alexaLinked ? 'Linked (OAuth 2.1)' : 'Not Linked'}
                    </span>
                  </div>
                </div>

                {/* Sample Demo Account Shortcut */}
                <div className="px-1 py-1">
                  <button
                    onClick={handleSelectDemo}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition cursor-pointer border ${
                      user?.id === 1 || user?.isDemo
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold'
                        : 'bg-app-subtle border-app-border text-app-text hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[9px] flex items-center justify-center shrink-0">
                        AI
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">Alishba Iqbal</div>
                        <div className="text-[9px] text-app-muted truncate">Sample Demo Account</div>
                      </div>
                    </div>
                    {user?.id === 1 || user?.isDemo ? (
                      <span className="text-[9px] font-mono text-emerald-400 font-semibold shrink-0">Active</span>
                    ) : (
                      <span className="text-[9px] font-mono text-cyan-400 shrink-0">Load</span>
                    )}
                  </button>
                </div>

                {/* Account & OAuth Actions */}
                <div className="pt-1.5 border-t border-app-border space-y-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openAuthModal();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition cursor-pointer shadow-sm shadow-cyan-500/20"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Supabase Auth & Alexa</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1 px-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
                serverHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="hidden sm:inline text-[11px] font-semibold text-cyan-400">
              Alexa+ MCP Online
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
