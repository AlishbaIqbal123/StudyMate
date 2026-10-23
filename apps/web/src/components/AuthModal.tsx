import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  GraduationCap,
  Radio,
  LogOut,
} from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    upgradeReason,
    authModalMode,
    setAuthModalMode,
    loginWithDemoAccount,
    toggleAlexaAccountLinking,
    logout,
  } = useAuth();
  const { theme } = useTheme();

  const [activeSection, setActiveSection] = useState<'auth' | 'alexa'>('auth');

  useEffect(() => {
    if (upgradeReason === 'alexa-link') {
      setActiveSection('alexa');
    } else {
      setActiveSection('auth');
    }
  }, [upgradeReason, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const isDark = theme === 'dark';

  const clerkAppearance = {
    variables: {
      colorPrimary: '#0052FF',
      colorBackground: isDark ? '#0D111A' : '#FFFFFF',
      colorText: isDark ? '#F8FAFC' : '#0F172A',
      colorTextSecondary: isDark ? '#94A3B8' : '#64748B',
      colorInputBackground: isDark ? '#141926' : '#F8FAFC',
      colorInputText: isDark ? '#F8FAFC' : '#0F172A',
      borderRadius: '0.75rem',
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    elements: {
      rootBox: 'w-full flex justify-center',
      cardBox: 'w-full shadow-none border-none',
      card: 'bg-transparent shadow-none p-0 w-full border-none',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      socialButtonsBlockButton: isDark
        ? 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs py-2.5 rounded-xl transition cursor-pointer'
        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xs py-2.5 rounded-xl transition cursor-pointer',
      socialButtonsBlockButtonText: 'font-medium text-xs',
      formButtonPrimary:
        'bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer',
      formFieldInput: isDark
        ? 'bg-[#141926] border border-white/12 text-white text-xs rounded-xl focus:border-[#0052FF] py-2.5'
        : 'bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:border-[#0052FF] py-2.5',
      formFieldLabel: isDark
        ? 'text-slate-300 text-xs font-medium mb-1'
        : 'text-slate-700 text-xs font-medium mb-1',
      footerActionText: isDark ? 'text-slate-400 text-xs' : 'text-slate-500 text-xs',
      footerActionLink: 'text-[#0052FF] hover:underline text-xs font-semibold cursor-pointer',
      dividerLine: isDark ? 'bg-white/10' : 'bg-slate-200',
      dividerText: isDark ? 'text-slate-400 text-[11px]' : 'text-slate-500 text-[11px]',
      otpCodeFieldInput: isDark
        ? 'bg-[#141926] border border-white/20 text-white font-mono text-base rounded-xl'
        : 'bg-slate-50 border border-slate-300 text-slate-900 font-mono text-base rounded-xl',
      identityPreviewText: isDark ? 'text-white text-xs' : 'text-slate-900 text-xs',
      identityPreviewEditButton: 'text-[#0052FF] text-xs',
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[460px] rounded-3xl bg-white dark:bg-[#0D111A] border border-slate-200 dark:border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.55)] overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Top Royal Cobalt Header Banner */}
          <div className="relative bg-gradient-to-br from-[#0052FF] via-[#0045D8] to-[#002FA3] px-6 pt-6 pb-5 text-white overflow-hidden shrink-0">
            <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-40 h-24 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand & Security Badge */}
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-[#0052FF] flex items-center justify-center shadow-md font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-white block leading-none">
                    StudyMate ID
                  </span>
                  <span className="font-mono text-[10px] text-blue-100/80">
                    Clerk Student Authentication
                  </span>
                </div>
              </div>

              <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-xs mr-8">
                PKCE OAuth 2.1
              </span>
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeSection === 'alexa'
                  ? 'Pair Amazon Alexa+ Hardware'
                  : authModalMode === 'sign-up'
                  ? 'Create your Scholar Account'
                  : 'Sign in to your Study Desk'}
              </h2>
              <p className="text-xs text-blue-100/85 mt-1 leading-relaxed">
                {upgradeReason === 'task-limit'
                  ? 'Preview task limit reached. Sign in with Clerk to unlock unlimited syllabus tracking.'
                  : activeSection === 'alexa'
                  ? 'Authorize physical Echo devices with end-to-end encrypted OAuth.'
                  : 'Sign in with Clerk. Verification codes are delivered directly to your email inbox.'}
              </p>
            </div>

            {/* Navigation Pill Switcher inside Header */}
            <div className="relative z-10 grid grid-cols-3 gap-1 p-1 mt-4 rounded-xl bg-black/25 border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('auth');
                  setAuthModalMode('sign-in');
                }}
                className={`py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeSection === 'auth' && authModalMode === 'sign-in'
                    ? 'bg-white text-[#0052FF] font-semibold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('auth');
                  setAuthModalMode('sign-up');
                }}
                className={`py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeSection === 'auth' && authModalMode === 'sign-up'
                    ? 'bg-white text-[#0052FF] font-semibold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('alexa')}
                className={`py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeSection === 'alexa'
                    ? 'bg-white text-[#0052FF] font-semibold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>Alexa+ Link</span>
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-900 dark:text-slate-100">
            {/* SECTION 1: REAL CLERK AUTHENTICATION */}
            {activeSection === 'auth' && (
              <div className="flex justify-center py-1 min-h-[280px]">
                {authModalMode === 'sign-in' ? (
                  <SignIn routing="hash" appearance={clerkAppearance} />
                ) : (
                  <SignUp routing="hash" appearance={clerkAppearance} />
                )}
              </div>
            )}

            {/* SECTION 2: ALEXA+ ACCOUNT LINKING (OAUTH 2.1 PKCE) */}
            {activeSection === 'alexa' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-[#0052FF] dark:text-blue-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Amazon Alexa+ OAuth 2.1 PKCE Bridge</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Link your physical Amazon Echo or Alexa+ app to your StudyMate database. Voice queries execute deterministic MCP tools over Streamable HTTP.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10">
                    <span className="text-slate-500">Hardware Status:</span>
                    <span
                      className={`font-semibold flex items-center gap-1.5 ${
                        user.alexaLinked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.alexaLinked ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      {user.alexaLinked ? 'LINKED & ACTIVE' : 'UNLINKED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">OAuth Client ID:</span>
                    <span className="text-slate-900 dark:text-white">amzn1.application-oa2.studymate</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">MCP Scope:</span>
                    <span className="text-[#0052FF] dark:text-blue-400">alexa::mcp:read_write</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Scholar Profile:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{user.name}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleAlexaAccountLinking}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    user.alexaLinked
                      ? 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-500 border border-slate-200 dark:border-white/10'
                      : 'bg-[#0052FF] hover:bg-[#0045D8] text-white shadow-lg shadow-blue-600/20'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>
                    {user.alexaLinked ? 'Disconnect Alexa+ Hardware' : 'Authorize & Link Echo Device'}
                  </span>
                </button>
              </div>
            )}

            {/* Quick Sandbox Evaluation Bypass */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-center space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await loginWithDemoAccount();
                  closeAuthModal();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF] dark:text-blue-400" />
                <span>Continue with Sample Demo Scholar (Judge Sandbox)</span>
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF] dark:text-blue-400" />
              <span>Secured by Clerk Authentication</span>
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeAuthModal();
                }}
                className="text-rose-500 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out ({user.name.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={closeAuthModal}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
