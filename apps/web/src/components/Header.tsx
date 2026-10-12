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
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { DEMO_STUDENTS, getPreviewTasksRemaining } from '../api.js';

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
  const {
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    loginWithDemoAccount,
    openClerkSignIn,
    toggleAlexaAccountLinking,
  } = useAuth();

  const handleSelectDemo = async () => {
    await loginWithDemoAccount();
    setProfileDropdownOpen(false);
    if (onStudentChanged) onStudentChanged();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#07070b]/80 backdrop-blur-2xl border-b border-white/10 text-white transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Current Screen Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/10 border border-white/15 text-white items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {screenInfo.title}
              </h1>
              <p className="hidden md:block text-[11px] text-white/50 truncate">
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
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-white transition cursor-pointer text-xs"
            >
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-cyan-500/30 overflow-hidden">
                {user?.avatar && user.avatar.startsWith('http') ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || 'SP'
                )}
              </div>
              <span className="hidden sm:inline font-semibold text-xs truncate max-w-[110px] text-white">
                {isAuthenticated ? user.name.split(' ')[0] : 'Scholar Preview'}
              </span>
              {isAuthenticated ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Verified Scholar" />
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Preview
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 z-40 w-72 bg-black/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-2 py-1.5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="font-bold text-xs text-white truncate">
                        {isAuthenticated ? user.name : 'Academic Preview Pass'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                      {user.studentId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-white/50 truncate">{user.major}</p>
                    {isAuthenticated ? (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center space-x-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5" />
                        <span>Clerk Verified</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-cyan-300 shrink-0">
                        Sandbox Tier
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">{user.email}</p>

                  {/* Alexa Linked Status */}
                  <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px]">
                    <div className="flex items-center space-x-1.5">
                      <Radio className={`w-3 h-3 ${user.alexaLinked ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                      <span className="font-medium text-white">Alexa+ Voice Link</span>
                    </div>
                    <button
                      onClick={toggleAlexaAccountLinking}
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded cursor-pointer transition ${
                        user.alexaLinked
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/10 text-white/70 hover:text-cyan-300 border border-white/10'
                      }`}
                    >
                      {user.alexaLinked ? 'Linked (OAuth 2.1)' : 'Pair Device'}
                    </button>
                  </div>
                </div>

                {/* Preview Tier Sandbox Info */}
                {!isAuthenticated && (
                  <div className="px-2.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-cyan-300 font-semibold text-[10px]">
                      <span>SANDBOX LIMIT</span>
                      <span>{getPreviewTasksRemaining()} / 5 tasks left</span>
                    </div>
                    <p className="text-[10px] text-white/60">
                      Full persistent cloud sync & hardware pairing unlock with a free student account.
                    </p>
                  </div>
                )}

                {/* Account & Clerk Actions */}
                <div className="pt-1.5 border-t border-white/10 space-y-1">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openClerkSignIn();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-white font-semibold text-xs transition cursor-pointer shadow-xl border border-white/20 active:scale-95"
                      style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sign In with Clerk</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Assignment Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white transition shadow-xl flex items-center space-x-1.5 cursor-pointer border border-white/20 active:scale-95 hover:opacity-90"
              style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          )}

          {/* Server Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                serverHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="hidden sm:inline text-[11px] font-semibold text-emerald-300">
              Alexa+ MCP Online
            </span>
          </div>

          {/* Light / Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-300" />
            )}
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDb}
            disabled={isResetting}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition flex items-center space-x-1 cursor-pointer"
            title="Restore sample demo data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline text-[11px]">
              {isResetting ? 'Resetting...' : 'Reset'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
