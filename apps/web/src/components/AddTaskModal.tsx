import React, { useState } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import type { Course, TaskPriority } from '@studymate/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    title: string;
    course: string;
    due_date?: string;
    est_minutes?: number;
    priority?: TaskPriority;
  }) => Promise<void>;
  courses: Course[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  courses,
}) => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState(courses[0]?.name || '');
  const [customCourse, setCustomCourse] = useState('');
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [estMinutes, setEstMinutes] = useState(45);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourse = isCustomCourse ? customCourse.trim() : course.trim();
    if (!title.trim()) {
      setErrorMsg('Please enter an assignment title');
      return;
    }
    if (!finalCourse) {
      setErrorMsg('Please select or specify a course');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await onAdd({
        title: title.trim(),
        course: finalCourse,
        due_date: dueDate || undefined,
        est_minutes: estMinutes,
        priority,
      });
      setTitle('');
      setCustomCourse('');
      setIsCustomCourse(false);
      setDueDate('');
      setEstMinutes(45);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const durationPresets = [25, 45, 60, 90, 120];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Obsidian Glass / Ivory Card Modal Dialog */}
      <div className="rounded-3xl w-full max-w-lg bg-white dark:bg-[#0c0c14]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.9)] ring-1 ring-slate-900/5 dark:ring-white/10 relative overflow-hidden transition-all duration-200">
        {/* Top Accent Gradient Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-400/20 text-blue-600 dark:text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Create New Assignment
              </h3>
              <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                Organize your study goals, deadlines, and time estimates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Assignment Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider mb-1.5">
              Assignment Title <span className="text-rose-500 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem Set 4: Dynamic Programming or Lab Report"
              className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-white/[0.07] transition font-sans"
            />
          </div>

          {/* Course Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider">
                Course / Subject <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCourse(!isCustomCourse)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-300 dark:hover:text-cyan-200 hover:underline cursor-pointer transition"
              >
                {isCustomCourse ? '← Pick from list' : '+ Type custom subject'}
              </button>
            </div>

            {isCustomCourse ? (
              <input
                type="text"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="e.g. Cognitive Neuroscience, Spanish Literature"
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-white/[0.07] transition font-sans"
              />
            ) : (
              <div>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c0c14] border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition font-sans cursor-pointer"
                >
                  {courses.length === 0 && (
                    <option value="" className="bg-white dark:bg-[#0c0c12] text-slate-400 dark:text-white/50">No registered courses yet</option>
                  )}
                  {courses.map((c) => (
                    <option key={c.id} value={c.name} className="bg-white dark:bg-[#0c0c12] text-slate-900 dark:text-white">
                      {c.code ? `${c.code} — ${c.name}` : c.name}
                    </option>
                  ))}
                </select>

                {/* Quick Course Selector Chips */}
                {courses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {courses.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourse(c.name)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer border ${
                          course === c.name
                            ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/40 shadow-sm'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/[0.04] dark:text-white/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {c.code || c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Due Date & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Est. Minutes ({estMinutes}m)</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={10}
                  max={480}
                  step={5}
                  value={estMinutes}
                  onChange={(e) => setEstMinutes(parseInt(e.target.value, 10) || 30)}
                  className="w-20 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition font-mono text-center font-bold"
                />
                {/* Duration Chips */}
                <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
                  {durationPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstMinutes(mins)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        estMinutes === mins
                          ? 'bg-gradient-to-b from-[#2B2B2B] to-[#101010] border border-white/30 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-white border border-transparent'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Flag className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Priority Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'low', label: 'Low', desc: 'Relaxed pace', activeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-sm' },
                { id: 'medium', label: 'Medium', desc: 'Standard', activeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-sm' },
                { id: 'high', label: 'High', desc: 'Urgent focus', activeClass: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40 shadow-sm' },
              ].map(({ id, label, desc, activeClass }) => {
                const isSelected = priority === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPriority(id as TaskPriority)}
                    className={`p-2.5 rounded-2xl transition cursor-pointer border text-center ${
                      isSelected
                        ? activeClass
                        : 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-white/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {label}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5">
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              className="px-6 py-2.5 text-xs font-bold text-white rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{loading ? 'Creating...' : 'Add Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

