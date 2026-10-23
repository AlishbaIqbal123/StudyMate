import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BorderGlow } from './animated/index.js';
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
      badgeColor: 'bg-[#E5A952]/10 text-[#E5A952]',
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
      badgeColor: 'bg-[#C24138]/10 text-[#E06357]',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Clock,
      badge: 'Focus',
      badgeColor: 'bg-[#E5A952]/10 text-[#E5A952]',
    },
    {
      id: 'voice',
      label: 'Voice Console',
      icon: Mic,
      badge: 'Live',
      badgeColor: 'bg-[#4E7A68]/10 text-[#7AB89F]',
    },
    {
      id: 'telemetry',
      label: 'Assistant Tools',
      icon: Terminal,
      badge: serverHealthy ? 'Ready' : 'Offline',
      badgeColor: serverHealthy
        ? 'bg-[#4E7A68]/10 text-[#7AB89F]'
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
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FAF7F2] dark:bg-[#0E1117] border-r border-[#E6DFD3] dark:border-white/[0.06] flex flex-col justify-between p-4 text-slate-800 dark:text-white transition-all duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
        >
          <div className="space-y-6">
            {/* Top Logo / Brand */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
              <button
                onClick={() => handleSelectScreen('home')}
                className="flex items-center space-x-3 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E5A952] text-[#0E1117] flex items-center justify-center shadow-md dark:shadow-inner group-hover:scale-105 transition-transform backdrop-blur-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-lg font-medium text-[#1C1917] dark:text-[#F5EFE6] block leading-none">
                      studymate
                    </span>
                    <span className="rounded-full bg-[#E5A952]/10 text-[#E5A952] px-2 py-0.5 text-[9px] font-sans font-medium border border-[#E5A952]/25">
                      MCP
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8E867A] block mt-1">
                    Alexa+ Add-on · 2026
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
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/40 font-semibold">
                  {isAuthenticated ? 'Student Profile' : 'Access Mode'}
                </label>
                {user?.alexaLinked ? (
                  <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-blue-700 bg-blue-100 dark:text-cyan-400 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-cyan-500/20">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    <span>Alexa+</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[9px] font-mono text-blue-700 bg-blue-100 dark:text-cyan-400 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-cyan-500/20">
                    {isAuthenticated ? 'Verified' : 'Preview'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/90 text-left hover:border-slate-300 hover:bg-slate-200/60 dark:bg-white/[0.04] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.06] transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.avatar && user.avatar.startsWith('http') ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.avatar || 'SP'
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                      {isAuthenticated ? user.name : 'Scholar Preview'}
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-cyan-300 block truncate font-medium">
                      {isAuthenticated ? user.major : 'Academic Preview Pass'}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 dark:text-white/50 transition-transform shrink-0 ${studentDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {studentDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-white dark:bg-[#0c1222]/95 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                  <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/50 font-semibold flex items-center justify-between">
                    <span>{isAuthenticated ? 'Active Profile' : 'Evaluation Sandbox'}</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-semibold">{user.studentId}</span>
                  </div>

                  {!isAuthenticated ? (
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 dark:bg-cyan-500/5 dark:border-cyan-500/20 text-[11px] text-slate-600 dark:text-white/70 space-y-1">
                      <p className="font-semibold text-blue-700 dark:text-cyan-400 text-xs">Academic Preview Mode</p>
                      <p className="text-[10px]">
                        Explore courses, test the Alexa+ voice console, and run focus timers with pre-seeded coursework.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-[11px] space-y-0.5">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{user.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-white/60 truncate">{user.email}</p>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-200 dark:border-white/10 space-y-1">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => {
                          setStudentDropdownOpen(false);
                          openClerkSignIn();
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs transition cursor-pointer shadow-sm shadow-blue-500/20"
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
                        className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 text-xs transition cursor-pointer"
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/40 block mb-2 px-1 font-semibold">
                Navigation
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  const navBtn = (
                    <button
                      onClick={() => handleSelectScreen(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-white/10 dark:text-white dark:border-white/15 dark:shadow-lg font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.05]'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="flex items-center justify-center w-6 h-6 rounded-md backdrop-blur-sm bg-white/5 dark:bg-white/10 border border-white/10 shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                        >
                          <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-blue-600 dark:text-cyan-300' : 'text-slate-500 dark:text-white/60'}`} />
                        </motion.div>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${isActive
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/10 dark:text-white/60 dark:border-white/10'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                  return isActive ? (
                    <BorderGlow key={item.id} glowColor={theme === 'dark' ? 'rgba(34, 211, 238, 0.4)' : 'rgba(99, 102, 241, 0.4)'} borderRadius="0.75rem">
                      {navBtn}
                    </BorderGlow>
                  ) : (
                    <React.Fragment key={item.id}>{navBtn}</React.Fragment>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
            {/* Quick Voice Trigger */}
            <button
              onClick={() => {
                onTriggerVoice();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white transition shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-transparent dark:border-white/20 active:scale-95 hover:opacity-90 bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-b dark:from-[#2B2B2B] dark:to-[#101010]"
            >
              <Mic className="w-3.5 h-3.5 text-blue-400 dark:text-cyan-400" />
              <span>Voice Console</span>
            </button>

            {/* Theme Switcher Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-100/90 border border-slate-200/90 text-slate-800 hover:bg-slate-200/70 dark:bg-white/[0.04] dark:border-white/10 dark:text-white/90 dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-300" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-600 dark:text-white/60 px-1.5 py-0.5 rounded-md bg-slate-200/80 border border-slate-300/60 dark:bg-white/10 dark:border-white/10">
                {theme === 'dark' ? 'DARK' : 'LIGHT'}
              </span>
            </button>

            {/* Alexa+ Device Linking Status */}
            <button
              onClick={() => {
                toggleAlexaAccountLinking();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/90 border border-slate-200/90 text-[11px] text-slate-800 hover:bg-slate-200/70 hover:border-slate-300 dark:bg-white/[0.04] dark:border-white/10 dark:text-white dark:hover:border-white/20 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Radio className={`w-3.5 h-3.5 ${user?.alexaLinked ? 'text-blue-600 dark:text-cyan-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="font-medium text-slate-900 dark:text-white">Alexa+ Voice Link</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${user?.alexaLinked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {user?.alexaLinked ? 'Linked (PKCE)' : 'Pair Device'}
              </span>
            </button>

            {/* System Footnote */}
            <div className="px-2 pt-1 font-mono text-[10px] text-slate-400 dark:text-white/40 flex items-center justify-between">
              <span>StudyMate Assistant</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </aside>
      </motion.div>
    </>
  );
};
