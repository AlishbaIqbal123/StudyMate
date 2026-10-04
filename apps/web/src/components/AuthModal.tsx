import React, { useState } from 'react';
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
    toggleAlexaAccountLinking,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'account' | 'alexa'>('account');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const sampleDemoStudent = DEMO_STUDENTS[0];

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
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

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || 'Google authentication failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
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
                Supabase Cloud Auth · Google SSO · Alexa+ OAuth 2.1 PKCE
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
            onClick={() => setActiveTab('account')}
            className={`pb-3 font-bold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'account'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Academic Sign In & Registration</span>
          </button>

          <button
            onClick={() => setActiveTab('alexa')}
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

        {/* Tab 1: Academic Sign In & Sign Up */}
        {activeTab === 'account' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Top Quick Auth Providers: Google & Sample Demo Account */}
            <div className="space-y-2.5">
              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full p-3 rounded-2xl border border-app-border hover:border-slate-400 dark:hover:border-slate-600 bg-app-subtle hover:bg-app-card text-app-text text-xs font-headline font-semibold transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-sm group"
              >
                {/* Official Google G SVG */}
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

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-app-border" />
              </div>
              <span className="relative px-3 bg-app-card text-[10px] font-mono uppercase tracking-wider text-app-muted">
                or with university credentials
              </span>
            </div>

            {/* Mode Switcher Pill: Sign In vs Sign Up */}
            <div className="p-1 rounded-xl bg-app-subtle border border-app-border flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-headline font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
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
                  setAuthMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-headline font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-app-card text-cyan-500 shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Student Account</span>
              </button>
            </div>

            {/* University Credentials Form */}
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
                        placeholder="e.g. Marcus Chen"
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
                      placeholder="e.g. Software Engineering, Data Science"
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
                    : 'Sign In with Supabase'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-app-muted">
                {authMode === 'signup'
                  ? 'Already registered your university credentials? '
                  : 'New student on StudyMate? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-cyan-500 hover:underline font-semibold cursor-pointer"
              >
                {authMode === 'signup' ? 'Sign in' : 'Create account'}
              </button>
            </div>
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
                {user?.isDemo && (
                  <span className="text-[10px] font-mono text-cyan-400">(Demo Mode)</span>
                )}
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
