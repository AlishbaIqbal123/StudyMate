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
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { DEMO_STUDENTS, getActiveStudent, setActiveStudent } from '../api.js';

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
  const currentStudent = getActiveStudent();

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

  const handleSelectStudent = (studentId: number) => {
    setActiveStudent(studentId);
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-app-card border-r border-app-border flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Top Logo / Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-app-border">
            <button
              onClick={() => handleSelectScreen('home')}
              className="flex items-center space-x-3 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4f91b0] to-cyan-400 text-white flex items-center justify-center shadow-md shadow-[#4f91b0]/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-headline font-bold text-base text-app-text block leading-none">
                  StudyMate
                </span>
                <span className="font-mono text-[10px] text-app-muted block mt-1">
                  Alexa+ MCP Assistant
                </span>
              </div>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-app-muted hover:text-app-text hover:bg-app-subtle transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Student Profile Switcher */}
          <div className="relative">
            <label className="text-[10px] font-mono uppercase tracking-wider text-app-muted block mb-1.5 px-1 font-semibold">
              Current Student Profile
            </label>
            <button
              type="button"
              onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-app-subtle border border-app-border text-left hover:border-cyan-500/40 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-xl shrink-0">{currentStudent.avatar}</span>
                <div className="min-w-0">
                  <span className="font-headline font-bold text-xs text-app-text block truncate">
                    {currentStudent.name}
                  </span>
                  <span className="text-[10px] text-[#4f91b0] block truncate font-medium">
                    {currentStudent.major}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-app-muted transition-transform shrink-0 ${
                  studentDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {studentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-app-card border border-app-border rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {DEMO_STUDENTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s.id)}
                    className={`w-full flex items-center space-x-2.5 p-2 rounded-lg text-left text-xs transition ${
                      currentStudent.id === s.id
                        ? 'bg-[#4f91b0]/15 text-[#4f91b0] font-bold'
                        : 'text-app-text hover:bg-app-subtle'
                    }`}
                  >
                    <span className="text-lg">{s.avatar}</span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{s.name}</div>
                      <div className="text-[10px] text-app-muted truncate">{s.major}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-app-muted block mb-2 px-1 font-semibold">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-headline text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4f91b0] to-cyan-600 text-white shadow-md shadow-[#4f91b0]/20'
                        : 'text-app-muted hover:text-app-text hover:bg-app-subtle'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-app-subtle text-app-text'
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
        <div className="space-y-3 pt-4 border-t border-app-border">
          {/* Quick Voice Trigger */}
          <button
            onClick={() => {
              onTriggerVoice();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-headline font-bold text-white bg-[#4f91b0] hover:bg-[#3f748d] transition shadow-md shadow-[#4f91b0]/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Console</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-headline font-semibold bg-app-subtle border border-app-border text-app-text hover:bg-app-border/40 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-themePrimary-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-app-muted px-1.5 py-0.5 rounded bg-app-card border border-app-border">
              {theme === 'dark' ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* System Footnote */}
          <div className="px-2 pt-1 font-mono text-[10px] text-app-muted flex items-center justify-between">
            <span>StudyMate Assistant</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
