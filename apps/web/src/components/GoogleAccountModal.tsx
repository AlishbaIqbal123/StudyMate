import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth, type GoogleProfileOption } from '../context/AuthContext.js';

const PRESET_GOOGLE_ACCOUNTS: GoogleProfileOption[] = [
  {
    name: 'Alishba Iqbal',
    email: 'alishba.iqbal.dev@gmail.com',
    avatar: 'AI',
    major: 'Computer Science & AI',
  },
  {
    name: 'Alex Vance (Student)',
    email: 'alex.vance@university.edu',
    avatar: 'AV',
    major: 'Software Engineering',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@gmail.com',
    avatar: 'ER',
    major: 'Applied Mathematics & Data Science',
  },
];

export const GoogleAccountModal: React.FC = () => {
  const { isGoogleSelectorOpen, closeGoogleSelector, loginWithGoogleProfile } = useAuth();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customMajor, setCustomMajor] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isGoogleSelectorOpen) return null;

  const handleSelectAccount = async (account: GoogleProfileOption) => {
    setSelectedEmail(account.email);
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginWithGoogleProfile(account);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setErrorMsg('Please enter both your name and Google email.');
      return;
    }
    if (!customEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginWithGoogleProfile({
        name: customName.trim(),
        email: customEmail.trim(),
        major: customMajor.trim() || 'Computer Science & AI',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Google account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative transition-all">
        {/* Top Header with Official Google G */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-slate-900 dark:text-white">
                Choose an account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                to continue to <strong className="text-cyan-600 dark:text-cyan-400">StudyMate</strong>
              </p>
            </div>
          </div>

          <button
            onClick={closeGoogleSelector}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-3">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {!showCustomForm ? (
            <>
              {/* Account Selection List */}
              <div className="space-y-2">
                {PRESET_GOOGLE_ACCOUNTS.map((acc) => {
                  const isSelected = selectedEmail === acc.email && isSubmitting;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSelectAccount(acc)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {acc.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="font-headline font-semibold text-xs text-slate-900 dark:text-white truncate flex items-center space-x-1.5">
                            <span>{acc.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              Google
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition">
                        {isSelected ? (
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Option to enter custom Google account */}
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left transition flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-headline font-semibold text-xs text-slate-900 dark:text-white">
                      Use another Google account
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sign in with your university or personal Google address
                    </div>
                  </div>
                </button>
              </div>

              {/* Privacy Footer */}
              <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-4 flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                <span>
                  To continue, Google will share your verified name, email address, and profile picture with StudyMate.
                </span>
              </div>
            </>
          ) : (
            /* Custom Google Account Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="scholar@gmail.com or scholar@university.edu"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Major (Optional)
                </label>
                <input
                  type="text"
                  value={customMajor}
                  onChange={(e) => setCustomMajor(e.target.value)}
                  placeholder="e.g. Cognitive Systems, Data Science"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Sign In with Google</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
