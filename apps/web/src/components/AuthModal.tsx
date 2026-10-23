import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  GraduationCap,
  Radio,
  LogOut,
  Mail,
  Lock,
  User,
  BookOpen,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useClerk } from '@clerk/react';
import { useAuth } from '../context/AuthContext.js';

function extractClerkError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const anyErr = err as {
    errors?: Array<{ longMessage?: string; message?: string }>;
    message?: string;
  };
  if (Array.isArray(anyErr.errors) && anyErr.errors.length > 0) {
    return anyErr.errors[0].longMessage || anyErr.errors[0].message || fallback;
  }
  if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
    return anyErr.message;
  }
  return fallback;
}

export const AuthModal: React.FC = () => {
  const clerk = useClerk();
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

  const [activeSection, setActiveSection] = useState<'auth' | 'alexa'>('auth');
  const [signInMethod, setSignInMethod] = useState<'password' | 'email_code'>('password');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('Computer Science & AI');

  // Real Email OTP verification step (code is sent to real email inbox via Clerk)
  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false);
  const [verificationFlow, setVerificationFlow] = useState<'signin' | 'signup'>('signin');
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  useEffect(() => {
    if (upgradeReason === 'alexa-link') {
      setActiveSection('alexa');
    } else {
      setActiveSection('auth');
    }
    setErrorMsg(null);
    setStatusBanner(null);
    setAwaitingEmailCode(false);
    setOtpDigits(['', '', '', '', '', '']);
  }, [upgradeReason, isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // Handle pasting a full 6-digit code from email
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((ch, idx) => {
        if (index + idx < 6) next[index + idx] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(index + chars.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean[0];
    setOtpDigits(next);
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // OAuth Social Login via Clerk
  const handleOAuthSignIn = async (strategy: 'oauth_google' | 'oauth_github') => {
    setErrorMsg(null);
    if (!clerk.loaded || !clerk.client) {
      setErrorMsg('Clerk authentication service is still initializing. Please try again in a moment.');
      return;
    }
    try {
      setIsSubmitting(true);
      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: window.location.origin,
        redirectUrlComplete: window.location.href,
      });
    } catch (err) {
      setErrorMsg(extractClerkError(err, 'Could not start OAuth redirect with Clerk.'));
      setIsSubmitting(false);
    }
  };

  // Submit Sign-In (Password or Email OTP Code via Clerk)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusBanner(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your academic or personal email address.');
      return;
    }
    if (!clerk.loaded || !clerk.client) {
      setErrorMsg('Clerk is still connecting. Please wait a second and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (signInMethod === 'password') {
        if (!password) {
          setErrorMsg('Please enter your password, or switch to Email Verification Code.');
          setIsSubmitting(false);
          return;
        }
        const signInAttempt = await clerk.client.signIn.create({
          identifier: email.trim(),
          password,
        });

        if (signInAttempt.status === 'complete' && signInAttempt.createdSessionId) {
          await clerk.setActive({ session: signInAttempt.createdSessionId });
          closeAuthModal();
          return;
        }

        // If Clerk requires a first or second factor email code verification
        const emailFactor = signInAttempt.supportedFirstFactors?.find(
          (f) => f.strategy === 'email_code'
        );
        if (emailFactor && 'emailAddressId' in emailFactor) {
          await clerk.client.signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          setEmailAddressId(emailFactor.emailAddressId);
          setVerificationFlow('signin');
          setAwaitingEmailCode(true);
          setStatusBanner(`Clerk sent a 6-digit verification code to ${email.trim()}. Check your email inbox.`);
          return;
        }

        setErrorMsg('Additional verification required. Please use Email Code sign-in.');
      } else {
        // Passwordless Email OTP Code via Clerk
        const signInAttempt = await clerk.client.signIn.create({
          identifier: email.trim(),
        });

        const emailFactor = signInAttempt.supportedFirstFactors?.find(
          (f) => f.strategy === 'email_code'
        );

        if (!emailFactor || !('emailAddressId' in emailFactor)) {
          setErrorMsg(
            'Email code sign-in is not enabled for this account, or no account exists with this email yet. Try Create Account first.'
          );
          setIsSubmitting(false);
          return;
        }

        await clerk.client.signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailFactor.emailAddressId,
        });

        setEmailAddressId(emailFactor.emailAddressId);
        setVerificationFlow('signin');
        setAwaitingEmailCode(true);
        setStatusBanner(`A 6-digit verification code has been emailed to ${email.trim()}.`);
      }
    } catch (err) {
      setErrorMsg(
        extractClerkError(
          err,
          'Unable to sign in. Please check your credentials or create an account.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Sign-Up (Creates Clerk user + sends real 6-digit verification email)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusBanner(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email address and choose a strong password.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!clerk.loaded || !clerk.client) {
      setErrorMsg('Clerk authentication service is loading. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || undefined;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      const signUpAttempt = await clerk.client.signUp.create({
        emailAddress: email.trim(),
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          major: major.trim() || 'Computer Science & AI',
          year: 'Enrolled Scholar',
        },
      });

      if (signUpAttempt.status === 'complete' && signUpAttempt.createdSessionId) {
        await clerk.setActive({ session: signUpAttempt.createdSessionId });
        closeAuthModal();
        return;
      }

      // Send real 6-digit verification email via Clerk
      await clerk.client.signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setVerificationFlow('signup');
      setAwaitingEmailCode(true);
      setStatusBanner(
        `We sent a 6-digit verification code to ${email.trim()}. Please check your inbox (and spam folder).`
      );
    } catch (err) {
      setErrorMsg(
        extractClerkError(err, 'Could not create account. Please verify your email and password.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify the 6-digit code received in the user's real email inbox
  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const code = otpDigits.join('').trim();
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits from the verification email sent to your inbox.');
      return;
    }
    if (!clerk.loaded || !clerk.client) {
      setErrorMsg('Clerk authentication is not ready.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (verificationFlow === 'signup') {
        const res = await clerk.client.signUp.attemptEmailAddressVerification({
          code,
        });
        if (res.status === 'complete' && res.createdSessionId) {
          await clerk.setActive({ session: res.createdSessionId });
          closeAuthModal();
          return;
        }
        setErrorMsg('Verification incomplete. Please check the code in your email.');
      } else {
        const res = await clerk.client.signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });
        if (res.status === 'complete' && res.createdSessionId) {
          await clerk.setActive({ session: res.createdSessionId });
          closeAuthModal();
          return;
        }
        setErrorMsg('Verification incomplete. Please double-check the 6-digit code.');
      }
    } catch (err) {
      setErrorMsg(
        extractClerkError(err, 'Invalid or expired verification code. Please check your email inbox.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmailCode = async () => {
    setErrorMsg(null);
    setStatusBanner(null);
    if (!clerk.loaded || !clerk.client) return;

    setIsSubmitting(true);
    try {
      if (verificationFlow === 'signup') {
        await clerk.client.signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
      } else if (emailAddressId) {
        await clerk.client.signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId,
        });
      }
      setOtpDigits(['', '', '', '', '', '']);
      setStatusBanner(`A fresh 6-digit code has been sent to ${email.trim()}.`);
    } catch (err) {
      setErrorMsg(extractClerkError(err, 'Could not resend verification email.'));
    } finally {
      setIsSubmitting(false);
    }
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
                  : awaitingEmailCode
                  ? 'Check Your Email Inbox'
                  : authModalMode === 'sign-up'
                  ? 'Create your Scholar Account'
                  : 'Sign in to your Study Desk'}
              </h2>
              <p className="text-xs text-blue-100/85 mt-1 leading-relaxed">
                {upgradeReason === 'task-limit'
                  ? 'Preview task limit reached. Sign in with Clerk to unlock unlimited syllabus tracking.'
                  : activeSection === 'alexa'
                  ? 'Authorize physical Echo devices with end-to-end encrypted OAuth.'
                  : awaitingEmailCode
                  ? `Enter the 6-digit verification code sent by Clerk to ${email}.`
                  : 'Secured by Clerk. Verification codes are sent strictly to your email inbox.'}
              </p>
            </div>

            {/* Navigation Pill Switcher inside Header */}
            <div className="relative z-10 grid grid-cols-3 gap-1 p-1 mt-4 rounded-xl bg-black/25 border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('auth');
                  setAuthModalMode('sign-in');
                  setAwaitingEmailCode(false);
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
                  setAwaitingEmailCode(false);
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
            {/* Error & Status Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {statusBanner && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{statusBanner}</span>
              </div>
            )}

            {/* SECTION 1: CLERK AUTHENTICATION */}
            {activeSection === 'auth' && !awaitingEmailCode && (
              <div className="space-y-4">
                {/* Social OAuth Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleOAuthSignIn('oauth_google')}
                    className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleOAuthSignIn('oauth_github')}
                    className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  <span className="bg-white dark:bg-[#0D111A] px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                    or continue with email
                  </span>
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                </div>

                {authModalMode === 'sign-in' ? (
                  <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                    {/* Sign-In Mode Toggle: Password vs Email OTP Code */}
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSignInMethod('password')}
                        className={`py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          signInMethod === 'password'
                            ? 'bg-white dark:bg-[#181F30] text-slate-900 dark:text-white shadow-xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Lock className="w-3 h-3 text-[#0052FF]" />
                        <span>Password</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignInMethod('email_code')}
                        className={`py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          signInMethod === 'email_code'
                            ? 'bg-white dark:bg-[#181F30] text-slate-900 dark:text-white shadow-xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <KeyRound className="w-3 h-3 text-[#0052FF]" />
                        <span>Email OTP Code</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Academic or Personal Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="scholar@university.edu"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-white/12 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] transition"
                        />
                      </div>
                    </div>

                    {signInMethod === 'password' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-white/12 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] transition"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-semibold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>
                            {signInMethod === 'email_code'
                              ? 'Send 6-Digit Code to Email'
                              : 'Sign In to Study Desk'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Alex Rivera"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-white/12 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Major / Field
                        </label>
                        <div className="relative">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            placeholder="Computer Science"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-white/12 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="scholar@university.edu"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-white/12 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Create Password (min. 8 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-white/12 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-semibold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Create Account & Email Verification Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* SECTION 1B: REAL EMAIL 6-DIGIT VERIFICATION STEP */}
            {activeSection === 'auth' && awaitingEmailCode && (
              <form onSubmit={handleVerifyEmailCode} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                  <div className="font-semibold text-[#0052FF] dark:text-blue-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Verification Email Dispatched</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Enter the 6-digit security code sent to{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.
                    For your security, codes are only delivered to your email inbox.
                  </p>
                </div>

                {/* 6 Tactile Digit Inputs */}
                <div className="flex justify-between gap-2 pt-1">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#141926] border border-slate-300 dark:border-white/20 text-center font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 transition"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-semibold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Email Code & Sign In</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAwaitingEmailCode(false);
                      setErrorMsg(null);
                      setStatusBanner(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                  >
                    ← Change email address
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleResendEmailCode}
                    className="text-[#0052FF] hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend code to email</span>
                  </button>
                </div>
              </form>
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

            {/* Quick Sandbox Evaluation Bypass + Native Clerk Portal Trigger */}
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

              {clerk.loaded && (
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    if (authModalMode === 'sign-up') {
                      clerk.openSignUp();
                    } else {
                      clerk.openSignIn();
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Or launch Clerk Hosted Security Widget</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
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
