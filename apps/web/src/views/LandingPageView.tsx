import React, { useState } from 'react';
import {
  DEMO_STUDENTS,
  getActiveStudent,
  setActiveStudent,
  simulateVoice,
  type VoiceSimulationResponse,
} from '../api.js';

interface LandingPageViewProps {
  onOpenDashboard: () => void;
  onOpenVoice: () => void;
  onOpenPlanner: () => void;
  onOpenTelemetry: () => void;
  onStudentChanged: () => void;
}

export function LandingPageView({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onStudentChanged,
}: LandingPageViewProps) {
  const [currentStudent, setCurrentStudent] = useState(getActiveStudent());
  const [demoPrompt, setDemoPrompt] = useState("What's due this week?");
  const [voiceResult, setVoiceResult] = useState<VoiceSimulationResponse | null>(null);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);

  const samplePrompts = [
    "What's due this week?",
    'I have 90 minutes tonight, help me study',
    'Add a task: finish OS assignment, due Monday, high priority',
    'I finished my linear algebra homework',
    'How am I doing in Algorithms?',
  ];

  const handleTestVoice = async (promptText: string) => {
    setDemoPrompt(promptText);
    setIsLoadingVoice(true);
    try {
      const res = await simulateVoice(promptText);
      setVoiceResult(res);
    } catch {
      // handled
    } finally {
      setIsLoadingVoice(false);
    }
  };

  const handleSwitchStudent = (id: number) => {
    setActiveStudent(id);
    setCurrentStudent(getActiveStudent());
    onStudentChanged();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Glow Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <header className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-lg shadow-cyan-950/50">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Amazon Alexa+ Hackathon Submission · Model Context Protocol (MCP) Add-on</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          Your Academic Life,
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Organized Through Conversation.
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 font-normal">
          StudyMate replaces fragmented syllabi, missed deadlines, and study burnout with an
          intelligent, voice-first companion on Alexa+ paired with an interactive visual dashboard.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={onOpenDashboard}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-xl shadow-cyan-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            🚀 Launch Companion Dashboard
          </button>

          <button
            onClick={onOpenVoice}
            className="px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-base shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
          >
            🎙️ Open Voice Console
          </button>

          <button
            onClick={onOpenTelemetry}
            className="px-6 py-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 border border-slate-800 font-medium text-base transition-all"
          >
            ⚙️ View MCP Specs & Endpoints
          </button>
        </div>

        {/* Live Voice Simulator Card */}
        <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎙️</span>
                <h3 className="text-xl font-bold text-white">Live Alexa+ Voice Playground</h3>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Try the exact phrases Alexa+ understands through StudyMate’s MCP tools.
              </p>
            </div>

            {/* Active Student Switcher Badge */}
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 self-start sm:self-auto">
              <span className="text-sm">{currentStudent.avatar}</span>
              <span className="text-xs font-semibold text-slate-300">{currentStudent.name}</span>
            </div>
          </div>

          {/* Quick Voice Chips */}
          <div className="mt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Click a sample phrase to test:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleTestVoice(p)}
                  className={`text-xs sm:text-sm px-3.5 py-2 rounded-xl border transition-all ${
                    demoPrompt === p
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Input & Speak Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={demoPrompt}
              onChange={(e) => setDemoPrompt(e.target.value)}
              placeholder="Type a voice request or syllabus inquiry..."
              className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleTestVoice(demoPrompt)}
            />
            <button
              onClick={() => handleTestVoice(demoPrompt)}
              disabled={isLoadingVoice || !demoPrompt.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg shadow-cyan-900/40"
            >
              {isLoadingVoice ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <span>🔊</span>
                  Ask StudyMate
                </>
              )}
            </button>
          </div>

          {/* Voice Response Area */}
          {voiceResult && (
            <div className="mt-6 bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Alexa+ Response & Tool Execution
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                  tool: {voiceResult.tool}
                </span>
              </div>
              <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                "{voiceResult.speechResponse}"
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Multi-Student Profile Switcher Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Designed for Real Students Across Any Major
          </h2>
          <p className="text-slate-400 text-base">
            StudyMate isn't limited to a single hardcoded student. Switch between profiles to test
            different courses, workload distributions, and academic specializations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_STUDENTS.map((student) => {
            const isSelected = currentStudent.id === student.id;
            return (
              <div
                key={student.id}
                onClick={() => handleSwitchStudent(student.id)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/40 transform -translate-y-1'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {student.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {student.name}
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-cyan-400 font-medium">{student.major}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                  <div className="flex justify-between">
                    <span>Academic Year:</span>
                    <span className="text-slate-200 font-medium">{student.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span className="text-slate-200 font-medium">{student.email}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitchStudent(student.id);
                    onOpenDashboard();
                  }}
                  className={`w-full mt-5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isSelected ? 'Open Dashboard as ' + student.name.split(' ')[0] : 'Switch to Profile'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5 MCP Tools Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 block">
            Under the Hood
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Five Core Model Context Protocol Tools
          </h2>
          <p className="text-slate-400 text-base">
            Alexa+ discovers and executes these structured tools over Streamable HTTP, returning
            instant audio summaries and synchronizing visual state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-1 font-mono">get_tasks</h3>
            <p className="text-xs text-blue-400 font-mono mb-3">Query assignments & deadlines</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Filter tasks by course, pending/done status, or relative date ranges (today, tomorrow,
              this week).
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              "What's due this week for Algorithms?"
            </div>
          </div>

          {/* Tool 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-1 font-mono">add_task</h3>
            <p className="text-xs text-cyan-400 font-mono mb-3">Voice assignment capture</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Creates assignments with title, course matching, estimated effort in minutes, and priority.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              "Add a task: finish OS lab, due Monday"
            </div>
          </div>

          {/* Tool 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-1 font-mono">create_study_plan</h3>
            <p className="text-xs text-purple-400 font-mono mb-3">Pomodoro schedule engine</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Splits available minutes into focused study sessions (25-45m) with restorative cognitive
              breaks.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              "I have 90 minutes tonight, help me study"
            </div>
          </div>

          {/* Tool 4 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
              04
            </div>
            <h3 className="text-lg font-bold text-white mb-1 font-mono">update_progress</h3>
            <p className="text-xs text-emerald-400 font-mono mb-3">Completion & velocity sync</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Marks tasks completed, records focus minutes, and automatically updates course
              percentage.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              "I finished my linear algebra homework"
            </div>
          </div>

          {/* Tool 5 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
              05
            </div>
            <h3 className="text-lg font-bold text-white mb-1 font-mono">get_course_progress</h3>
            <p className="text-xs text-amber-400 font-mono mb-3">Holistic academic analytics</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Reports overall syllabus completion rate, assignment ratios, and weekly study hours
              logged.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              "How am I doing in Algorithms?"
            </div>
          </div>

          {/* Architecture Summary */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">Streamable HTTP Transport</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                StudyMate adheres to the official Model Context Protocol Streamable HTTP standard,
                allowing zero-latency Alexa+ invocation with OAuth 2.1 + PKCE account linking.
              </p>
            </div>
            <button
              onClick={onOpenTelemetry}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Inspect Telemetry & Headers →
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-slate-900 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Ready to Experience Voice-First Studying?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
            Open the visual dashboard to manage assignments, generate custom Pomodoro focus plans,
            and monitor real-time course analytics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenDashboard}
              className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-base shadow-xl shadow-cyan-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Open Student Dashboard
            </button>
            <button
              onClick={onOpenPlanner}
              className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-base transition-all"
            >
              Generate Study Plan
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-400 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white">StudyMate</span> — Voice-first Academic Assistant
          for Amazon Alexa+ & MCP.
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/AlishbaIqbal123/StudyMate"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            GitHub Repository
          </a>
          <button onClick={onOpenTelemetry} className="hover:text-cyan-400 transition-colors">
            System Specs
          </button>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
