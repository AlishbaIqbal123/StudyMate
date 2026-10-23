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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#473C33]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#2E2620] border border-[#E6E0D0] dark:border-[#FEC868]/20 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-200">
        {/* Modal Header (Sage Green Banner like "Add Note" in Reference Image) */}
        <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-[#839758] to-[#ABC270] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white border border-white/25 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Add Assignment
              </h3>
              <p className="text-xs text-white/85 mt-0.5">
                Set deadlines, subject, and time estimates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-black/15 transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FDA769]/20 border border-[#FDA769]/40 text-[#944519] dark:text-[#FDA769] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Assignment Title */}
          <div>
            <label className="block text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1] mb-1.5">
              Title <span className="text-[#FDA769]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write the assignment title..."
              className="w-full bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#473C33] dark:text-[#FAF8F1] placeholder-[#87796B] focus:outline-none focus:border-[#ABC270] transition"
            />
          </div>

          {/* Course Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1]">
                Course / Subject <span className="text-[#FDA769]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCourse(!isCustomCourse)}
                className="text-[11px] font-semibold text-[#586738] dark:text-[#ABC270] hover:underline cursor-pointer"
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
                className="w-full bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#473C33] dark:text-[#FAF8F1] placeholder-[#87796B] focus:outline-none focus:border-[#ABC270] transition"
              />
            ) : (
              <div>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#473C33] dark:text-[#FAF8F1] focus:outline-none focus:border-[#ABC270] transition cursor-pointer"
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
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition cursor-pointer border ${
                          course === c.name
                            ? 'bg-[#ABC270] text-white border-[#839758] font-semibold'
                            : 'bg-[#FAF8F1] text-[#63574B] border-[#E6E0D0] hover:text-[#473C33] dark:bg-[#393028] dark:text-[#C2B2A1] dark:border-[#FEC868]/15'
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
              <label className="block text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1] mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#839758]" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-xl px-3 py-2 text-xs text-[#473C33] dark:text-[#FAF8F1] focus:outline-none focus:border-[#ABC270] transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1] mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FDA769]" />
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
                  className="w-18 bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 rounded-xl px-2.5 py-2 text-xs text-[#473C33] dark:text-[#FAF8F1] focus:outline-none focus:border-[#ABC270] transition font-mono text-center font-medium"
                />
                {/* Duration Chips */}
                <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
                  {durationPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstMinutes(mins)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer border ${
                        estMinutes === mins
                          ? 'bg-[#ABC270] text-white border-[#839758] font-semibold'
                          : 'bg-[#FAF8F1] text-[#63574B] hover:text-[#473C33] border-[#E6E0D0] dark:bg-[#393028] dark:text-[#C2B2A1] dark:border-[#FEC868]/15'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Priority Level & Color Swatch (Like "Color" selector in Reference Image) */}
          <div>
            <label className="block text-xs font-semibold text-[#473C33] dark:text-[#FAF8F1] mb-1.5 flex items-center space-x-1.5">
              <Flag className="w-3.5 h-3.5 text-[#839758]" />
              <span>Priority & Color</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Low', desc: 'Sage Green', dot: 'bg-[#ABC270]', badge: 'bg-[#ABC270]/20 text-[#45512C] dark:text-[#ABC270] border-[#ABC270]' },
                { id: 'medium', label: 'Medium', desc: 'Golden Amber', dot: 'bg-[#FEC868]', badge: 'bg-[#FEC868]/30 text-[#473C33] dark:text-[#FEC868] border-[#FEC868]' },
                { id: 'high', label: 'High', desc: 'Warm Coral', dot: 'bg-[#FDA769]', badge: 'bg-[#FDA769]/25 text-[#944519] dark:text-[#FDA769] border-[#FDA769]' },
              ].map(({ id, label, desc, dot, badge }) => {
                const isSelected = priority === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPriority(id as TaskPriority)}
                    className={`p-2.5 rounded-xl transition cursor-pointer border text-center flex flex-col items-center ${
                      isSelected
                        ? `${badge} font-semibold shadow-xs`
                        : 'bg-[#FAF8F1] dark:bg-[#393028] text-[#63574B] dark:text-[#C2B2A1] border-[#E6E0D0] dark:border-[#FEC868]/15 hover:text-[#473C33]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${dot} flex items-center justify-center text-[8px] text-white font-bold`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="text-xs">{label}</span>
                    </div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions Footer ("Save" Golden Button like Reference Image) */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-[#E6E0D0] dark:border-[#FEC868]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#63574B] hover:text-[#473C33] dark:text-[#C2B2A1] dark:hover:text-white rounded-xl bg-[#FAF8F1] dark:bg-[#393028] border border-[#E6E0D0] dark:border-[#FEC868]/15 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-xs font-bold text-[#473C33] bg-[#FEC868] hover:bg-[#F5B84D] rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : 'Save Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
