import React, { useState } from 'react';
import {
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  BarChart3,
  Terminal,
  Code2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface McpToolsSectionProps {
  onOpenTelemetry: () => void;
  onOpenVoice: () => void;
}

export const McpToolsSection: React.FC<McpToolsSectionProps> = ({
  onOpenTelemetry,
  onOpenVoice,
}) => {
  const [activeToolIndex, setActiveToolIndex] = useState(0);

  const tools = [
    {
      id: 'get_tasks',
      name: 'get_tasks',
      title: 'Query Tasks & Deadlines',
      icon: Calendar,
      accent: 'from-blue-500 to-cyan-500',
      description:
        'Retrieves student assignments with granular filtering by course name, pending status, or dynamic date windows (today, tomorrow, next 7 days).',
      naturalPhrase: "Alexa, what's due this week for Algorithms?",
      inputSchema: {
        type: 'object',
        properties: {
          course: { type: 'string', description: 'Filter by course name (optional)' },
          due_before: { type: 'string', format: 'date', description: 'YYYY-MM-DD cutoff' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
        },
      },
    },
    {
      id: 'add_task',
      name: 'add_task',
      title: 'Voice Assignment Capture',
      icon: PlusCircle,
      accent: 'from-cyan-500 to-sky-500',
      description:
        'Parses voice parameters to create an academic task with course mapping, due dates, estimated effort, and priority level.',
      naturalPhrase: 'Alexa, add a task: finish OS assignment, due Monday, high priority',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          course: { type: 'string' },
          due_date: { type: 'string', format: 'date' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          est_minutes: { type: 'integer' },
        },
        required: ['title', 'course'],
      },
    },
    {
      id: 'create_study_plan',
      name: 'create_study_plan',
      title: 'Adaptive Pomodoro Planner',
      icon: Clock,
      accent: 'from-purple-500 to-indigo-500',
      description:
        'Generates optimal focus intervals (25–45 min) combined with structured cognitive breaks tailored to the student’s available minutes tonight.',
      naturalPhrase: 'Alexa, I have 90 minutes tonight, help me study',
      inputSchema: {
        type: 'object',
        properties: {
          available_minutes: { type: 'integer' },
          course: { type: 'string' },
        },
        required: ['available_minutes'],
      },
    },
    {
      id: 'update_progress',
      name: 'update_progress',
      title: 'Completion & Velocity Sync',
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-teal-500',
      description:
        'Marks tasks as completed, logs session duration, and triggers automatic recalculation of course completion percentages.',
      naturalPhrase: 'Alexa, I finished my linear algebra homework',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: { type: 'integer' },
          status: { type: 'string', enum: ['done', 'in_progress'] },
          minutes_spent: { type: 'integer' },
        },
        required: ['task_id', 'status'],
      },
    },
    {
      id: 'get_course_progress',
      name: 'get_course_progress',
      title: 'Holistic Academic Analytics',
      icon: BarChart3,
      accent: 'from-amber-500 to-orange-500',
      description:
        'Synthesizes overall coursework completion percentages, pending vs completed ratios, and total weekly hours studied.',
      naturalPhrase: 'Alexa, how am I doing in Algorithms?',
      inputSchema: {
        type: 'object',
        properties: {
          course: { type: 'string' },
        },
      },
    },
  ];

  const currentTool = tools[activeToolIndex];

  return (
    <section id="mcp-tools" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Model Context Protocol Specification</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Five Official MCP Tools Exposed to Alexa+
        </h2>
        <p className="text-slate-300 text-base sm:text-lg">
          During dialogue, Alexa+ dynamically discovers tool definitions via{' '}
          <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded text-sm font-mono">
            POST /mcp
          </code>{' '}
          and binds them into conversational turns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tool Selector Tabs */}
        <div className="lg:col-span-5 space-y-3">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            const isActive = idx === activeToolIndex;

            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolIndex(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'glass-panel-glow border-cyan-500/50 shadow-xl shadow-cyan-950/40 text-white'
                    : 'glass-panel border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-cyan-400 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-cyan-400 font-bold block">
                      {tool.name}
                    </span>
                    <span className="font-bold text-sm text-white truncate block">
                      {tool.title}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-1 rounded-md font-semibold ${
                      isActive ? 'bg-cyan-400/20 text-cyan-200' : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Tool Inspector Panel */}
        <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Active Tool Schema
              </span>
              <h3 className="text-2xl font-bold text-white font-mono">{currentTool.name}</h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>JSON Schema Ready</span>
              </span>
            </div>
          </div>

          <div className="py-6 space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Operational Description:
              </span>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                {currentTool.description}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Natural Language Invocations:
              </span>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm font-medium text-cyan-300 italic">
                "{currentTool.naturalPhrase}"
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Input JSON Schema:
                </span>
                <span className="text-[11px] font-mono text-slate-500">MCP SDK Compliant</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(currentTool.inputSchema, null, 2)}
              </pre>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onOpenTelemetry}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Inspect Full Server Telemetry & Inspector</span>
            </button>

            <button
              onClick={onOpenVoice}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Test This Tool in Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
