import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Mic,
  Terminal,
  Sun,
  Moon,
  BookOpen,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  pendingCount: number;
  serverHealthy: boolean;
  onTriggerVoice: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  setActiveScreen,
  pendingCount,
  serverHealthy,
  onTriggerVoice,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
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

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 h-screen z-50 bg-app-card border-r border-app-border flex flex-col justify-between p-4 overflow-y-auto transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div className="space-y-5">
          {/* Brand Header & Mobile Close */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3895c7] to-[#4f91b0] flex items-center justify-center text-white shadow-md shadow-[#4f91b0]/25">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-headline text-lg font-bold tracking-tight text-app-text">
                    StudyMate
                  </span>
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-themePrimary-500/15 text-themePrimary-600 dark:text-themePrimary-400 border border-themePrimary-500/20">
                    MCP
                  </span>
                </div>
                <p className="text-[11px] text-app-muted truncate">
                  Alexa+ Academic Agent
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-app-muted hover:text-app-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Card */}
          <div className="p-3 rounded-2xl bg-app-subtle border border-app-border flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3895c7] to-[#7650af] flex items-center justify-center text-xs font-bold text-white shadow-sm font-headline">
                AK
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-app-card ${
                  serverHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={serverHealthy ? 'MCP Server Online' : 'MCP Server Offline'}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-headline text-xs font-bold text-app-text truncate">
                Alishba Iqbal
              </h4>
              <p className="text-[10px] text-app-muted font-mono truncate">
                Student ID #1 (Demo)
              </p>
            </div>
          </div>

          {/* Navigation Screen Links */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-app-muted">
              Workspace Screens
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectScreen(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-headline font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-themePrimary-500/15 text-themePrimary-600 dark:text-themePrimary-300 font-bold border border-themePrimary-500/30 shadow-sm'
                        : 'text-app-muted hover:text-app-text hover:bg-app-subtle'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-themePrimary-600 dark:text-themePrimary-300'
                            : 'text-app-muted'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${item.badgeColor}`}
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

        {/* Bottom Section: Theme Switcher & Actions */}
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
