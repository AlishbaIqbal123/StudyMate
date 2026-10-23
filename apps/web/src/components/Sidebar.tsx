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
      badgeColor: 'bg-[#FDA769]/20 text-[#944519] dark:text-[#FDA769] border border-[#FDA769]/40',
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#2E2620] border-r border-[#E6E0D0] dark:border-[#FEC868]/15 flex flex-col justify-between p-4 text-[#473C33] dark:text-[#FAF8F1] transition-all duration-200 ease-in-out lg:translate-x-0 overflow-y-auto ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Top Logo / Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D0] dark:border-[#FEC868]/15">
            <button
              onClick={() => handleSelectScreen('home')}
              className="flex items-center space-x-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#ABC270] text-white flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-[#473C33] dark:text-[#FAF8F1] tracking-tight">
                    StudyMate
                  </span>
                  <span className="rounded bg-[#ABC270]/20 text-[#586738] dark:text-[#ABC270] px-1.5 py-0.2 text-[9px] font-mono font-medium border border-[#ABC270]/30">
                    MCP
                  </span>
                </div>
                <span className="text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] block">
                  Alexa+ Study Companion
                </span>
              </div>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-[#87796B] hover:text-[#473C33] dark:text-white/50 dark:hover:text-white hover:bg-[#F5F2E8] dark:hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Student Profile Switcher */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A6C5E] dark:text-[#C2B2A1] font-medium">
                {isAuthenticated ? 'Active Student' : 'Workspace Mode'}
              </label>
              {user?.alexaLinked ? (
                <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-[#586738] bg-[#ABC270]/20 dark:text-[#ABC270] dark:bg-[#ABC270]/15 px-1.5 py-0.2 rounded border border-[#ABC270]/40">
                  <Radio className="w-2.5 h-2.5" />
                  <span>Alexa Linked</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-mono text-[#946218] bg-[#FEC868]/25 dark:text-[#FEC868] dark:bg-[#FEC868]/15 px-1.5 py-0.2 rounded border border-[#FEC868]/40">
                  {isAuthenticated ? 'Verified' : 'Demo Pass'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F5F2E8] border border-[#E6E0D0] text-left hover:bg-[#EAE5D5] dark:bg-[#393028] dark:border-[#FEC868]/15 dark:hover:bg-[#473C33] transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#FEC868] text-[#473C33] font-mono font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.avatar && user.avatar.startsWith('http') ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.avatar || 'SP'
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-xs text-[#473C33] dark:text-[#FAF8F1] block truncate">
                    {isAuthenticated ? user.name : 'Student Preview'}
                  </span>
                  <span className="text-[10px] text-[#7A6C5E] dark:text-[#C2B2A1] block truncate">
                    {isAuthenticated ? user.major : 'Full Local Access'}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#87796B] transition-transform shrink-0 ${
                  studentDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {studentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-white dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/20 rounded-xl shadow-lg p-3 space-y-2">
                <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-[#7A6C5E] dark:text-[#C2B2A1] font-medium flex items-center justify-between">
                  <span>{isAuthenticated ? 'Student Account' : 'Demo Sandbox'}</span>
                  <span className="text-[#473C33] dark:text-[#FEC868]">{user.studentId}</span>
                </div>

                {!isAuthenticated ? (
                  <div className="p-2.5 rounded-lg bg-[#FAF8F1] border border-[#E6E0D0] dark:bg-[#2E2620] dark:border-[#FEC868]/15 text-xs text-[#63574B] dark:text-[#E0D6C8] space-y-1">
                    <p className="font-medium text-[#473C33] dark:text-[#FAF8F1] text-xs">Sandbox Mode</p>
                    <p className="text-[11px] leading-relaxed">
                      Preloaded with sample coursework. You can test Pomodoro sprints, add tasks, and use the voice simulator.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#ABC270]/15 border border-[#ABC270]/35 text-xs space-y-0.5">
                    <p className="font-semibold text-[#586738] dark:text-[#ABC270] text-xs flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{user.name}</span>
                    </p>
                    <p className="text-[11px] text-[#7A6C5E] dark:text-[#C2B2A1] truncate">{user.email}</p>
                  </div>
                )}

                <div className="pt-1.5 border-t border-[#E6E0D0] dark:border-[#FEC868]/15 space-y-1">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setStudentDropdownOpen(false);
                        openClerkSignIn();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg bg-[#FEC868] hover:bg-[#F5B84D] text-[#473C33] font-semibold text-xs transition cursor-pointer shadow-xs"
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
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-[#63574B] hover:text-[#944519] hover:bg-[#FDA769]/15 dark:text-[#E0D6C8] dark:hover:text-[#FDA769] text-xs transition cursor-pointer"
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
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#87796B] dark:text-[#A3907E] block mb-2 px-1 font-medium">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-[#ABC270] text-white dark:bg-[#ABC270] dark:text-[#231D19] font-semibold shadow-sm'
                        : 'text-[#63574B] hover:text-[#473C33] hover:bg-[#F5F2E8] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] dark:hover:bg-[#393028]'
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
                            ? 'bg-white/25 text-white dark:bg-[#231D19]/20 dark:text-[#231D19]'
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
        <div className="space-y-2 pt-4 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
          {/* Quick Voice Trigger */}
          <button
            onClick={() => {
              onTriggerVoice();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#473C33] bg-[#FEC868]/25 hover:bg-[#FEC868]/40 dark:text-[#FEC868] dark:bg-[#FEC868]/15 dark:hover:bg-[#FEC868]/25 border border-[#FEC868]/40 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Open Voice Console</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] hover:bg-[#F5F2E8] dark:hover:bg-[#393028] transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-[#FEC868]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[#FDA769]" />
              )}
              <span>{theme === 'dark' ? 'Espresso mode' : 'Light theme'}</span>
            </div>
            <span className="font-mono text-[10px] text-[#87796B]">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Alexa+ Device Linking Status */}
          <button
            onClick={() => {
              toggleAlexaAccountLinking();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-[#FAF8F1] hover:bg-[#F5F2E8] dark:hover:bg-[#393028] transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Radio className={`w-3.5 h-3.5 ${user?.alexaLinked ? 'text-[#839758] dark:text-[#ABC270]' : 'text-[#87796B]'}`} />
              <span>Alexa Voice Link</span>
            </div>
            <span className={`text-[10px] font-mono ${user?.alexaLinked ? 'text-[#586738] dark:text-[#ABC270] font-semibold' : 'text-[#87796B]'}`}>
              {user?.alexaLinked ? 'Connected' : 'Offline'}
            </span>
          </button>

          {/* System Footnote */}
          <div className="px-1 pt-1 font-mono text-[10px] text-[#87796B] dark:text-[#A3907E] flex items-center justify-between">
            <span>StudyMate MCP</span>
            <span>Palette 18</span>
          </div>
        </div>
      </aside>
    </>
  );
};
