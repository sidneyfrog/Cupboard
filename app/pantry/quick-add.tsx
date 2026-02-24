import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { QuickAdd } from '@/components/pantry/quick-add';
import { usePantry } from '@/hooks/use-pantry';
import { useAuthStore } from '@/store/auth-store';
import { COMMON_STRINGS, AUTH_REQUIRED_STRINGS } from '@/constants/strings';

/** Screen for quickly adding a common ingredient to the pantry. */
export default function QuickAddScreen() {
  const router = useRouter();
  const { createItem } = usePantry();
  const user = useAuthStore((s) => s.user);

  const handleSelect = async (name: string) => {
    if (!user) {
      Alert.alert(AUTH_REQUIRED_STRINGS.TITLE, AUTH_REQUIRED_STRINGS.MESSAGE, [
        { text: COMMON_STRINGS.CANCEL, style: 'cancel' },
        { text: AUTH_REQUIRED_STRINGS.SIGN_IN, onPress: () => router.replace('/auth') },
      ]);
      return;
    }
    await createItem({
      name,
      quantity: 1,
      unit: 'units',
      category: 'Other',
      userId: user.id,
    });
    router.back();
  };

  return <QuickAdd onSelect={handleSelect} />;
}
