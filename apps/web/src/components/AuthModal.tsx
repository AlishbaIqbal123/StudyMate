import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  Radio,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  User,
  KeyRound,
  UserPlus,
  LogIn,
  Check,
  RefreshCw,
  Send,
  Timer,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DEMO_STUDENTS } from '../api.js';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    loginWithDemoAccount,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    sendOtp,
    verifyOtp,
    verifyCurrentStudent,
    toggleAlexaAccountLinking,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'account' | 'alexa'>('account');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [signinType, setSigninType] = useState<'password' | 'otp'>('password');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');

  // OTP State
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [demoCodePreview, setDemoCodePreview] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Segmented OTP input refs
  const digitInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // OTP Countdown Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  if (!isAuthModalOpen) return null;

  const sampleDemoStudent = DEMO_STUDENTS[0];

  // Reset notifications
  const clearFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Submit Password-based Authentication
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          setErrorMsg('Please enter your full name, email, and password.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          return;
        }
        const res = await signUpWithEmail(fullName, email, password, major);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create student account');
        } else {
          setSuccessMsg(res.message || 'Account successfully created and authenticated!');
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Please enter both your university email and password.');
          return;
        }
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid university credentials.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Send OTP
  const handleSendOtp = async (targetEmail?: string) => {
    clearFeedback();
    const mailToSend = (targetEmail || email).trim();
    if (!mailToSend) {
      setErrorMsg('Please enter your academic university email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mailToSend)) {
      setErrorMsg('Please enter a valid academic or university email format.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(mailToSend, authMode === 'signup' ? 'signup' : 'signin');
      if (res.success) {
        setOtpEmail(mailToSend);
        setOtpStep('verify');
        setOtpTimer(60); // 60s cooldown
        setOtpDigits(['', '', '', '', '', '']);
        setAttemptsRemaining(5);
        if (res.code) {
          setDemoCodePreview(res.code);
        }
        setSuccessMsg(`6-digit verification code sent to ${mailToSend}`);
        // Focus first digit box
        setTimeout(() => {
          digitInputRefs[0].current?.focus();
        }, 150);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch verification code');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit & Verify OTP Code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    clearFeedback();
    const fullCode = (codeToVerify || otpDigits.join('')).trim();
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If student is currently authenticated and verifying their existing email
      if (isAuthenticated && user?.email === otpEmail) {
        const verifyRes = await verifyCurrentStudent(fullCode);
        if (verifyRes.success) {
          setSuccessMsg('Academic email verified successfully!');
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
          return;
        } else {
          setErrorMsg(verifyRes.error || 'Invalid verification code');
          return;
        }
      }

      // Standard OTP verification & login
      const res = await verifyOtp(otpEmail, fullCode);
      if (res.success && res.verified) {
        setSuccessMsg('Identity verified! Access granted to StudyMate.');
      } else {
        setErrorMsg(res.error || 'Invalid or expired verification code.');
        if (attemptsRemaining !== null && attemptsRemaining > 1) {
          setAttemptsRemaining(attemptsRemaining - 1);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Digit Input Change Handler
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (index < 5) {
      digitInputRefs[index + 1].current?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (index === 5 && newDigits.every((d) => d.length === 1)) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  // Digit KeyDown Handler (Backspace & Navigation)
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        digitInputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitInputRefs[index + 1].current?.focus();
    }
  };

  // Paste Event Handler (Auto-distribute 6 digits)
  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    if (pasteData.length === 6) {
      digitInputRefs[5].current?.focus();
      handleVerifyOtp(pasteData);
    } else {
      digitInputRefs[Math.min(pasteData.length, 5)].current?.focus();
    }
  };

  // 1-Click Auto-Fill Demo Code
  const handleAutoFillDemoCode = () => {
    if (!demoCodePreview || demoCodePreview.length !== 6) return;
    const split = demoCodePreview.split('');
    setOtpDigits(split);
    digitInputRefs[5].current?.focus();
    handleVerifyOtp(demoCodePreview);
  };

  // Google Sign-In Trigger
  const handleGoogleLogin = async () => {
    clearFeedback();
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Student Sign-In Trigger
  const handleDemoLogin = async () => {
    clearFeedback();
    setIsSubmitting(true);
    try {
      await loginWithDemoAccount();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-app-card border border-app-border rounded-3xl shadow-2xl overflow-hidden relative transition-all">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-app-text">
                {isAuthenticated ? 'Student Account & Alexa Auth' : 'University Authentication'}
              </h2>
              <p className="text-xs text-app-muted">
                Google SSO · 6-Digit Academic OTP · Alexa+ OAuth 2.1 PKCE
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-app-muted hover:text-app-text hover:bg-app-subtle transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-app-border flex items-center space-x-4 text-xs font-headline">
          <button
            onClick={() => {
              setActiveTab('account');
              clearFeedback();
            }}
            className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'account'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Academic Access & Verification</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('alexa');
              clearFeedback();
            }}
            className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'alexa'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Alexa+ Device Link (OAuth 2.1)</span>
          </button>
        </div>

        {/* Tab 1: Academic Sign In, Sign Up, & OTP */}
        {activeTab === 'account' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Verification Status Banner if logged in */}
            {isAuthenticated && (
              <div className="p-3.5 rounded-2xl bg-app-subtle border border-app-border flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      user?.emailVerified
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {user?.emailVerified ? <BadgeCheck className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-headline font-bold text-app-text flex items-center space-x-1.5">
                      <span>{user?.name}</span>
                      {user?.authProvider === 'google' && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          Google SSO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-app-muted">
                      {user?.emailVerified ? (
                        <span className="text-emerald-400 font-semibold">Verified Academic Email</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Unverified Email Address</span>
                      )}
                    </div>
                  </div>
                </div>

                {!user?.emailVerified && (
                  <button
                    onClick={() => {
                      setAuthMode('otp');
                      setOtpStep('request');
                      setEmail(user?.email || '');
                      handleSendOtp(user?.email);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-headline font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Verify via OTP
                  </button>
                )}
              </div>
            )}

            {/* Quick SSO Actions: Continue with Google & Demo Account */}
            {authMode !== 'otp' && (
              <div className="space-y-2.5">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-2xl border border-app-border hover:border-slate-400 dark:hover:border-slate-600 bg-app-subtle hover:bg-app-card text-app-text text-xs font-headline font-semibold transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-sm group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Sample Demo Account (Alishba Iqbal) */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/60 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 hover:from-cyan-500/15 hover:to-blue-500/15 text-app-text text-xs transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30 shrink-0">
                      {sampleDemoStudent.avatar}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-headline font-bold text-xs text-app-text truncate">
                          {sampleDemoStudent.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Sample Demo
                        </span>
                      </div>
                      <span className="text-[10px] text-app-muted block truncate">
                        {sampleDemoStudent.major} · 1-Click Evaluation
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-cyan-400 font-headline font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Open Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            )}

            {/* Mode Switcher Pill: Sign In, Sign Up, or OTP */}
            <div className="p-1 rounded-xl bg-app-subtle border border-app-border flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  clearFeedback();
                }}
                className={`flex-1 py-1.5 rounded-lg font-headline font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-app-card text-cyan-500 shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setOtpStep('request');
                  clearFeedback();
                }}
                className={`flex-1 py-1.5 rounded-lg font-headline font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                  authMode === 'otp'
                    ? 'bg-app-card text-cyan-500 shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify via OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  clearFeedback();
                }}
                className={`flex-1 py-1.5 rounded-lg font-headline font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-app-card text-cyan-500 shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* VIEW A: Standard Sign In / Sign Up Form */}
            {authMode !== 'otp' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-3">
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-app-text mb-1">
                        Full Student Name
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-app-muted absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alishba Iqbal"
                          className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-app-text focus:outline-none focus:border-cyan-500 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-app-text mb-1">
                        Academic Major / Discipline
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g. Computer Science & AI"
                        className="w-full bg-app-subtle border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-app-text mb-1">
                    University Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-app-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-app-text focus:outline-none focus:border-cyan-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-app-text mb-1">
                    Password {authMode === 'signup' && <span className="text-app-muted font-normal">(min. 6 characters)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-app-muted absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-app-text focus:outline-none focus:border-cyan-500 transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  <span>
                    {authMode === 'signup'
                      ? 'Register Student Account'
                      : 'Sign In to StudyMate'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* VIEW B: 6-Digit OTP Verification System */}
            {authMode === 'otp' && (
              <div className="space-y-4">
                {otpStep === 'request' ? (
                  /* Step 1: Request Code */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-app-text leading-relaxed">
                      Enter your university or academic email address. We will generate and deliver a secure 6-digit One-Time Password (OTP) for instant verification.
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-app-text mb-1">
                        Academic Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-app-muted absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="scholar@university.edu"
                          className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3 py-2 text-xs text-app-text focus:outline-none focus:border-cyan-500 transition"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting || !email.trim()}
                      onClick={() => handleSendOtp(email)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Sending Code...' : 'Send 6-Digit Verification Code'}</span>
                    </button>
                  </div>
                ) : (
                  /* Step 2: 6-Digit Segmented PIN Input */
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-app-border">
                      <span className="text-app-muted">
                        Code sent to: <strong className="text-cyan-400">{otpEmail}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('request');
                          clearFeedback();
                        }}
                        className="text-[11px] text-cyan-500 hover:underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Reviewer / Demo Mailbox Toast Preview */}
                    {demoCodePreview && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border border-cyan-500/30 flex items-center justify-between text-xs animate-in zoom-in-95">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <div className="truncate">
                            <span className="font-mono font-bold text-cyan-400">
                              [Academic Mailbox Preview] Code:{' '}
                            </span>
                            <span className="font-mono font-extrabold text-app-text tracking-wider text-sm">
                              {demoCodePreview}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAutoFillDemoCode}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-mono font-bold transition shadow-sm cursor-pointer ml-2"
                        >
                          Auto-Fill Code
                        </button>
                      </div>
                    )}

                    {/* 6-Digit Box Input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-app-text text-center mb-2">
                        Enter 6-Digit Verification Code
                      </label>
                      <div
                        className="flex items-center justify-center space-x-2 sm:space-x-3"
                        onPaste={handleDigitPaste}
                      >
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={digitInputRefs[idx]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                            className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-2xl bg-app-subtle border border-app-border text-app-text focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition shadow-inner"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions: Verify & Resend */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        disabled={isSubmitting || otpDigits.some((d) => !d)}
                        onClick={() => handleVerifyOtp()}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isSubmitting ? 'Verifying Code...' : 'Verify Code & Access Account'}</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-app-muted pt-1">
                        <div className="flex items-center space-x-1">
                          <Timer className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            {otpTimer > 0 ? (
                              <span>Resend available in <strong className="text-cyan-400 font-mono">{otpTimer}s</strong></span>
                            ) : (
                              <span className="text-emerald-400">Code expired or ready to resend</span>
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={otpTimer > 0 || isSubmitting}
                          onClick={() => handleSendOtp(otpEmail)}
                          className="text-cyan-500 hover:underline font-semibold disabled:opacity-40 disabled:hover:no-underline cursor-pointer flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend Code</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Alexa+ Account Linking (OAuth 2.1 PKCE) */}
        {activeTab === 'alexa' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>OAuth 2.1 + PKCE Security Protocol</span>
              </div>
              <p className="text-app-text leading-relaxed">
                StudyMate authorizes voice sessions with Amazon Alexa+ using standards-compliant OAuth 2.1 with PKCE. Once linked, Echo hardware and the Alexa app can query courses, record Pomodoro focus time, and add assignments seamlessly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-subtle border border-app-border space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-app-border">
                <span className="text-app-muted">Alexa Linking Status:</span>
                <span
                  className={`font-bold flex items-center space-x-1.5 ${
                    user?.alexaLinked ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{user?.alexaLinked ? 'LINKED & ACTIVE' : 'UNLINKED'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-app-muted">OAuth Client ID:</span>
                <span className="text-app-text">amzn1.application-oa2-client.studymate</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-app-muted">Auth Scope:</span>
                <span className="text-app-text">alexa::devices:all alexa::mcp:read_write</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-app-muted">Assigned Student Profile:</span>
                <span className="text-cyan-400 font-bold">
                  {user?.name || sampleDemoStudent.name} ({user?.studentId || 'STU-2026-0001'})
                </span>
              </div>
            </div>

            <button
              onClick={toggleAlexaAccountLinking}
              className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                user?.alexaLinked
                  ? 'bg-app-subtle border border-app-border text-app-muted hover:text-red-400 hover:border-red-400/40'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{user?.alexaLinked ? 'Unlink Alexa+ Device' : 'Authorize & Link Alexa+ Device'}</span>
            </button>
          </div>
        )}

        {/* Footer info & Logout */}
        {isAuthenticated && (
          <div className="p-4 bg-app-subtle/80 border-t border-app-border flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-app-muted truncate">
                Signed in as <strong className="text-app-text">{user?.name}</strong>{' '}
                {user?.authProvider === 'google' ? (
                  <span className="text-[10px] font-mono text-cyan-400">(Google Account)</span>
                ) : user?.isDemo ? (
                  <span className="text-[10px] font-mono text-cyan-400">(Demo Mode)</span>
                ) : null}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-red-500 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
