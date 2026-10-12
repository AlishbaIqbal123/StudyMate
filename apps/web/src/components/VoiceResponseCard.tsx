import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  Target,
  Sparkles,
  Code2,
  ChevronRight,
  ArrowRight,
  Activity,
  Flame,
  Check,
} from 'lucide-react';
import type { VoiceSimulationResponse } from '../api.js';

interface VoiceResponseCardProps {
  result: VoiceSimulationResponse;
  onStartTimer?: (minutes: number, course: string, title?: string) => void;
  onToggleTask?: (taskId: number) => void;
  onOpenPlanner?: () => void;
  onOpenDashboard?: () => void;
  ttsEnabled?: boolean;
  onSpeak?: (text: string) => void;
}

export const VoiceResponseCard: React.FC<VoiceResponseCardProps> = ({
  result,
  onStartTimer,
  onToggleTask,
  onOpenPlanner,
  onOpenDashboard,
  ttsEnabled = true,
  onSpeak,
}) => {
  const [showMcpPayload, setShowMcpPayload] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);

  const handleTaskCheck = (taskId: number) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
    if (onToggleTask) {
      onToggleTask(taskId);
    }
  };

  const isStudyPlan = Boolean(
    result.data &&
      typeof result.data === 'object' &&
      'blocks' in (result.data as Record<string, any>)
  );

  const isTimerStarted = Boolean(
    result.data &&
      typeof result.data === 'object' &&
      (result.data as Record<string, any>).action === 'start_timer'
  );

  const isTaskList = Boolean(
    Array.isArray(result.data) &&
      result.data.length > 0 &&
      'title' in (result.data[0] as Record<string, any>)
  );

  const isSingleTask = Boolean(
    result.data &&
      typeof result.data === 'object' &&
      'id' in (result.data as Record<string, any>) &&
      'title' in (result.data as Record<string, any>) &&
      !('blocks' in (result.data as Record<string, any>))
  );

  const isProgressList = Boolean(
    Array.isArray(result.data) &&
      result.data.length > 0 &&
      'completed_pct' in (result.data[0] as Record<string, any>)
  );

  const isRecommendation = Boolean(
    result.data &&
      typeof result.data === 'object' &&
      (result.data as Record<string, any>).actionType === 'recommendation'
  );

  const isAcademicAdvice = Boolean(
    result.data &&
      typeof result.data === 'object' &&
      (result.data as Record<string, any>).actionType === 'academic_advice'
  );

  return (
    <div className="space-y-3.5 w-full">
      {/* 1. Speech bubble header with Voice Synthesizer audio button */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {result.intent}
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/60 border border-white/10">
            {result.tool}
          </span>
        </div>

        {onSpeak && (
          <button
            onClick={() => onSpeak(result.speechResponse)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-cyan-300 transition cursor-pointer flex items-center space-x-1 text-[11px]"
            title="Read aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[10px]">Readback</span>
          </button>
        )}
      </div>

      {/* 2. Conversational Voice Speech Summary */}
      <p className="text-sm font-sans text-white/90 leading-relaxed font-normal">
        {result.speechResponse}
      </p>

      {/* 3. Rich Visual Interactive Cards */}

      {/* CASE A: Study Plan with Visual Timeline & 1-Click Launch */}
      {isStudyPlan && (
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-cyan-500/30 shadow-lg space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {(result.data as any).focus_course || 'Focused Study Plan'}
                </h4>
                <span className="text-[10px] font-mono text-white/50">
                  {(result.data as any).total_minutes || 45} Minutes Total Session
                </span>
              </div>
            </div>

            {onStartTimer && (
              <button
                onClick={() =>
                  onStartTimer(
                    (result.data as any).blocks?.[0]?.duration_minutes || 25,
                    (result.data as any).focus_course || 'Coursework',
                    'Block 1 Deep Work'
                  )
                }
                className="px-3.5 py-1.5 rounded-full text-white font-semibold text-xs shadow-lg border border-white/20 flex items-center space-x-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition"
                style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Timer</span>
              </button>
            )}
          </div>

          {/* Timeline Blocks */}
          <div className="space-y-2 pt-1">
            {(result.data as any).blocks?.map((block: any, idx: number) => {
              const isStudy = block.type === 'study';
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    isStudy
                      ? 'bg-white/[0.04] border-white/10 text-white'
                      : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                        isStudy ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {block.order || idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block truncate">
                        {block.description}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono uppercase">
                        {isStudy ? 'Deep Focus Interval' : 'Cognitive Break'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/10 shrink-0">
                    {block.duration_minutes}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASE B: Timer Started Confirmation Card */}
      {isTimerStarted && (
        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/30 text-white space-y-2 shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pomodoro Focus Session Active</span>
          </div>
          <p className="text-xs text-white/70">
            The timer has been started for {(result.data as any).duration_minutes || 25} minutes on {(result.data as any).course || 'your course'}.
          </p>
          {onOpenPlanner && (
            <button
              onClick={onOpenPlanner}
              className="text-xs font-semibold text-cyan-300 hover:underline flex items-center space-x-1 pt-1 cursor-pointer"
            >
              <span>View Full Screen Timer in Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* CASE C: Interactive Task List */}
      {isTaskList && (
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10 shadow-lg space-y-2.5 mt-2">
          <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pending Assignments ({(result.data as any[]).length})</span>
            </span>
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="text-[11px] text-cyan-300 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {(result.data as any[]).map((task: any) => {
              const isChecked = completedTaskIds.includes(task.id) || task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 text-xs ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/25 line-through opacity-70'
                      : 'bg-white/[0.03] border-white/10 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <button
                      onClick={() => handleTaskCheck(task.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-white/20 hover:border-cyan-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </button>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-medium font-mono">
                        {task.course_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono text-[9px] font-bold uppercase">
                        High
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-white/50">
                      {task.due_date ? `Due ${task.due_date}` : 'No deadline'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASE D: Single Task Created Confirmation */}
      {isSingleTask && (
        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/25 shadow-lg space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assignment Created</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase border border-emerald-500/30">
              {(result.data as any).priority || 'Normal'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-1">
            <span className="font-bold text-white block">{(result.data as any).title}</span>
            <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
              <span>{(result.data as any).course_name || 'General'}</span>
              <span>Due {(result.data as any).due_date || 'Upcoming'}</span>
            </div>
          </div>
        </div>
      )}

      {/* CASE E: Next Action Recommendation Spotlight */}
      {isRecommendation && (
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-amber-500/30 shadow-lg space-y-3 mt-2">
          <div className="flex items-center space-x-2 text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Top Academic Priority</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-sm text-white">
                {(result.data as any).topTask?.title || 'Review course material'}
              </h5>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase">
                High Priority
              </span>
            </div>
            <p className="text-xs text-white/60">
              Course: <span className="text-white font-semibold">{(result.data as any).topTask?.course_name}</span> · Due {(result.data as any).topTask?.due_date}
            </p>
          </div>

          {onStartTimer && (
            <button
              onClick={() =>
                onStartTimer(
                  45,
                  (result.data as any).topTask?.course_name || 'Coursework',
                  (result.data as any).topTask?.title
                )
              }
              className="w-full py-2.5 rounded-full text-white font-semibold text-xs shadow-lg border border-white/20 flex items-center justify-center space-x-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition"
              style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Recommended 45m Focus Session</span>
            </button>
          )}
        </div>
      )}

      {/* CASE F: Academic Guidance & Tutoring Advice */}
      {isAcademicAdvice && (
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-cyan-500/30 shadow-lg space-y-3 mt-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300">
            <Sparkles className="w-4 h-4" />
            <span>Academic Concepts & Study Strategy</span>
          </div>

          {(result.data as any).keyPoints && (
            <div className="space-y-1.5">
              {(result.data as any).keyPoints.map((pt: string, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs flex items-start space-x-2 text-white/90"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CASE G: Course Mastery Progress */}
      {isProgressList && (
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10 shadow-lg space-y-2 mt-2">
          <span className="text-xs font-bold text-white block">Course Progress & Mastery</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(result.data as any[]).map((course: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-1.5"
              >
                <div className="flex justify-between font-bold text-white">
                  <span className="truncate">{course.course_name}</span>
                  <span className="font-mono text-cyan-300">{course.completed_pct}%</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${course.completed_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/50 font-mono">
                  <span>{course.completed_tasks}/{course.total_tasks} tasks</span>
                  <span>{course.hours_this_week} hrs this week</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Hackathon MCP JSON Inspector Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setShowMcpPayload(!showMcpPayload)}
          className="text-[11px] font-mono text-white/50 hover:text-cyan-300 flex items-center space-x-1.5 cursor-pointer transition-colors"
        >
          <Code2 className="w-3 h-3 text-cyan-400" />
          <span>{showMcpPayload ? 'Hide MCP Payload' : 'Inspect MCP Tool Payload'}</span>
        </button>

        {showMcpPayload && (
          <pre className="mt-2 p-3.5 rounded-2xl bg-black/80 text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto border border-white/15 max-h-48">
            {JSON.stringify(
              {
                tool: result.tool,
                intent: result.intent,
                arguments: result.arguments,
                data: result.data,
              },
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  );
};
