import React, { useState } from 'react';
import {
  Volume2,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  Target,
  Code2,
  ChevronRight,
  ArrowRight,
  Check,
  BookOpen,
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
    <div className="space-y-3 w-full">
      {/* 1. Header with Tool & Intent metadata */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {result.intent}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {result.tool}
          </span>
        </div>

        {onSpeak && (
          <button
            onClick={() => onSpeak(result.speechResponse)}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center space-x-1 text-[11px]"
            title="Read aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[10px]">Readback</span>
          </button>
        )}
      </div>

      {/* 2. Conversational Voice Speech Summary */}
      <p className="text-xs text-foreground leading-relaxed">
        {result.speechResponse}
      </p>

      {/* 3. Rich Visual Interactive Cards */}

      {/* CASE A: Study Plan with Timeline & 1-Click Launch */}
      {isStudyPlan && (
        <div className="rounded-lg p-3.5 bg-card border border-border space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-md bg-muted border border-border flex items-center justify-center text-foreground">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  {(result.data as any).focus_course || 'Study Plan'}
                </h4>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {(result.data as any).total_minutes || 45} mins total
                </span>
              </div>
            </div>

            {onStartTimer && (
              <button
                onClick={() =>
                  onStartTimer(
                    (result.data as any).blocks?.[0]?.duration_minutes || 25,
                    (result.data as any).focus_course || 'Coursework',
                    'Block 1 Focus'
                  )
                }
                className="px-3 py-1 rounded-md text-background bg-foreground hover:bg-foreground/90 font-medium text-xs flex items-center space-x-1.5 cursor-pointer transition shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Timer</span>
              </button>
            )}
          </div>

          {/* Timeline Blocks */}
          <div className="space-y-1.5 pt-1">
            {(result.data as any).blocks?.map((block: any, idx: number) => {
              const isStudy = block.type === 'study';
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-md border text-xs flex items-center justify-between gap-3 ${
                    isStudy
                      ? 'bg-muted/30 border-border text-foreground'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-5 h-5 rounded flex items-center justify-center font-mono font-medium text-[10px] shrink-0 bg-muted border border-border text-foreground">
                      {block.order || idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground block truncate">
                        {block.description}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">
                        {isStudy ? 'Focus Interval' : 'Break'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
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
        <div className="rounded-lg p-3 bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Focus Timer Started</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Timer set for {(result.data as any).duration_minutes || 25} minutes for {(result.data as any).course || 'your coursework'}.
          </p>
          {onOpenPlanner && (
            <button
              onClick={onOpenPlanner}
              className="text-xs font-medium text-primary hover:underline flex items-center space-x-1 pt-1 cursor-pointer"
            >
              <span>View in Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* CASE C: Interactive Task List */}
      {isTaskList && (
        <div className="rounded-lg p-3 bg-card border border-border space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Pending Assignments ({(result.data as any[]).length})</span>
            </span>
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="text-[11px] text-primary hover:underline flex items-center space-x-0.5 cursor-pointer font-medium"
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {(result.data as any[]).map((task: any) => {
              const isChecked = completedTaskIds.includes(task.id) || task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`p-2 rounded-md border transition-all flex items-center justify-between gap-2 text-xs ${
                    isChecked
                      ? 'bg-muted/40 border-border line-through opacity-60'
                      : 'bg-background border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <button
                      onClick={() => handleTaskCheck(task.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isChecked
                          ? 'bg-primary border-primary text-background'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </button>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground block truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {task.course_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {task.priority === 'high' && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono text-[9px] font-medium uppercase">
                        High
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground">
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
        <div className="rounded-lg p-3 bg-card border border-border space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assignment Created</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium uppercase">
              {(result.data as any).priority || 'Normal'}
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-muted/40 border border-border text-xs space-y-1">
            <span className="font-semibold text-foreground block">{(result.data as any).title}</span>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>{(result.data as any).course_name || 'General'}</span>
              <span>Due {(result.data as any).due_date || 'Upcoming'}</span>
            </div>
          </div>
        </div>
      )}

      {/* CASE E: Next Action Recommendation Spotlight */}
      {isRecommendation && (
        <div className="rounded-lg p-3.5 bg-card border border-border space-y-3 mt-2">
          <div className="flex items-center space-x-1.5 text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span>Recommended Focus</span>
          </div>

          <div className="p-3 rounded-md bg-muted/40 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-xs text-foreground">
                {(result.data as any).topTask?.title || 'Review course material'}
              </h5>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium uppercase">
                High Priority
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Course: <span className="text-foreground font-medium">{(result.data as any).topTask?.course_name}</span> · Due {(result.data as any).topTask?.due_date}
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
              className="w-full py-1.5 rounded-md text-background bg-foreground hover:bg-foreground/90 font-medium text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start 45m Focus Session</span>
            </button>
          )}
        </div>
      )}

      {/* CASE F: Academic Guidance & Tutoring Advice */}
      {isAcademicAdvice && (
        <div className="rounded-lg p-3.5 bg-card border border-border space-y-2 mt-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Key Study Points</span>
          </div>

          {(result.data as any).keyPoints && (
            <div className="space-y-1.5">
              {(result.data as any).keyPoints.map((pt: string, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded-md bg-muted/40 border border-border text-xs flex items-start space-x-2 text-foreground"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CASE G: Course Progress */}
      {isProgressList && (
        <div className="rounded-lg p-3.5 bg-card border border-border space-y-2 mt-2">
          <span className="text-xs font-semibold text-foreground block">Course Progress</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(result.data as any[]).map((course: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-md bg-muted/30 border border-border text-xs space-y-1.5"
              >
                <div className="flex justify-between font-medium text-foreground">
                  <span className="truncate">{course.course_name}</span>
                  <span className="font-mono text-primary tabular-nums">{course.completed_pct}%</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${course.completed_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{course.completed_tasks}/{course.total_tasks} tasks</span>
                  <span>{course.hours_this_week} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MCP JSON Inspector Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setShowMcpPayload(!showMcpPayload)}
          className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer transition-colors"
        >
          <Code2 className="w-3 h-3 text-muted-foreground" />
          <span>{showMcpPayload ? 'Hide MCP Payload' : 'Inspect MCP Tool Payload'}</span>
        </button>

        {showMcpPayload && (
          <pre className="mt-2 p-3 rounded-md bg-muted text-foreground font-mono text-[10px] leading-relaxed overflow-x-auto border border-border max-h-48">
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
