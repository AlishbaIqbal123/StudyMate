import React from 'react';
import {
  BrainCircuit,
  Code2,
  LineChart,
  UserCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  DEMO_STUDENTS,
  type StudentProfile,
} from '../../api.js';
import { useAuth } from '../../context/AuthContext.js';

interface StudentPersonasSectionProps {
  onStudentChanged: () => void;
  onOpenDashboard: () => void;
}

export const StudentPersonasSection: React.FC<StudentPersonasSectionProps> = ({
  onStudentChanged,
  onOpenDashboard,
}) => {
  const { user, loginWithPersona } = useAuth();
  const currentStudentId = Number(user?.id) || 1;

  const getStudentMeta = (id: number) => {
    switch (id) {
      case 1:
        return {
          icon: BrainCircuit,
          accent: 'from-blue-500 to-cyan-500',
          badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/60',
          courses: ['CS 301 Algorithms', 'CS 420 Distributed Systems', 'MATH 240 Linear Algebra'],
          highlight: 'Managing complex algorithmic proofs & consensus protocols',
        };
      case 2:
        return {
          icon: Code2,
          accent: 'from-emerald-500 to-teal-500',
          badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/60',
          courses: ['CS 210 Data Structures', 'CS 350 Operating Systems', 'PHYS 150 Mechanics'],
          highlight: 'Balancing systems kernel programming with lab reports',
        };
      case 3:
      default:
        return {
          icon: LineChart,
          accent: 'from-purple-500 to-indigo-500',
          badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-950/60',
          courses: ['STAT 400 Mathematical Statistics', 'CS 480 Deep Learning', 'MATH 310 Abstract Algebra'],
          highlight: 'Executing graduate statistical modeling & neural network training',
        };
    }
  };

  const handleSelect = async (id: number) => {
    await loginWithPersona(id);
    onStudentChanged();
  };

  return (
    <section id="personas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-Student Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Tailored for Every Major and Study Style
        </h2>
        <p className="text-slate-300 text-base sm:text-lg">
          StudyMate dynamically partitions courses, syllabus weights, and study habits. Switch
          between profiles to observe how the AI customizes study blocks for each student.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {DEMO_STUDENTS.map((student) => {
          const isSelected = currentStudentId === student.id;
          const meta = getStudentMeta(student.id);
          const Icon = meta.icon;

          return (
            <div
              key={student.id}
              onClick={() => handleSelect(student.id)}
              className={`group cursor-pointer rounded-3xl p-7 border transition-all duration-300 relative flex flex-col justify-between ${
                isSelected
                  ? 'glass-panel-glow border-cyan-500/50 shadow-2xl shadow-cyan-950/50 transform -translate-y-1.5'
                  : 'glass-panel border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                {/* Header Icon & Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${meta.accent} p-[1px] shadow-lg`}>
                    <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 hover:text-slate-400">
                      Click to Select
                    </span>
                  )}
                </div>

                {/* Identity */}
                <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
                <p className="text-xs font-semibold text-cyan-400 mb-3">{student.major}</p>

                <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">
                  "{meta.highlight}"
                </p>

                {/* Enrolled Courses */}
                <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Active Courses Tracked:
                  </span>
                  <div className="space-y-1.5">
                    {meta.courses.map((course) => (
                      <div
                        key={course}
                        className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(student.id);
                    onOpenDashboard();
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isSelected
                      ? `Launch Dashboard as ${student.name.split(' ')[0]}`
                      : `Switch to ${student.name.split(' ')[0]}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
