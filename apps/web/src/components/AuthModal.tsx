import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  Radio,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DEMO_STUDENTS } from '../api.js';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    loginWithPersona,
    loginWithEmail,
    signUpWithEmail,
    toggleAlexaAccountLinking,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'persona' | 'credentials' | 'alexa'>('persona');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim() || !email.trim()) {
          setErrorMsg('Please enter your full name and university email.');
          return;
        }
        const res = await signUpWithEmail(fullName, email, major);
        if (!res.success) setErrorMsg(res.error || 'Failed to create student account');
      } else {
        if (!email.trim()) {
          setErrorMsg('Please enter your university email.');
          return;
        }
        const res = await loginWithEmail(email, password);
        if (!res.success) setErrorMsg(res.error || 'Invalid credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-app-card border border-app-border rounded-3xl shadow-2xl overflow-hidden relative transition-all">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-app-text">
                {isAuthenticated ? 'Student Account & Alexa+ Auth' : 'University Authentication'}
              </h2>
              <p className="text-xs text-app-muted">
                Student Profile · OAuth 2.1 PKCE · Alexa+ Account Linking
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-app-muted hover:text-app-text hover:bg-app-subtle transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-app-border flex items-center space-x-2 text-xs font-headline">
          <button
            onClick={() => setActiveTab('persona')}
            className={`pb-3 px-3 font-bold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'persona'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Fast Student Personas</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 px-3 font-bold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'credentials'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>University Email & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('alexa')}
            className={`pb-3 px-3 font-bold border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'alexa'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Alexa+ Account Linking</span>
          </button>
        </div>

        {/* Tab 1: Persona Instant Sign In */}
        {activeTab === 'persona' && (
          <div className="p-6 space-y-4">
            <div className="text-xs text-app-muted leading-relaxed">
              Select an enrolled university persona to instantly load their coursework, verified syllabi, and study streak:
            </div>

            <div className="space-y-2.5">
              {DEMO_STUDENTS.map((student) => {
                const isCurrent = user?.email === student.email;
                return (
                  <button
                    key={student.id}
                    onClick={() => loginWithPersona(student.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                        : 'bg-app-subtle border-app-border hover:border-cyan-500/40 hover:bg-app-card'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center shadow-sm">
                        {student.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-headline font-bold text-sm text-app-text">
                            {student.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-app-muted block">{student.major} · {student.year}</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-app-muted group-hover:text-cyan-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: University Credentials */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alishba Iqbal"
                    className="w-full bg-app-subtle border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">
                    Academic Major
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science & AI"
                    className="w-full bg-app-subtle border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-app-text mb-1">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-app-muted absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-text mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-app-muted absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-app-subtle border border-app-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSignUp ? 'Create Student Profile' : 'Authenticate & Open Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {isSignUp
                  ? 'Already have an academic profile? Sign in'
                  : 'New student? Register university account'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Alexa+ Account Linking */}
        {activeTab === 'alexa' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>OAuth 2.1 + PKCE Security Protocol</span>
              </div>
              <p className="text-app-text leading-relaxed">
                StudyMate connects with your Amazon Alexa+ profile using standard OAuth 2.1 with PKCE. When linked, your Echo devices and Alexa app can read and update your academic tasks in real-time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-subtle border border-app-border space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-app-border">
                <span className="text-app-muted">Account Linking Status:</span>
                <span className="font-bold flex items-center space-x-1.5 text-emerald-500">
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
                <span className="text-app-muted">Assigned Student:</span>
                <span className="text-cyan-500 font-bold">{user?.name || 'Alishba Iqbal'} ({user?.studentId || 'STU-001'})</span>
              </div>
            </div>

            <button
              onClick={toggleAlexaAccountLinking}
              className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                user?.alexaLinked
                  ? 'bg-app-subtle border border-app-border text-app-muted hover:text-red-500'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{user?.alexaLinked ? 'Simulate Unlink Alexa+' : 'Authorize & Link Alexa+ Device'}</span>
            </button>
          </div>
        )}

        {/* Footer info & Logout */}
        {isAuthenticated && (
          <div className="p-4 bg-app-subtle/80 border-t border-app-border flex items-center justify-between text-xs">
            <span className="text-app-muted">
              Signed in as <strong className="text-app-text">{user?.name}</strong>
            </span>
            <button
              onClick={logout}
              className="text-red-500 hover:underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
