import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Radio,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    upgradeReason,
    openClerkSignIn,
    openClerkSignUp,
    user,
    isAuthenticated,
  } = useAuth();

  if (!isAuthModalOpen) return null;

  const handleSignIn = () => {
    closeAuthModal();
    openClerkSignIn();
  };

  const handleSignUp = () => {
    closeAuthModal();
    openClerkSignUp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-app-card border border-app-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow decorative blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-app-muted hover:text-app-text hover:bg-app-subtle transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 mb-3 shadow-sm shadow-cyan-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-headline font-bold text-app-text">
            {upgradeReason === 'task-limit'
              ? 'Preview Quota Reached'
              : upgradeReason === 'alexa-link'
              ? 'Pair Alexa+ Hardware'
              : 'StudyMate Student Access'}
          </h2>
          <p className="text-xs text-app-muted mt-1 max-w-xs mx-auto">
            {upgradeReason === 'task-limit'
              ? 'You have used all 5 tasks in the Academic Preview Pass. Create a free account to unlock unlimited coursework.'
              : upgradeReason === 'alexa-link'
              ? 'Linking physical Amazon Echo and Alexa+ devices via OAuth 2.1 PKCE requires a verified student profile.'
              : 'You are currently using the Academic Preview Pass. Sign in or register to enable persistent cloud sync.'}
          </p>
        </div>

        {/* Comparison Tier Grid */}
        <div className="space-y-2 mb-6">
          <div className="p-3 rounded-xl bg-app-subtle/60 border border-app-border text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-medium text-app-text">Academic Preview Pass</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">Active (Sandbox)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-cyan-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Scholar Account</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                100% Free
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-app-muted pl-1">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Unlimited courses, assignments & study sessions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Pair physical Echo smart speakers via OAuth 2.1 PKCE</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Encrypted cross-device cloud sync with Clerk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In with Clerk</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>

          <button
            onClick={handleSignUp}
            className="w-full py-2.5 px-4 rounded-xl bg-app-subtle hover:bg-app-border text-app-text font-headline font-semibold text-xs border border-app-border flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <span>Create Free Student Account</span>
          </button>

          <button
            onClick={closeAuthModal}
            className="w-full py-2 text-center text-[11px] text-app-muted hover:text-app-text transition cursor-pointer"
          >
            Continue in Academic Preview Mode
          </button>
        </div>
      </div>
    </div>
  );
};
