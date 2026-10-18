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
  authProvider?: 'clerk' | 'preview';
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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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
        alexaLinked: false,
        role: 'student',
        createdAt: new Date().toISOString(),
        tier: 'member',
        isDemo: true,
        authProvider: 'preview',
        emailVerified: true,
      };
    }
  }

  // Pure Guest User (0 dummy data, no history)
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
    return false;
  });

  // Calculate active user profile from Clerk or Preview
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
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
        tier: 'member',
        isDemo: false,
        authProvider: 'clerk',
        emailVerified: Boolean(clerkUser.primaryEmailAddress?.verification?.status === 'verified'),
      };
    }

    return buildPreviewUser(previewStudentId);
  }, [isClerkSignedIn, clerkUser, previewStudentId, alexaLinkedState]);

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
    try {
      if (isClerkLoaded && typeof clerk?.openSignIn === 'function') {
        clerk.openSignIn();
      }
    } catch {}
  }, [clerk, isClerkLoaded]);

  const openClerkSignUp = useCallback(() => {
    setAuthModalMode('sign-up');
    setIsAuthModalOpen(true);
    try {
      if (isClerkLoaded && typeof clerk?.openSignUp === 'function') {
        clerk.openSignUp();
      }
    } catch {}
  }, [clerk, isClerkLoaded]);

  const openAuthModal = useCallback(() => {
    setUpgradeReason(null);
    openClerkSignIn();
  }, [openClerkSignIn]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setUpgradeReason(null);
  }, []);

  const requestUpgrade = useCallback(
    (reason: UpgradeReason) => {
      setUpgradeReason(reason);
      setIsAuthModalOpen(true);
    },
    []
  );

  const dismissUpgrade = useCallback(() => {
    setUpgradeReason(null);
    setIsAuthModalOpen(false);
  }, []);

  const loginWithDemoAccount = useCallback(async () => {
    if (isClerkSignedIn) {
      await clerk.signOut().catch(() => {});
    }
    setPreviewStudentId(DEMO_STUDENTS[0].id);
    setActiveStudent(DEMO_STUDENTS[0].id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('studymate_active_persona_id', String(DEMO_STUDENTS[0].id));
    }
    setIsAuthModalOpen(false);
  }, [isClerkSignedIn, clerk]);

  const loginWithPersona = useCallback(
    async (studentId: number) => {
      if (isClerkSignedIn) {
        await clerk.signOut().catch(() => {});
      }
      setPreviewStudentId(studentId);
      setActiveStudent(studentId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('studymate_active_persona_id', String(studentId));
      }
      setIsAuthModalOpen(false);
    },
    [isClerkSignedIn, clerk]
  );

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      clerk.openSignIn();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to open Clerk sign in' };
    }
  }, [clerk]);

  const loginWithEmail = useCallback(
    async (): Promise<{ success: boolean; error?: string }> => {
      try {
        clerk.openSignIn();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to open Clerk sign in' };
      }
    },
    [clerk]
  );

  const signUpWithEmail = useCallback(
    async (): Promise<{ success: boolean; error?: string; message?: string }> => {
      try {
        clerk.openSignUp();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to open Clerk sign up' };
      }
    },
    [clerk]
  );

  const sendOtp = useCallback(
    async (): Promise<SendOtpResult> => {
      clerk.openSignIn();
      return { success: true, message: 'Opening Clerk verification...' };
    },
    [clerk]
  );

  const verifyOtp = useCallback(
    async (): Promise<VerifyOtpResult> => {
      return { success: true, verified: true };
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
    if (user.tier !== 'member') {
      requestUpgrade('alexa-link');
      return;
    }
    setAlexaLinkedState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studymate_alexa_linked', String(next));
      }
      return next;
    });
  }, [user.tier, requestUpgrade]);

  const logout = useCallback(() => {
    clerk.signOut().catch(() => {});
    setPreviewStudentId(null);
    setAlexaLinkedState(false);
    if (typeof window !== 'undefined') {
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
        isLoading: !isClerkLoaded,
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
