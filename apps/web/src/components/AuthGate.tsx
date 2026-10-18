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
  title = 'Sign In to Unlock',
  description = 'Create a free account or sign in to track study analytics, save your history, and sync across devices.',
  compact = false,
  feature,
}) => {
  const { isPreview, openClerkSignIn, openClerkSignUp, loginWithDemoAccount } = useAuth();

  // If user is authenticated, render the content directly
  if (!isPreview) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-3xl overflow-hidden group">
      {/* Blurred / muted background content */}
      <div className="pointer-events-none select-none blur-[6px] opacity-25 grayscale-[30%] transition-all">
        {children}
      </div>

      {/* Lock Gate Modern Obsidian Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070910]/85 backdrop-blur-md rounded-3xl border border-white/[0.10] shadow-2xl transition-all">
        <div className={`flex flex-col items-center max-w-md mx-auto ${compact ? 'gap-3' : 'gap-4'}`}>
          {/* Lock icon with indigo ambient glow */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-indigo-500/25 blur-md" />
            <div
              className={`relative rounded-2xl bg-[#0F1322] border border-white/[0.14] flex items-center justify-center text-indigo-400 shadow-md ${
                compact ? 'w-10 h-10' : 'w-12 h-12'
              }`}
            >
              <Lock className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            </div>
          </div>

          <div>
            {feature && (
              <span className="inline-block font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider mb-2">
                {feature}
              </span>
            )}
            <h3 className={`font-sans font-bold tracking-tight text-white ${compact ? 'text-sm' : 'text-base'}`}>
              {title}
            </h3>
            <p className={`text-slate-400 leading-relaxed max-w-xs mx-auto ${compact ? 'text-[11px] mt-0.5' : 'text-xs mt-1.5'}`}>
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-2 pt-1 ${compact ? 'flex-col w-full max-w-xs' : 'flex-row'}`}>
            <button
              type="button"
              onClick={openClerkSignIn}
              className="w-full sm:w-auto pl-5 pr-2 py-2 rounded-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
            >
              <span>Sign In with Clerk</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginWithDemoAccount()}
              className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Instant bypass for sandbox testing"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scholar Bypass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
