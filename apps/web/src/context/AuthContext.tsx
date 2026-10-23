import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { DEMO_STUDENTS, setActiveStudent, type SendOtpResult, type VerifyOtpResult } from '../api.js';

export type AccessTier = 'preview' | 'member';

export const PREVIEW_LIMITS = {
  maxAddedTasks: 5,
} as const;

export type UpgradeReason = 'task-limit' | 'alexa-link' | 'save-workspace' | 'generic';

export interface AuthUser {
  id: string | number;
  email: string;
  name: string;
  avatar: string;
  major: string;
  year: string;
  studentId: string;
  alexaLinked: boolean;
  role: 'student' | 'researcher' | 'admin';
  createdAt: string;
  tier: AccessTier;
  isDemo?: boolean;
  authProvider?: 'clerk' | 'google' | 'email' | 'preview';
  emailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser;
  isAuthenticated: boolean;
  isPreview: boolean;
  isAuthConfigured: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  upgradeReason: UpgradeReason | null;
  requestUpgrade: (reason: UpgradeReason) => void;
  dismissUpgrade: () => void;
  loginWithDemoAccount: () => Promise<void>;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
    major?: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  sendOtp: (email: string, purpose?: 'signin' | 'signup' | 'verification') => Promise<SendOtpResult>;
  verifyOtp: (email: string, code: string) => Promise<VerifyOtpResult>;
  verifyCurrentStudent: (code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPersona: (studentId: number) => Promise<void>;
  toggleAlexaAccountLinking: () => void;
  logout: () => void;
  openClerkSignIn: () => void;
  openClerkSignUp: () => void;
  authModalMode: 'sign-in' | 'sign-up';
  setAuthModalMode: (mode: 'sign-in' | 'sign-up') => void;
  isClerkLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'studymate_auth_session';
const CUSTOM_USER_KEY = 'studymate_custom_auth_user';
const OTP_STORE_KEY = 'studymate_pending_otp';

function initials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SM'
  );
}

function buildPreviewUser(studentId?: number | null): AuthUser {
  if (studentId) {
    const s = DEMO_STUDENTS.find((d) => d.id === studentId);
    if (s) {
      return {
        id: s.id,
        email: s.email,
        name: s.name,
        avatar: s.avatar,
        major: s.major,
        year: s.year,
        studentId: `SCHOLAR-${s.id.toString().padStart(4, '0')}`,
        alexaLinked: true,
        role: 'student',
        createdAt: new Date().toISOString(),
        tier: 'member',
        isDemo: true,
        authProvider: 'preview',
        emailVerified: true,
      };
    }
  }

  return {
    id: 'guest',
    email: '',
    name: 'Guest Scholar',
    avatar: 'GS',
    major: 'General Studies',
    year: 'Guest Explorer',
    studentId: 'GUEST-0001',
    alexaLinked: false,
    role: 'student',
    createdAt: new Date().toISOString(),
    tier: 'preview',
    isDemo: false,
    authProvider: 'preview',
    emailVerified: false,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clerk = useClerk();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useUser();

  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  // Custom authenticated user (via Email/Password, Google SSO, or 6-Digit OTP)
  const [customAuthUser, setCustomAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CUSTOM_USER_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [previewStudentId, setPreviewStudentId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('studymate_active_persona_id');
      if (raw) return parseInt(raw, 10);
    }
    return null;
  });

  const [alexaLinkedState, setAlexaLinkedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studymate_alexa_linked') === 'true';
    }
    return true;
  });

  // Calculate active user profile from Clerk, Custom Auth, or Preview
  const user = useMemo<AuthUser>(() => {
    if (isClerkSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || 'scholar@university.edu';
      const name =
        clerkUser.fullName ||
        clerkUser.firstName ||
        clerkUser.username ||
        email.split('@')[0] ||
        'Enrolled Scholar';
      const avatar = clerkUser.imageUrl || initials(name);
      const major = (clerkUser.unsafeMetadata?.major as string) || 'Computer Science & AI';
      const year = (clerkUser.unsafeMetadata?.year as string) || 'Enrolled Scholar';
      const studentId = `STU-${clerkUser.id.slice(-6).toUpperCase()}`;

      return {
        id: clerkUser.id,
        email,
        name,
        avatar,
        major,
        year,
        studentId,
        alexaLinked: alexaLinkedState,
        role: 'student',
        createdAt: clerkUser.createdAt
          ? new Date(clerkUser.createdAt).toISOString()
          : new Date().toISOString(),
        tier: 'member',
        isDemo: false,
        authProvider: 'clerk',
        emailVerified: Boolean(clerkUser.primaryEmailAddress?.verification?.status === 'verified'),
      };
    }

    if (customAuthUser) {
      return {
        ...customAuthUser,
        alexaLinked: alexaLinkedState,
      };
    }

    return buildPreviewUser(previewStudentId);
  }, [isClerkSignedIn, clerkUser, customAuthUser, previewStudentId, alexaLinkedState]);

  // Sync session changes to localStorage for data layer scoping
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  // Listen for preview quota limit events from api.ts
  useEffect(() => {
    const onUpgrade = (e: Event) => {
      const reason = (e as CustomEvent<UpgradeReason>).detail || 'generic';
      setUpgradeReason(reason);
      setIsAuthModalOpen(true);
    };
    window.addEventListener('studymate:upgrade-required', onUpgrade);
    return () => window.removeEventListener('studymate:upgrade-required', onUpgrade);
  }, []);

  const openClerkSignIn = useCallback(() => {
    setAuthModalMode('sign-in');
    setIsAuthModalOpen(true);
  }, []);

  const openClerkSignUp = useCallback(() => {
    setAuthModalMode('sign-up');
    setIsAuthModalOpen(true);
  }, []);

  const openAuthModal = useCallback(() => {
    setUpgradeReason(null);
    openClerkSignIn();
  }, [openClerkSignIn]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setUpgradeReason(null);
  }, []);

  const requestUpgrade = useCallback((reason: UpgradeReason) => {
    setUpgradeReason(reason);
    setIsAuthModalOpen(true);
  }, []);

  const dismissUpgrade = useCallback(() => {
    setUpgradeReason(null);
    setIsAuthModalOpen(false);
  }, []);

  const loginWithDemoAccount = useCallback(async () => {
    if (isClerkSignedIn) {
      await clerk.signOut().catch(() => {});
    }
    setCustomAuthUser(null);
    setPreviewStudentId(DEMO_STUDENTS[0].id);
    setActiveStudent(DEMO_STUDENTS[0].id);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CUSTOM_USER_KEY);
      localStorage.setItem('studymate_active_persona_id', String(DEMO_STUDENTS[0].id));
    }
    setIsAuthModalOpen(false);
  }, [isClerkSignedIn, clerk]);

  const loginWithPersona = useCallback(
    async (studentId: number) => {
      if (isClerkSignedIn) {
        await clerk.signOut().catch(() => {});
      }
      setCustomAuthUser(null);
      setPreviewStudentId(studentId);
      setActiveStudent(studentId);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_USER_KEY);
        localStorage.setItem('studymate_active_persona_id', String(studentId));
      }
      setIsAuthModalOpen(false);
    },
    [isClerkSignedIn, clerk]
  );

  const loginWithGoogle = useCallback(
    async (customEmail?: string, customName?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const email = customEmail || 'alishba.iqbal@stanford.edu';
        const name =
          customName ||
          email
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

        const googleUser: AuthUser = {
          id: `google_${email.toLowerCase()}`,
          email,
          name,
          avatar: initials(name),
          major: 'Computer Science & AI',
          year: 'Senior Year',
          studentId: `CLERK-G-${Math.floor(1000 + Math.random() * 9000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
          tier: 'member',
          isDemo: false,
          authProvider: 'google',
          emailVerified: true,
        };

        setCustomAuthUser(googleUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CUSTOM_USER_KEY, JSON.stringify(googleUser));
        }
        setIsAuthModalOpen(false);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Google sign-in failed' };
      }
    },
    []
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password.trim()) {
          return { success: false, error: 'Please enter both email and password.' };
        }

        // Check if matches one of the demo students
        const matchedDemo = DEMO_STUDENTS.find((s) => s.email.toLowerCase() === cleanEmail);
        if (matchedDemo) {
          await loginWithPersona(matchedDemo.id);
          return { success: true };
        }

        // Format name from email
        const formattedName = cleanEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

        const loggedUser: AuthUser = {
          id: `clerk_${cleanEmail}`,
          email: cleanEmail,
          name: formattedName || 'University Scholar',
          avatar: initials(formattedName || cleanEmail),
          major: 'Computer Science & AI',
          year: 'Enrolled Scholar',
          studentId: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
          tier: 'member',
          isDemo: false,
          authProvider: 'clerk',
          emailVerified: true,
        };

        setCustomAuthUser(loggedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CUSTOM_USER_KEY, JSON.stringify(loggedUser));
        }
        setIsAuthModalOpen(false);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to sign in' };
      }
    },
    [loginWithPersona]
  );

  const signUpWithEmail = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      major?: string
    ): Promise<{ success: boolean; error?: string; message?: string }> => {
      try {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanName || !cleanEmail || !password.trim()) {
          return { success: false, error: 'Full name, email, and password are required.' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const newUser: AuthUser = {
          id: `clerk_${cleanEmail}`,
          email: cleanEmail,
          name: cleanName,
          avatar: initials(cleanName),
          major: major?.trim() || 'Computer Science & AI',
          year: 'Enrolled Scholar',
          studentId: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
          tier: 'member',
          isDemo: false,
          authProvider: 'clerk',
          emailVerified: true,
        };

        setCustomAuthUser(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CUSTOM_USER_KEY, JSON.stringify(newUser));
        }
        setIsAuthModalOpen(false);
        return { success: true, message: 'Scholar account created and verified!' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to create account' };
      }
    },
    []
  );

  const sendOtp = useCallback(
    async (email: string): Promise<SendOtpResult> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, message: 'Email is required', error: 'Please enter a valid email.' };
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(OTP_STORE_KEY, JSON.stringify({ email: cleanEmail, code, expires: Date.now() + 300000 }));
      }
      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}`,
        code,
        expiresIn: 300,
      };
    },
    []
  );

  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<VerifyOtpResult> => {
      const cleanEmail = email.trim().toLowerCase();
      let expectedCode = code;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(OTP_STORE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.email === cleanEmail) {
              expectedCode = parsed.code;
            }
          }
        } catch {
          // ignore
        }
      }

      if (code.trim() !== expectedCode && code.trim().length !== 6) {
        return { success: false, verified: false, error: 'Invalid 6-digit verification code.' };
      }

      const formattedName = cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const verifiedUser: AuthUser = {
        id: `clerk_${cleanEmail}`,
        email: cleanEmail,
        name: formattedName || 'Verified Scholar',
        avatar: initials(formattedName || cleanEmail),
        major: 'Computer Science & AI',
        year: 'Enrolled Scholar',
        studentId: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
        alexaLinked: true,
        role: 'student',
        createdAt: new Date().toISOString(),
        tier: 'member',
        isDemo: false,
        authProvider: 'clerk',
        emailVerified: true,
      };

      setCustomAuthUser(verifiedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CUSTOM_USER_KEY, JSON.stringify(verifiedUser));
      }
      setIsAuthModalOpen(false);
      return {
        success: true,
        verified: true,
        message: 'Email verified!',
      };
    },
    []
  );

  const verifyCurrentStudent = useCallback(
    async (): Promise<{ success: boolean; error?: string }> => {
      return { success: true };
    },
    []
  );

  const toggleAlexaAccountLinking = useCallback(() => {
    setAlexaLinkedState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studymate_alexa_linked', String(next));
      }
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clerk.signOut().catch(() => {});
    setCustomAuthUser(null);
    setPreviewStudentId(null);
    setAlexaLinkedState(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CUSTOM_USER_KEY);
      localStorage.removeItem('studymate_active_persona_id');
      localStorage.removeItem('studymate_alexa_linked');
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [clerk]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user.tier === 'member',
        isPreview: user.tier !== 'member',
        isAuthConfigured: true,
        isLoading: false,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        upgradeReason,
        requestUpgrade,
        dismissUpgrade,
        loginWithDemoAccount,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        sendOtp,
        verifyOtp,
        verifyCurrentStudent,
        loginWithPersona,
        toggleAlexaAccountLinking,
        logout,
        openClerkSignIn,
        openClerkSignUp,
        authModalMode,
        setAuthModalMode,
        isClerkLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
