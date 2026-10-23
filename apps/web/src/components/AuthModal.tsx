import React from 'react';
import {
  X,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';
import { useAuth } from '../context/AuthContext.js';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    upgradeReason,
    authModalMode,
    setAuthModalMode,
    loginWithDemoAccount,
  } = useAuth();

  if (!isAuthModalOpen) return null;

  const handleBypassAsScholar = async () => {
    await loginWithDemoAccount();
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-foreground border border-border mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            {upgradeReason === 'task-limit'
              ? 'Preview Quota Reached'
              : upgradeReason === 'alexa-link'
              ? 'Pair Alexa Device'
              : 'Sign in to StudyMate'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
            {upgradeReason === 'task-limit'
              ? 'You have reached the preview task limit. Sign in to sync unlimited coursework.'
              : upgradeReason === 'alexa-link'
              ? 'Authenticate to link voice study habits with your account.'
              : 'Sign in to sync your deadlines, study sessions, and course progress.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex items-center p-1 rounded-lg bg-muted border border-border text-xs mt-4">
            <button
              type="button"
              onClick={() => setAuthModalMode('sign-in')}
              className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                authModalMode === 'sign-in'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('sign-up')}
              className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                authModalMode === 'sign-up'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Embedded Clerk Authentication Form */}
        <div className="relative z-10 flex justify-center py-2 min-h-[280px]">
          {authModalMode === 'sign-in' ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none p-0 w-full border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-muted hover:bg-muted/80 border-border text-foreground text-xs py-2 rounded-lg transition cursor-pointer',
                  formButtonPrimary:
                    'bg-foreground hover:bg-foreground/90 text-background text-xs font-medium py-2 rounded-lg transition cursor-pointer',
                  formFieldInput:
                    'bg-background border-border text-foreground text-xs rounded-lg focus:ring-1 focus:ring-primary',
                  formFieldLabel: 'text-foreground text-xs font-medium',
                  footerActionText: 'text-muted-foreground text-xs',
                  footerActionLink: 'text-primary hover:underline text-xs cursor-pointer',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground text-[11px]',
                },
              }}
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none p-0 w-full border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-muted hover:bg-muted/80 border-border text-foreground text-xs py-2 rounded-lg transition cursor-pointer',
                  formButtonPrimary:
                    'bg-foreground hover:bg-foreground/90 text-background text-xs font-medium py-2 rounded-lg transition cursor-pointer',
                  formFieldInput:
                    'bg-background border-border text-foreground text-xs rounded-lg focus:ring-1 focus:ring-primary',
                  formFieldLabel: 'text-foreground text-xs font-medium',
                  footerActionText: 'text-muted-foreground text-xs',
                  footerActionLink: 'text-primary hover:underline text-xs cursor-pointer',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground text-[11px]',
                },
              }}
            />
          )}
        </div>

        {/* Quick Scholar Sandbox Access Bypass */}
        <div className="pt-4 mt-3 border-t border-border text-center relative z-10 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Evaluating without an account?
          </p>
          <button
            type="button"
            onClick={handleBypassAsScholar}
            className="w-full py-2 px-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium border border-border transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Continue in Sandbox Demo Mode</span>
          </button>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-[11px] text-muted-foreground hover:text-foreground transition cursor-pointer pt-0.5 block mx-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
