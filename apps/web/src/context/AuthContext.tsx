import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase.js';
import { DEMO_STUDENTS, setActiveStudent } from '../api.js';

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
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithDemoAccount: () => Promise<void>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
    major?: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginWithPersona: (studentId: number) => Promise<void>;
  toggleAlexaAccountLinking: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'studymate_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached auth session', e);
      }
    }
    // Default initial sample demo student account (Alishba Iqbal)
    const initialStudent = DEMO_STUDENTS[0];
    return {
      id: initialStudent.id,
      email: initialStudent.email,
      name: initialStudent.name,
      avatar: initialStudent.avatar,
      major: initialStudent.major,
      year: initialStudent.year,
      studentId: `STU-2026-${initialStudent.id.toString().padStart(4, '0')}`,
      alexaLinked: true,
      role: 'student',
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync session changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [user]);

  // Sync and listen to Supabase auth state changes (e.g. Google OAuth callback)
  useEffect(() => {
    if (supabase) {
      // 1. Initial session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const userMeta = u.user_metadata || {};
          const userName =
            userMeta.name || userMeta.full_name || u.email?.split('@')[0] || 'Enrolled Student';
          const avatar =
            userName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ST';

          setUser({
            id: u.id,
            email: u.email || 'scholar@university.edu',
            name: userName,
            avatar,
            major: userMeta.major || 'Computer Science & AI',
            year: userMeta.year || 'Enrolled Scholar',
            studentId: `STU-2026-${u.id.slice(0, 4)}`,
            alexaLinked: true,
            role: 'student',
            createdAt: u.created_at || new Date().toISOString(),
            isDemo: false,
          });
        }
      });

      // 2. Auth listener for OAuth redirects and token updates
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const u = session.user;
          const userMeta = u.user_metadata || {};
          const userName =
            userMeta.name || userMeta.full_name || u.email?.split('@')[0] || 'Enrolled Student';
          const avatar =
            userName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ST';

          setUser({
            id: u.id,
            email: u.email || 'scholar@university.edu',
            name: userName,
            avatar,
            major: userMeta.major || 'Computer Science & AI',
            year: userMeta.year || 'Enrolled Scholar',
            studentId: `STU-2026-${u.id.slice(0, 4)}`,
            alexaLinked: true,
            role: 'student',
            createdAt: u.created_at || new Date().toISOString(),
            isDemo: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // 1-Click Sample Demo Account (Alishba Iqbal)
  const loginWithDemoAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const demo = DEMO_STUDENTS[0];
      setActiveStudent(demo.id);

      const authUser: AuthUser = {
        id: demo.id,
        email: demo.email,
        name: demo.name,
        avatar: demo.avatar,
        major: demo.major,
        year: demo.year,
        studentId: `STU-2026-${demo.id.toString().padStart(4, '0')}`,
        alexaLinked: true,
        role: 'student',
        createdAt: new Date().toISOString(),
        isDemo: true,
      };

      setUser(authUser);
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  }, [closeAuthModal]);

  // Backward-compatible persona switcher (for demo profiles)
  const loginWithPersona = useCallback(
    async (studentId: number) => {
      setIsLoading(true);
      try {
        const student = DEMO_STUDENTS.find((s) => s.id === studentId) || DEMO_STUDENTS[0];
        setActiveStudent(student.id);

        const authUser: AuthUser = {
          id: student.id,
          email: student.email,
          name: student.name,
          avatar: student.avatar,
          major: student.major,
          year: student.year,
          studentId: `STU-2026-${student.id.toString().padStart(4, '0')}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
          isDemo: student.id === 1,
        };

        setUser(authUser);
        closeAuthModal();
      } finally {
        setIsLoading(false);
      }
    },
    [closeAuthModal]
  );

  // Continue with Google OAuth via Supabase
  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      // Resilient client mock Google sign-in if Supabase credentials aren't configured
      const authUser: AuthUser = {
        id: `google-${Date.now()}`,
        email: 'scholar.google@university.edu',
        name: 'Google Scholar Student',
        avatar: 'GS',
        major: 'Computer Science & AI',
        year: 'University Scholar',
        studentId: `STU-GGL-2026`,
        alexaLinked: true,
        role: 'student',
        createdAt: new Date().toISOString(),
        isDemo: false,
      };

      setUser(authUser);
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google authentication failed' };
    } finally {
      setIsLoading(false);
    }
  }, [closeAuthModal]);

  // Proper Email & Password sign-in via Supabase
  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        if (!email.trim() || !password.trim()) {
          return { success: false, error: 'Please enter both your university email and password.' };
        }

        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });
          if (error) return { success: false, error: error.message };
          if (data.user) {
            const userMeta = data.user.user_metadata || {};
            const userName =
              userMeta.name || userMeta.full_name || email.split('@')[0];
            setUser({
              id: data.user.id,
              email: data.user.email || email,
              name: userName,
              avatar:
                userName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'ST',
              major: userMeta.major || 'Computer Science & AI',
              year: 'Enrolled Scholar',
              studentId: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              alexaLinked: true,
              role: 'student',
              createdAt: new Date().toISOString(),
              isDemo: false,
            });
            closeAuthModal();
            return { success: true };
          }
        }

        // Check if user is logging into the sample demo account
        const demo = DEMO_STUDENTS[0];
        if (email.toLowerCase() === demo.email.toLowerCase()) {
          await loginWithDemoAccount();
          return { success: true };
        }

        // Resilient client authentication fallback
        const nameFromEmail = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = nameFromEmail
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const authUser: AuthUser = {
          id: `stu-${Date.now()}`,
          email,
          name: formattedName || 'University Scholar',
          avatar: email.substring(0, 2).toUpperCase(),
          major: 'Applied Sciences',
          year: 'Enrolled Scholar',
          studentId: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
          isDemo: false,
        };

        setUser(authUser);
        closeAuthModal();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed' };
      } finally {
        setIsLoading(false);
      }
    },
    [closeAuthModal, loginWithDemoAccount]
  );

  // Proper Sign-Up via Supabase
  const signUpWithEmail = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      major?: string
    ): Promise<{ success: boolean; error?: string; message?: string }> => {
      setIsLoading(true);
      try {
        if (!name.trim() || !email.trim() || !password.trim()) {
          return { success: false, error: 'Full name, email, and password are required.' };
        }

        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                name: name.trim(),
                major: major || 'Computer Science & AI',
              },
            },
          });
          if (error) return { success: false, error: error.message };

          if (data.user) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || email,
              name: name.trim(),
              avatar:
                name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'ST',
              major: major || 'Computer Science & AI',
              year: 'First Year',
              studentId: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              alexaLinked: true,
              role: 'student',
              createdAt: new Date().toISOString(),
              isDemo: false,
            };

            setUser(authUser);
            closeAuthModal();
            return { success: true, message: 'Account successfully registered and logged in.' };
          }
        }

        // Resilient client fallback
        const authUser: AuthUser = {
          id: `stu-${Date.now()}`,
          email: email.trim(),
          name: name.trim(),
          avatar:
            name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ST',
          major: major || 'Computer Science & AI',
          year: 'First Year',
          studentId: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
          isDemo: false,
        };

        setUser(authUser);
        closeAuthModal();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed' };
      } finally {
        setIsLoading(false);
      }
    },
    [closeAuthModal]
  );

  const toggleAlexaAccountLinking = useCallback(() => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, alexaLinked: !prev.alexaLinked };
    });
  }, []);

  const logout = useCallback(() => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithDemoAccount,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginWithPersona,
        toggleAlexaAccountLinking,
        logout,
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
