import React from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
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
  title = 'Sign in to unlock full analytics',
  description = 'Sign in with Clerk or Google SSO to track study sessions, save history, and sync progress.',
  compact = false,
  feature,
}) => {
  const { isPreview, openClerkSignIn, loginWithDemoAccount } = useAuth();

  if (!isPreview) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-[5px] opacity-25 grayscale-[20%] transition-all">
        {children}
      </div>

      {/* Lock Gate Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white/90 dark:bg-[#0D111A]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 transition-all shadow-xl">
        <div className={`flex flex-col items-center max-w-md mx-auto ${compact ? 'gap-2.5' : 'gap-3.5'}`}>
          <div
            className={`rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/25 flex items-center justify-center text-[#0052FF] dark:text-blue-400 shadow-xs ${
              compact ? 'w-9 h-9' : 'w-11 h-11'
            }`}
          >
            <Lock className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>

          <div>
            {feature && (
              <span className="inline-block font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0052FF]/10 text-[#0052FF] dark:text-blue-400 border border-[#0052FF]/20 uppercase tracking-wider mb-2">
                {feature}
              </span>
            )}
            <h3 className={`font-bold tracking-tight text-slate-900 dark:text-white ${compact ? 'text-xs' : 'text-base'}`}>
              {title}
            </h3>
            <p className={`text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto ${compact ? 'text-[11px] mt-0.5' : 'text-xs mt-1'}`}>
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-2.5 pt-1 ${compact ? 'flex-col w-full max-w-xs' : 'flex-row'}`}>
            <button
              type="button"
              onClick={openClerkSignIn}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0052FF] hover:bg-[#0045D8] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <span>Sign In with Clerk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => loginWithDemoAccount()}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Instant bypass for sandbox testing"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF] dark:text-blue-400" />
              <span>Demo Scholar Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
