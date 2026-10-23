import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  CheckSquare,
  Clock,
  Mic,
  Terminal,
  Sun,
  Moon,
  X,
  ChevronDown,
  GraduationCap,
  Radio,
  ShieldCheck,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  pendingCount: number;
  serverHealthy: boolean;
  onTriggerVoice: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onStudentChanged?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  setActiveScreen,
  pendingCount,
  serverHealthy,
  onTriggerVoice,
  mobileOpen = false,
  onCloseMobile,
  onStudentChanged,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    logout,
    loginWithDemoAccount,
    openClerkSignIn,
    toggleAlexaAccountLinking,
  } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Showcase',
      icon: Home,
      badge: null,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: CheckSquare,
      badge: pendingCount > 0 ? `${pendingCount}` : null,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Clock,
      badge: null,
    },
    {
      id: 'voice',
      label: 'Voice Console',
      icon: Mic,
      badge: null,
    },
    {
      id: 'telemetry',
      label: 'Diagnostics',
      icon: Terminal,
      badge: null,
    },
  ];

  const handleSelectScreen = (screenId: string) => {
    setActiveScreen(screenId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0E121B] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between p-4 text-slate-800 dark:text-slate-100 transition-all duration-200 ease-in-out lg:translate-x-0 overflow-y-auto ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Top Logo / Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={() => handleSelectScreen('home')}
              className="flex items-center space-x-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                    StudyMate
                  </span>
                  <span className="rounded bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 px-1.5 py-0.2 text-[9px] font-mono font-medium border border-slate-200 dark:border-white/10">
                    MCP
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Alexa+ Study Companion
                </span>
              </div>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Student Profile Switcher */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                {isAuthenticated ? 'Active Student' : 'Workspace Mode'}
              </label>
              {user?.alexaLinked ? (
                <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-500/20">
                  <Radio className="w-2.5 h-2.5" />
                  <span>Alexa Linked</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-mono text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-white/[0.06] px-1.5 py-0.2 rounded border border-slate-200 dark:border-white/10">
                  {isAuthenticated ? 'Verified' : 'Demo Pass'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 dark:bg-white/[0.04] dark:border-white/[0.08] dark:hover:bg-white/[0.07] transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.avatar && user.avatar.startsWith('http') ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.avatar || 'SP'
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-xs text-slate-900 dark:text-white block truncate">
                    {isAuthenticated ? user.name : 'Student Preview'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {isAuthenticated ? user.major : 'Full Local Access'}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                  studentDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {studentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/15 rounded-xl shadow-lg p-3 space-y-2">
                <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
                  <span>{isAuthenticated ? 'Student Account' : 'Demo Sandbox'}</span>
                  <span className="text-slate-600 dark:text-slate-300">{user.studentId}</span>
                </div>

                {!isAuthenticated ? (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-white/[0.04] dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-medium text-slate-900 dark:text-white text-xs">Sandbox Mode</p>
                    <p className="text-[11px] leading-relaxed">
                      Preloaded with sample coursework. You can test Pomodoro sprints, add tasks, and use the voice simulator.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-xs space-y-0.5">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{user.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-200 dark:border-white/10 space-y-1">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setStudentDropdownOpen(false);
                        openClerkSignIn();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-xs transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sign In with Clerk</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setStudentDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 text-xs transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1 font-medium">
              Navigation
            </span>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectScreen(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
          {/* Quick Voice Trigger */}
          <button
            onClick={() => {
              onTriggerVoice();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Open Voice Console</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
              <span>{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Alexa+ Device Linking Status */}
          <button
            onClick={() => {
              toggleAlexaAccountLinking();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Radio className={`w-3.5 h-3.5 ${user?.alexaLinked ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>Alexa Voice Link</span>
            </div>
            <span className={`text-[10px] font-mono ${user?.alexaLinked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {user?.alexaLinked ? 'Connected' : 'Offline'}
            </span>
          </button>

          {/* System Footnote */}
          <div className="px-1 pt-1 font-mono text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>StudyMate MCP</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
