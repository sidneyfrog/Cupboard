import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { AUTH_REQUIRED_STRINGS, COMMON_STRINGS } from '@/constants/strings';

/**
 * Returns a guard function that checks authentication state.
 * If signed in, it calls the provided callback. Otherwise it shows
 * an alert prompting the user to sign in.
 */
export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const requireAuth = useCallback(
    (onAuthenticated: () => void) => {
      if (isAuthenticated) {
        onAuthenticated();
        return;
      }

      Alert.alert(
        AUTH_REQUIRED_STRINGS.TITLE,
        AUTH_REQUIRED_STRINGS.MESSAGE,
        [
          { text: COMMON_STRINGS.CANCEL, style: 'cancel' },
          {
            text: AUTH_REQUIRED_STRINGS.SIGN_IN,
            onPress: () => router.push('/auth'),
          },
        ],
      );
    },
    [isAuthenticated, router],
  );

  return requireAuth;
}
