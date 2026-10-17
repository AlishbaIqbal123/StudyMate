import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  compact?: boolean;
  feature?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  children,
  title = 'Sign In to Unlock',
  description = 'Create a free account or sign in to track study analytics, save your history, and sync across devices.',
  compact = false,
  feature,
}) => {
  const { isPreview, openClerkSignIn, openClerkSignUp } = useAuth();

  // If user is authenticated, render the content directly
  if (!isPreview) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-3xl overflow-hidden group">
      {/* Blurred / muted background content */}
      <div className="pointer-events-none select-none blur-[6px] opacity-30 dark:opacity-25 grayscale-[30%] transition-all">
        {children}
      </div>

      {/* Lock Gate Glassmorphic Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white/70 dark:bg-[#060a12]/80 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl transition-all">
        <div className={`flex flex-col items-center max-w-md mx-auto ${compact ? 'gap-2.5' : 'gap-4'}`}>
          {/* Lock icon with subtle pulse ring */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 opacity-25 blur-sm" />
            <div className={`relative rounded-2xl bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-800 dark:text-white shadow-md ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}>
              <Lock className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-blue-600 dark:text-cyan-400`} />
            </div>
          </div>

          <div>
            {feature && (
              <span className="inline-block font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20 uppercase tracking-wider mb-2">
                {feature}
              </span>
            )}
            <h3 className={`font-bold tracking-tight text-slate-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
              {title}
            </h3>
            <p className={`text-slate-600 dark:text-white/60 leading-relaxed ${compact ? 'text-[11px] mt-0.5' : 'text-xs mt-1.5'}`}>
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-2.5 pt-1 ${compact ? 'flex-col w-full max-w-xs' : 'flex-row'}`}>
            <button
              type="button"
              onClick={openClerkSignIn}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-white transition shadow-lg border border-transparent dark:border-white/20 active:scale-95 hover:opacity-90 flex items-center justify-center space-x-1.5 cursor-pointer bg-[#E5A952] text-[#0E1117] hover:bg-[#F2BC66]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openClerkSignUp}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] border border-slate-300 dark:border-white/20 transition cursor-pointer"
            >
              <span>Sign Up Free</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
