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
  BookOpen,
  X,
  User,
  ChevronDown,
  GraduationCap,
  Radio,
  ShieldCheck,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { DEMO_STUDENTS } from '../api.js';

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
    openAuthModal,
    logout,
    loginWithDemoAccount,
    openClerkSignIn,
    toggleAlexaAccountLinking,
  } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home / Showcase',
      icon: Home,
      badge: 'Landing',
      badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'dashboard',
      label: 'Academic Hub',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: CheckSquare,
      badge: pendingCount > 0 ? `${pendingCount}` : null,
      badgeColor: 'bg-primary-500/15 text-themePrimary-600 dark:text-themePrimary-400',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Clock,
      badge: 'Focus',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'voice',
      label: 'Voice Console',
      icon: Mic,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'telemetry',
      label: 'Assistant Tools',
      icon: Terminal,
      badge: serverHealthy ? 'Ready' : 'Offline',
      badgeColor: serverHealthy
        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    },
  ];

  const handleSelectScreen = (screenId: string) => {
    setActiveScreen(screenId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectDemo = async () => {
    await loginWithDemoAccount();
    setStudentDropdownOpen(false);
    if (onStudentChanged) onStudentChanged();
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#07070b]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-4 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Top Logo / Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <button
              onClick={() => handleSelectScreen('home')}
              className="flex items-center space-x-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform backdrop-blur-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-white block leading-none">
                    studymate
                  </span>
                  <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-semibold tracking-wider text-cyan-300 uppercase border border-cyan-500/30">
                    MCP
                  </span>
                </div>
                <span className="text-[10px] text-white/50 block mt-1 tracking-wide">
                  Alexa+ Add-on · 2026
                </span>
              </div>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Student Profile Switcher */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-app-muted font-semibold">
                {isAuthenticated ? 'Student Profile' : 'Access Mode'}
              </label>
              {user?.alexaLinked ? (
                <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>Alexa+</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {isAuthenticated ? 'Verified' : 'Preview'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-left hover:border-white/20 hover:bg-white/[0.06] transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.avatar && user.avatar.startsWith('http') ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.avatar || 'SP'
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">
                    {isAuthenticated ? user.name : 'Scholar Preview'}
                  </span>
                  <span className="text-[10px] text-cyan-300 block truncate font-medium">
                    {isAuthenticated ? user.major : 'Academic Preview Pass'}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white/50 transition-transform shrink-0 ${
                  studentDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {studentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-black/95 border border-white/15 rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold flex items-center justify-between">
                  <span>{isAuthenticated ? 'Active Profile' : 'Evaluation Sandbox'}</span>
                  <span className="text-cyan-400">{user.studentId}</span>
                </div>

                {!isAuthenticated ? (
                  <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-app-muted space-y-1">
                    <p className="font-semibold text-cyan-400 text-xs">Academic Preview Mode</p>
                    <p className="text-[10px]">
                      Explore courses, test the Alexa+ voice console, and run focus timers with pre-seeded coursework.
                    </p>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] space-y-0.5">
                    <p className="font-semibold text-emerald-400 text-xs flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{user.name}</span>
                    </p>
                    <p className="text-[10px] text-app-muted truncate">{user.email}</p>
                  </div>
                )}

                <div className="pt-1.5 border-t border-app-border space-y-1">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setStudentDropdownOpen(false);
                        openClerkSignIn();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition cursor-pointer shadow-sm shadow-cyan-500/20"
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
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2 px-1 font-semibold">
              Navigation
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectScreen(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/15 shadow-lg backdrop-blur-xl font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-300' : 'text-white/60'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/10 text-white/60 border border-white/10'
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
        <div className="space-y-3 pt-4 border-t border-white/10">
          {/* Quick Voice Trigger */}
          <button
            onClick={() => {
              onTriggerVoice();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white transition shadow-xl flex items-center justify-center space-x-2 cursor-pointer border border-white/20 active:scale-95 hover:opacity-90"
            style={{
              background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
            }}
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice Console</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/10 text-white/90 hover:bg-white/[0.08] transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-white/60 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10">
              {theme === 'dark' ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Alexa+ Device Linking Status */}
          <button
            onClick={() => {
              toggleAlexaAccountLinking();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-white hover:border-white/20 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Radio className={`w-3.5 h-3.5 ${user?.alexaLinked ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="font-medium">Alexa+ Voice Link</span>
            </div>
            <span className={`text-[10px] font-mono font-semibold ${user?.alexaLinked ? 'text-emerald-400' : 'text-amber-400'}`}>
              {user?.alexaLinked ? 'Linked (PKCE)' : 'Pair Device'}
            </span>
          </button>

          {/* System Footnote */}
          <div className="px-2 pt-1 font-mono text-[10px] text-white/40 flex items-center justify-between">
            <span>StudyMate Assistant</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
