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
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#2E2620] border-b border-[#E6E0D0] dark:border-[#FEC868]/15 text-[#473C33] dark:text-[#FAF8F1] transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Current Screen Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#63574B] hover:text-[#473C33] hover:bg-[#F5F2E8] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] dark:hover:bg-[#393028] transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#473C33] dark:text-[#FAF8F1] tracking-tight truncate">
              {screenInfo.title}
            </h1>
            <p className="hidden md:block text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] truncate">
              {screenInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions, Status, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Server Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#ABC270]/15 dark:bg-[#ABC270]/10 border border-[#ABC270]/35 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                serverHealthy ? 'bg-[#ABC270]' : 'bg-[#FDA769]'
              }`}
            />
            <span className="text-[11px] text-[#586738] dark:text-[#ABC270] font-medium">
              {serverHealthy ? 'MCP Ready' : 'Server Offline'}
            </span>
          </div>

          {/* Quick Add Assignment Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] transition flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          )}

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-[#63574B] hover:text-[#473C33] hover:bg-[#F5F2E8] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] dark:hover:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 transition cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDb}
            disabled={isResetting}
            className="px-2.5 py-1.5 text-xs text-[#63574B] hover:text-[#473C33] hover:bg-[#F5F2E8] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] dark:hover:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-lg transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
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
            className="p-1.5 rounded-lg text-[#63574B] hover:text-[#473C33] hover:bg-[#F5F2E8] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] dark:hover:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#FEC868]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#473C33]" />
            )}
          </button>

          {/* Student Profile Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#F5F2E8] hover:bg-[#EAE5D5] border border-[#E6E0D0] dark:bg-[#393028] dark:border-[#FEC868]/15 dark:hover:bg-[#473C33] transition cursor-pointer text-xs"
            >
              <div className="w-5 h-5 rounded-md bg-[#FEC868] text-[#473C33] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden">
                {user?.avatar && user.avatar.startsWith('http') ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || 'SP'
                )}
              </div>
              <span className="hidden sm:inline font-medium text-xs truncate max-w-[100px] text-[#473C33] dark:text-[#FAF8F1]">
                {isAuthenticated ? user.name.split(' ')[0] : 'Demo Pass'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#87796B] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 z-40 w-72 bg-white dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/20 rounded-xl shadow-xl p-3 space-y-2">
                <div className="px-1 py-1 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#473C33] dark:text-[#FAF8F1] truncate">
                      {isAuthenticated ? user.name : 'Student Sandbox'}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A6C5E] dark:text-[#C2B2A1]">
                      {user.studentId}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] truncate mt-0.5">{user.major}</p>
                  <p className="text-[10px] text-[#87796B] dark:text-[#A3907E] truncate">{user.email}</p>

                  <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAF8F1] border border-[#E6E0D0] dark:bg-[#2E2620] dark:border-[#FEC868]/15 text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Radio className={`w-3 h-3 ${user.alexaLinked ? 'text-[#839758] dark:text-[#ABC270]' : 'text-[#87796B]'}`} />
                      <span className="text-[#473C33] dark:text-[#FAF8F1]">Alexa Voice</span>
                    </div>
                    <button
                      onClick={toggleAlexaAccountLinking}
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded cursor-pointer transition ${
                        user.alexaLinked
                          ? 'bg-[#ABC270]/20 text-[#586738] border border-[#ABC270]/40 dark:bg-[#ABC270]/15 dark:text-[#ABC270]'
                          : 'bg-[#EAE5D5] text-[#473C33] border border-[#DFD8C4] dark:bg-white/10 dark:text-[#FAF8F1] dark:border-white/10'
                      }`}
                    >
                      {user.alexaLinked ? 'Linked' : 'Pair'}
                    </button>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="px-2 py-1.5 rounded-lg bg-[#FAF8F1] border border-[#E6E0D0] dark:bg-[#2E2620] dark:border-[#FEC868]/15 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[#473C33] dark:text-[#FAF8F1] font-medium text-[10px]">
                      <span>SANDBOX LIMIT</span>
                      <span>{getPreviewTasksRemaining()} / 5 tasks</span>
                    </div>
                    <p className="text-[10px] text-[#7A6C5E] dark:text-[#C2B2A1] leading-normal">
                      Full multi-device cloud sync unlocks when you sign in with your student account.
                    </p>
                  </div>
                )}

                <div className="pt-1 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openClerkSignIn();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-[#473C33] font-semibold text-xs bg-[#FEC868] hover:bg-[#F5B84D] transition cursor-pointer"
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
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-[#63574B] hover:text-[#944519] hover:bg-[#FDA769]/15 dark:text-[#C2B2A1] dark:hover:text-[#FDA769] text-xs transition cursor-pointer"
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
