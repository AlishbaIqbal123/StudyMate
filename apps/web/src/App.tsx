import React, { useState, useEffect, useCallback } from 'react';
import type { Course, CourseProgress, Task, TaskPriority, TaskStatus } from '@studymate/types';
import {
  fetchTasks,
  fetchCourses,
  fetchProgress,
  createTask,
  updateTask,
  resetDatabase,
  checkServerHealth,
  simulateVoice,
  getActiveStudent,
} from './api.js';

import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { AddTaskModal } from './components/AddTaskModal.js';
import { MiniPomodoroWidget } from './components/MiniPomodoroWidget.js';

// Dedicated Screens
import { LandingPageView } from './views/LandingPageView.js';
import { DashboardView } from './views/DashboardView.js';
import { AssignmentsView } from './views/AssignmentsView.js';
import { PlannerView } from './views/PlannerView.js';
import { VoiceConsoleView } from './views/VoiceConsoleView.js';
import { TelemetryView } from './views/TelemetryView.js';

const VALID_SCREENS = ['home', 'dashboard', 'assignments', 'planner', 'voice', 'telemetry'] as const;
type ScreenType = (typeof VALID_SCREENS)[number];

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressList, setProgressList] = useState<CourseProgress[]>([]);
  const [serverHealthy, setServerHealthy] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronized screen routing with window.location.hash
  const [activeScreen, setActiveScreenState] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as ScreenType;
      if (VALID_SCREENS.includes(hash)) return hash;
    }
    return 'home';
  });

  const setActiveScreen = useCallback((screen: string) => {
    const valid = VALID_SCREENS.includes(screen as ScreenType)
      ? (screen as ScreenType)
      : 'home';
    setActiveScreenState(valid);
    if (typeof window !== 'undefined') {
      window.location.hash = valid;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ScreenType;
      if (VALID_SCREENS.includes(hash)) {
        setActiveScreenState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Focus task for study planner
  const [focusCourse, setFocusCourse] = useState<string | undefined>(undefined);
  const [focusTitle, setFocusTitle] = useState<string | undefined>(undefined);

  const loadData = useCallback(async () => {
    try {
      const [tasksData, coursesData, progressData] = await Promise.all([
        fetchTasks(),
        fetchCourses(),
        fetchProgress(),
      ]);

      setTasks(tasksData);
      setCourses(coursesData);
      setProgressList(progressData);
      setServerHealthy(true);
    } catch {
      // Handled cleanly inside api.ts fallback
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh data periodically
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleStatus = async (taskId: number, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'pending' : 'done';
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
    await updateTask(taskId, nextStatus, nextStatus === 'done' ? 45 : undefined);
    loadData();
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await updateTask(taskId, newStatus, newStatus === 'done' ? 45 : undefined);
    loadData();
  };

  const handleAddTask = async (data: {
    title: string;
    course: string;
    due_date?: string;
    est_minutes?: number;
    priority?: TaskPriority;
  }) => {
    await createTask(data);
    loadData();
  };

  const handleResetDb = async () => {
    if (confirm('Reset database to demo seed data? This will restore sample courses and tasks.')) {
      setIsResetting(true);
      try {
        await resetDatabase();
        await loadData();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleFocusTask = (task: Task) => {
    setFocusCourse(task.course_name);
    setFocusTitle(task.title);
    setActiveScreen('planner');
  };

  const handleParseNlp = async (text: string) => {
    try {
      await simulateVoice(text);
      loadData();
    } catch {
      // handled
    }
  };

  const handleTriggerVoice = () => {
    setActiveScreen('voice');
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  // 1. If viewing the Landing Page Showcase
  if (activeScreen === 'home') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased">
        {/* Floating Top Bar for Landing Page */}
        <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <span className="font-bold text-lg text-white font-headline">StudyMate</span>
              <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Alexa+ MCP
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveScreen('dashboard')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Open Dashboard →
              </button>
            </div>
          </div>
        </nav>

        <LandingPageView
          onOpenDashboard={() => setActiveScreen('dashboard')}
          onOpenVoice={() => setActiveScreen('voice')}
          onOpenPlanner={() => setActiveScreen('planner')}
          onOpenTelemetry={() => setActiveScreen('telemetry')}
          onStudentChanged={loadData}
        />
      </div>
    );
  }

  // 2. Inner App Views (Dashboard, Assignments, Planner, Voice, Telemetry)
  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans antialiased transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        pendingCount={pendingTasksCount}
        serverHealthy={serverHealthy}
        onTriggerVoice={handleTriggerVoice}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onStudentChanged={loadData}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Header
          serverHealthy={serverHealthy}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          onRefresh={loadData}
          onResetDb={handleResetDb}
          isResetting={isResetting}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onStudentChanged={loadData}
        />

        {/* Dynamic Screen View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeScreen === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              courses={courses}
              progressList={progressList}
              onToggleStatus={handleToggleStatus}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onFocusTask={handleFocusTask}
              onParseNlp={handleParseNlp}
              onDataChanged={loadData}
              onNavigateToScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'assignments' && (
            <AssignmentsView
              tasks={tasks}
              courses={courses}
              onToggleStatus={handleToggleStatus}
              onUpdateStatus={handleUpdateTaskStatus}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onFocusTask={handleFocusTask}
            />
          )}

          {activeScreen === 'planner' && (
            <PlannerView
              courses={courses}
              progressList={progressList}
              focusCourse={focusCourse}
              focusTitle={focusTitle}
            />
          )}

          {activeScreen === 'voice' && (
            <VoiceConsoleView onDataChanged={loadData} />
          )}

          {activeScreen === 'telemetry' && (
            <TelemetryView
              tasks={tasks}
              courses={courses}
              progressList={progressList}
              onDataChanged={loadData}
            />
          )}
        </main>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
        courses={courses}
      />

      {/* Mini-Pomodoro Widget */}
      <MiniPomodoroWidget
        onNavigateToPlanner={() => setActiveScreen('planner')}
        currentScreen={activeScreen}
      />
    </div>
  );
}

export default App;
