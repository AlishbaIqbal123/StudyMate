import React from 'react';
import {
  X,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
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
    isClerkLoaded,
    loginWithDemoAccount,
  } = useAuth();

  if (!isAuthModalOpen) return null;

  const handleBypassAsScholar = async () => {
    await loginWithDemoAccount();
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E121E] border border-white/[0.12] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] p-6 sm:p-7 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Ambient violet-indigo glow mesh */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 mb-3 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight">
            {upgradeReason === 'task-limit'
              ? 'Preview Quota Reached'
              : upgradeReason === 'alexa-link'
              ? 'Pair Alexa+ Hardware'
              : 'StudyMate Student Access'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {upgradeReason === 'task-limit'
              ? 'You have used all 5 tasks in the Academic Preview Pass. Sign in to unlock unlimited coursework.'
              : upgradeReason === 'alexa-link'
              ? 'Pair physical Amazon Echo devices with end-to-end encrypted student authentication.'
              : 'Sign in with your student account to sync deadlines, unlock pacing analytics, and save focus logs.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/[0.05] border border-white/10 text-xs mt-4">
            <button
              type="button"
              onClick={() => setAuthModalMode('sign-in')}
              className={`px-4 py-1.5 rounded-full transition font-semibold cursor-pointer ${
                authModalMode === 'sign-in'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('sign-up')}
              className={`px-4 py-1.5 rounded-full transition font-semibold cursor-pointer ${
                authModalMode === 'sign-up'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Embedded Clerk Authentication Form */}
        <div className="relative z-10 flex justify-center py-2 min-h-[300px]">
          {authModalMode === 'sign-in' ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none p-0 w-full border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-white text-xs py-2.5 rounded-xl transition cursor-pointer',
                  formButtonPrimary:
                    'bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer',
                  formFieldInput:
                    'bg-white/[0.04] border-white/10 text-white text-xs rounded-xl focus:border-indigo-400',
                  formFieldLabel: 'text-slate-300 text-xs font-medium',
                  footerActionText: 'text-slate-400 text-xs',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-slate-400 text-[11px]',
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
                    'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-white text-xs py-2.5 rounded-xl transition cursor-pointer',
                  formButtonPrimary:
                    'bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer',
                  formFieldInput:
                    'bg-white/[0.04] border-white/10 text-white text-xs rounded-xl focus:border-indigo-400',
                  formFieldLabel: 'text-slate-300 text-xs font-medium',
                  footerActionText: 'text-slate-400 text-xs',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-slate-400 text-[11px]',
                },
              }}
            />
          )}
        </div>

        {/* Quick Scholar Sandbox Access Bypass */}
        <div className="pt-4 mt-4 border-t border-white/10 text-center relative z-10 space-y-2">
          <p className="text-[11px] text-slate-400">
            Testing without Clerk credentials right now?
          </p>
          <button
            type="button"
            onClick={handleBypassAsScholar}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-indigo-300 hover:text-indigo-200 text-xs font-semibold border border-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Continue as Verified Scholar (One-Click Sandbox)</span>
          </button>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition cursor-pointer pt-1"
          >
            Close & Continue in Preview Mode
          </button>
        </div>
      </div>
    </div>
  );
};
