import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Radio,
  RefreshCw,
  Check,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';
import { useAuth } from '../context/AuthContext.js';
import { DEMO_STUDENTS } from '../api.js';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    upgradeReason,
    authModalMode,
    setAuthModalMode,
    isClerkLoaded,
    loginWithDemoAccount,
    loginWithPersona,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    sendOtp,
    verifyOtp,
    toggleAlexaAccountLinking,
    logout,
  } = useAuth();

  const [activeSection, setActiveSection] = useState<'auth' | 'alexa'>('auth');
  const [signinMethod, setSigninMethod] = useState<'password' | 'otp'>('password');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('Computer Science & AI');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [generatedCodePreview, setGeneratedCodePreview] = useState<string | null>(null);

  // Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (upgradeReason === 'alexa-link') {
      setActiveSection('alexa');
    } else {
      setActiveSection('auth');
    }
  }, [upgradeReason, isAuthModalOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  if (!isAuthModalOpen) return null;

  const clearFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    try {
      if (authModalMode === 'sign-up') {
        const res = await signUpWithEmail(fullName, email, password, major);
        if (!res.success) {
          setErrorMsg(res.error || 'Could not create account.');
        } else {
          setSuccessMsg(res.message || 'Account created!');
        }
      } else {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid credentials.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearFeedback();
    const targetEmail = (otpEmail || email).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid university or personal email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(targetEmail, authModalMode === 'sign-up' ? 'signup' : 'signin');
      if (res.success) {
        setOtpEmail(targetEmail);
        setOtpStep('verify');
        setOtpTimer(60);
        if (res.code) {
          setGeneratedCodePreview(res.code);
          setOtpDigits(res.code.split(''));
        } else {
          setOtpDigits(['', '', '', '', '', '']);
        }
        setSuccessMsg(`6-digit Clerk verification code sent to ${targetEmail}`);
        setTimeout(() => digitRefs[0].current?.focus(), 120);
      } else {
        setErrorMsg(res.error || 'Failed to send verification code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(otpEmail || email, code);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid verification code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (clean && index < 5) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const googleAccounts = [
    {
      name: 'Alishba Iqbal',
      email: 'alishba.iqbal@stanford.edu',
      role: 'Computer Science & AI • Senior',
      avatar: 'AI',
    },
    {
      name: 'Marcus Chen',
      email: 'm.chen@berkeley.edu',
      role: 'Electrical Engineering & CS',
      avatar: 'MC',
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@mit.edu',
      role: 'Applied Mathematics & Data Science',
      avatar: 'ER',
    },
  ];

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
      ? 1
      : password.length < 10
      ? 2
      : 3;

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
            {/* Subtle geometric sheen */}
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
                  ? 'Preview task limit reached. Sign in to unlock unlimited syllabus tracking.'
                  : activeSection === 'alexa'
                  ? 'Authorize physical Echo devices with end-to-end encrypted OAuth.'
                  : 'Sync coursework deadlines, Pomodoro analytics, and voice sessions.'}
              </p>
            </div>

            {/* Navigation Pill Switcher inside Header */}
            <div className="relative z-10 grid grid-cols-3 gap-1 p-1 mt-4 rounded-xl bg-black/25 border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('auth');
                  setAuthModalMode('sign-in');
                  clearFeedback();
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
                  clearFeedback();
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
                onClick={() => {
                  setActiveSection('alexa');
                  clearFeedback();
                }}
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
            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SECTION 1: CLERK AUTHENTICATION (SIGN IN & SIGN UP) */}
            {activeSection === 'auth' && (
              <div className="space-y-4">
                {/* If real live Clerk SDK is loaded, render Clerk Widget */}
                {isClerkLoaded ? (
                  <div className="flex justify-center py-1">
                    {authModalMode === 'sign-in' ? <SignIn /> : <SignUp />}
                  </div>
                ) : (
                  <>
                    {/* Social OAuth Buttons (Google & University SSO) */}
                    {!showGoogleChooser ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowGoogleChooser(true)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                        >
                          {/* Official Google G Multi-Color SVG */}
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span>Google SSO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSigninMethod('otp');
                            setOtpStep('request');
                            clearFeedback();
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#0052FF] dark:text-blue-400" />
                          <span>6-Digit Email Code</span>
                        </button>
                      </div>
                    ) : (
                      /* Interactive Google Account Chooser */
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Choose a Google Scholar Account
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowGoogleChooser(false)}
                            className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {googleAccounts.map((acc) => (
                            <button
                              key={acc.email}
                              type="button"
                              onClick={() => loginWithGoogle(acc.email, acc.name)}
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0D111A] hover:border-blue-500/50 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-left transition cursor-pointer group"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#0052FF] text-white font-mono text-xs font-bold flex items-center justify-center">
                                  {acc.avatar}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0052FF] dark:group-hover:text-blue-400 transition">
                                    {acc.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                    {acc.email}
                                  </div>
                                </div>
                              </div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0052FF] transition" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Divider */}
                    <div className="relative flex items-center justify-center py-1">
                      <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                      <span className="bg-white dark:bg-[#0D111A] px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                        {signinMethod === 'otp' ? 'Email Verification Code' : 'Or continue with email'}
                      </span>
                      <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                    </div>

                    {/* PASSWORD FORM (Sign In or Sign Up) */}
                    {signinMethod === 'password' ? (
                      <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                        {authModalMode === 'sign-up' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Full Name
                              </label>
                              <div className="relative">
                                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  required
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  placeholder="Alishba Iqbal"
                                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0052FF] dark:focus:border-blue-500 transition"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Academic Major
                              </label>
                              <div className="relative">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={major}
                                  onChange={(e) => setMajor(e.target.value)}
                                  placeholder="Computer Science"
                                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0052FF] dark:focus:border-blue-500 transition"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                            University or Personal Email
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="scholar@university.edu"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0052FF] dark:focus:border-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Password
                            </label>
                            {authModalMode === 'sign-in' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSigninMethod('otp');
                                  setOtpStep('request');
                                  clearFeedback();
                                }}
                                className="text-[11px] text-[#0052FF] dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                Sign in with 6-digit code
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0052FF] dark:focus:border-blue-500 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Password Strength Indicator in Sign Up */}
                          {authModalMode === 'sign-up' && password.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {[1, 2, 3].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`h-1 flex-1 rounded-full transition-colors ${
                                    passwordStrength >= lvl
                                      ? passwordStrength === 1
                                        ? 'bg-rose-500'
                                        : passwordStrength === 2
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                      : 'bg-slate-200 dark:bg-white/10'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] font-mono text-slate-400 ml-1">
                                {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Good' : 'Strong'}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition cursor-pointer active:scale-[0.99] disabled:opacity-50 group"
                        >
                          <span>
                            {isSubmitting
                              ? 'Authenticating...'
                              : authModalMode === 'sign-up'
                              ? 'Create Scholar Account'
                              : 'Sign In to StudyMate'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </form>
                    ) : (
                      /* 6-DIGIT EMAIL OTP FLOW */
                      <div className="space-y-3.5">
                        {otpStep === 'request' ? (
                          <form onSubmit={handleSendOtp} className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Enter Email for One-Time Verification Code
                              </label>
                              <div className="relative">
                                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="email"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="scholar@university.edu"
                                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0052FF]"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition cursor-pointer"
                            >
                              <span>Send 6-Digit Verification Code</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSigninMethod('password')}
                              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer block"
                            >
                              ← Back to password sign in
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                            {generatedCodePreview && (
                              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                                  Instant Demo OTP Code:
                                </span>
                                <span className="font-mono font-bold text-sm tracking-widest text-[#0052FF] dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-blue-500/30">
                                  {generatedCodePreview}
                                </span>
                              </div>
                            )}

                            {/* 6 Segmented OTP Boxes */}
                            <div className="flex items-center justify-between gap-2">
                              {otpDigits.map((digit, idx) => (
                                <input
                                  key={idx}
                                  ref={digitRefs[idx]}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                                  className="w-11 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 text-center font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 transition"
                                />
                              ))}
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Verify & Sign In</span>
                            </button>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <button
                                type="button"
                                onClick={() => setOtpStep('request')}
                                className="hover:underline cursor-pointer"
                              >
                                Change email
                              </button>
                              <button
                                type="button"
                                disabled={otpTimer > 0}
                                onClick={() => handleSendOtp()}
                                className="text-[#0052FF] dark:text-blue-400 hover:underline disabled:opacity-40 cursor-pointer flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>{otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend code'}</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </>
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

            {/* QUICK DEMO PERSONA SWITCHER (1-Click Judge Sandbox) */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Instant Judge Sandbox Personas
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  Pre-populated Data
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_STUDENTS.map((stu) => {
                  const isCurrent = user.email === stu.email && user.tier === 'member';
                  return (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => loginWithPersona(stu.id)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2 ${
                        isCurrent
                          ? 'bg-blue-500/10 border-[#0052FF] dark:border-blue-400'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#0052FF] text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {stu.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">
                          {stu.name.split(' ')[0]}
                        </div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                          {stu.major.split(' ')[0]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF] dark:text-blue-400" />
              <span>Secured by Clerk & Local SQLite</span>
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
                Continue as Guest →
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
