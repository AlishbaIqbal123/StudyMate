import React, { useState } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl relative overflow-hidden transition-all duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-muted text-foreground border border-border flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Create Assignment
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set deadlines, subject, and time estimates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Assignment Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem Set 4: Dynamic Programming"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Course Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-foreground">
                Course / Subject <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCourse(!isCustomCourse)}
                className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                {isCustomCourse ? 'Pick from existing' : '+ Custom subject'}
              </button>
            </div>

            {isCustomCourse ? (
              <input
                type="text"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="e.g. Cognitive Neuroscience"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
            ) : (
              <div>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition cursor-pointer"
                >
                  {courses.length === 0 && (
                    <option value="">No registered courses yet</option>
                  )}
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.code ? `${c.code} — ${c.name}` : c.name}
                    </option>
                  ))}
                </select>

                {/* Course Selector Chips */}
                {courses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {courses.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourse(c.name)}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition cursor-pointer border ${
                          course === c.name
                            ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                            : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
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
              <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Estimated Time ({estMinutes}m)</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={10}
                  max={480}
                  step={5}
                  value={estMinutes}
                  onChange={(e) => setEstMinutes(parseInt(e.target.value, 10) || 30)}
                  className="w-18 bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition font-mono text-center font-medium"
                />
                {/* Duration Chips */}
                <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
                  {durationPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstMinutes(mins)}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                        estMinutes === mins
                          ? 'bg-foreground text-background border-foreground font-semibold'
                          : 'bg-muted text-muted-foreground hover:text-foreground border-border'
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
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center space-x-1.5">
              <Flag className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Priority Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Low', desc: 'Flexible', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
                { id: 'medium', label: 'Medium', desc: 'Standard', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
                { id: 'high', label: 'High', desc: 'Urgent', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
              ].map(({ id, label, desc, badge }) => {
                const isSelected = priority === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPriority(id as TaskPriority)}
                    className={`p-2.5 rounded-lg transition cursor-pointer border text-center ${
                      isSelected
                        ? `${badge} font-medium shadow-xs`
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg bg-muted hover:bg-muted/80 border border-border transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium text-background bg-foreground hover:bg-foreground/90 rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Create Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
