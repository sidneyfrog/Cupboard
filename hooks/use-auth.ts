import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import * as authService from '@/services/auth-service';
import { AUTH_STRINGS } from '@/constants/strings';

/** Hook providing authentication operations and session management. */
export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setSession, setLoading, reset } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (event, userId) => {
      if (userId && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        try {
          const profile = await authService.getUserProfile(userId);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        reset();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setSession, setLoading, reset]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const profile = await authService.signInWithEmail(email, password);
        setUser(profile);
        return { success: true, error: null };
      } catch {
        setLoading(false);
        return { success: false, error: AUTH_STRINGS.SIGN_IN_ERROR };
      }
    },
    [setUser, setLoading]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setLoading(true);
      try {
        const profile = await authService.signUpWithEmail(email, password, displayName);
        setUser(profile);
        return { success: true, error: null };
      } catch {
        setLoading(false);
        return { success: false, error: AUTH_STRINGS.SIGN_UP_ERROR };
      }
    },
    [setUser, setLoading]
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      await authService.signInWithGoogle();
      return { success: true, error: null };
    } catch {
      return { success: false, error: AUTH_STRINGS.SIGN_IN_ERROR };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      reset();
    } catch {
      // Sign-out failure is non-critical; reset local state anyway
      reset();
    }
  }, [reset]);

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
