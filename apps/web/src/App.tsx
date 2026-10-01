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
} from './api.js';

import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { AddTaskModal } from './components/AddTaskModal.js';
import { MiniPomodoroWidget } from './components/MiniPomodoroWidget.js';

// 5 Dedicated Screens
import { DashboardView } from './views/DashboardView.js';
import { AssignmentsView } from './views/AssignmentsView.js';
import { PlannerView } from './views/PlannerView.js';
import { VoiceConsoleView } from './views/VoiceConsoleView.js';
import { TelemetryView } from './views/TelemetryView.js';

const VALID_SCREENS = ['dashboard', 'assignments', 'planner', 'voice', 'telemetry'] as const;
type ScreenType = (typeof VALID_SCREENS)[number];

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressList, setProgressList] = useState<CourseProgress[]>([]);
  const [serverHealthy, setServerHealthy] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronized screen routing with window.location.hash
  const [activeScreen, setActiveScreenState] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as ScreenType;
      if (VALID_SCREENS.includes(hash)) return hash;
    }
    return 'dashboard';
  });

  const setActiveScreen = useCallback((screen: string) => {
    const valid = VALID_SCREENS.includes(screen as ScreenType)
      ? (screen as ScreenType)
      : 'dashboard';
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
      const healthy = await checkServerHealth();
      setServerHealthy(healthy);

      const [tasksData, coursesData, progressData] = await Promise.all([
        fetchTasks(),
        fetchCourses(),
        fetchProgress(),
      ]);

      setTasks(tasksData);
      setCourses(coursesData);
      setProgressList(progressData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setServerHealthy(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Poll server health & data every 8 seconds
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleStatus = async (taskId: number, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'pending' : 'done';
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
      await updateTask(taskId, nextStatus, nextStatus === 'done' ? 45 : undefined);
      loadData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      loadData();
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await updateTask(taskId, newStatus, newStatus === 'done' ? 45 : undefined);
      loadData();
    } catch (err) {
      console.error('Failed to update task status:', err);
      loadData();
    }
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
    } catch (err) {
      console.error('Error parsing NLP:', err);
    }
  };

  const handleTriggerVoice = () => {
    setActiveScreen('voice');
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans antialiased transition-colors duration-200">
      {/* Truly Fixed Sidebar (with Mobile Slide-over Drawer) */}
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        pendingCount={pendingTasksCount}
        serverHealthy={serverHealthy}
        onTriggerVoice={handleTriggerVoice}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by 16rem / 64 on desktop for fixed sidebar) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Header with Navigation Tabs & Controls */}
        <Header
          serverHealthy={serverHealthy}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          onRefresh={loadData}
          onResetDb={handleResetDb}
          isResetting={isResetting}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
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

      {/* Persistent Floating Mini-Pomodoro Widget with Cross Button & Background Sync */}
      <MiniPomodoroWidget
        onNavigateToPlanner={() => setActiveScreen('planner')}
        currentScreen={activeScreen}
      />
    </div>
  );
}

export default App;
