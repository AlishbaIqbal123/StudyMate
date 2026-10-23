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
  title = 'Sign in to access',
  description = 'Create a free account or sign in to track study analytics, save history, and sync progress.',
  compact = false,
  feature,
}) => {
  const { isPreview, openClerkSignIn, loginWithDemoAccount } = useAuth();

  // If user is authenticated, render the content directly
  if (!isPreview) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-xl overflow-hidden group">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-[5px] opacity-25 grayscale-[20%] transition-all">
        {children}
      </div>

      {/* Lock Gate Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-background/85 backdrop-blur-sm rounded-xl border border-border transition-all">
        <div className={`flex flex-col items-center max-w-md mx-auto ${compact ? 'gap-2.5' : 'gap-3.5'}`}>
          <div
            className={`rounded-lg bg-muted border border-border flex items-center justify-center text-foreground ${
              compact ? 'w-9 h-9' : 'w-10 h-10'
            }`}
          >
            <Lock className={compact ? 'w-4 h-4' : 'w-4 h-4 text-muted-foreground'} />
          </div>

          <div>
            {feature && (
              <span className="inline-block font-mono text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase tracking-wider mb-2">
                {feature}
              </span>
            )}
            <h3 className={`font-semibold tracking-tight text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
              {title}
            </h3>
            <p className={`text-muted-foreground leading-relaxed max-w-xs mx-auto ${compact ? 'text-[11px] mt-0.5' : 'text-xs mt-1'}`}>
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-2 pt-1 ${compact ? 'flex-col w-full max-w-xs' : 'flex-row'}`}>
            <button
              type="button"
              onClick={openClerkSignIn}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-medium text-background bg-foreground hover:bg-foreground/90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => loginWithDemoAccount()}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border border-border transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Instant bypass for sandbox testing"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Sandbox Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
