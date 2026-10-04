import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase.js';
import { DEMO_STUDENTS, setActiveStudent, type StudentProfile } from '../api.js';

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
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithPersona: (studentId: number) => Promise<void>;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, major?: string) => Promise<{ success: boolean; error?: string }>;
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
    // Default initial student user (Alishba Iqbal)
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

  // Check Supabase session if configured
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || 'scholar@university.edu';
          setUser((prev) =>
            prev
              ? { ...prev, email, id: session.user.id }
              : {
                  id: session.user.id,
                  email,
                  name: session.user.user_metadata?.name || 'Enrolled Student',
                  avatar: 'AI',
                  major: 'Computer Science',
                  year: 'Senior Year',
                  studentId: 'STU-2026-0001',
                  alexaLinked: true,
                  role: 'student',
                  createdAt: new Date().toISOString(),
                }
          );
        }
      });
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const loginWithPersona = useCallback(async (studentId: number) => {
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
      };

      setUser(authUser);
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  }, [closeAuthModal]);

  const loginWithEmail = useCallback(
    async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        if (supabase && password) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) return { success: false, error: error.message };
          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.name || email.split('@')[0],
              avatar: email.substring(0, 2).toUpperCase(),
              major: data.user.user_metadata?.major || 'General Engineering',
              year: 'Enrolled Scholar',
              studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
              alexaLinked: true,
              role: 'student',
              createdAt: new Date().toISOString(),
            });
            closeAuthModal();
            return { success: true };
          }
        }

        // Resilient client authentication fallback
        const existingStudent = DEMO_STUDENTS.find(
          (s) => s.email.toLowerCase() === email.toLowerCase()
        );
        if (existingStudent) {
          await loginWithPersona(existingStudent.id);
          return { success: true };
        }

        const nameFromEmail = email.split('@')[0].replace('.', ' ');
        const formattedName = nameFromEmail
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const authUser: AuthUser = {
          id: Date.now(),
          email,
          name: formattedName || 'University Scholar',
          avatar: email.substring(0, 2).toUpperCase(),
          major: 'Applied Sciences',
          year: 'Graduate / Senior',
          studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
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
    [closeAuthModal, loginWithPersona]
  );

  const signUpWithEmail = useCallback(
    async (
      name: string,
      email: string,
      major?: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const authUser: AuthUser = {
          id: Date.now(),
          email,
          name,
          avatar: name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
          major: major || 'Computer Science & AI',
          year: 'First Year',
          studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          alexaLinked: true,
          role: 'student',
          createdAt: new Date().toISOString(),
        };

        setUser(authUser);
        closeAuthModal();
        return { success: true };
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
        loginWithPersona,
        loginWithEmail,
        signUpWithEmail,
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
