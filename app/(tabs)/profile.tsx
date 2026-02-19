import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { updateUserProfile } from '@/services/auth-service';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PROFILE_STRINGS, AUTH_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import { DIETARY_RESTRICTIONS, CUISINE_PREFERENCES } from '@/constants/categories';
import type { DietaryRestriction, CuisinePreference } from '@/constants/categories';

/** Profile and preferences screen with dietary settings and sign-out. */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>(
    user?.preferences.dietaryRestrictions ?? []
  );
  const [cuisinePreferences, setCuisinePreferences] = useState<CuisinePreference[]>(
    user?.preferences.cuisinePreferences ?? []
  );
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-4 text-center text-lg text-neutral-500">
          Sign in to manage your profile and preferences.
        </Text>
        <Button
          label={AUTH_STRINGS.SIGN_IN}
          onPress={() => router.push('/auth')}
        />
      </View>
    );
  }

  const toggleDietary = (item: DietaryRestriction) => {
    setDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const toggleCuisine = (item: CuisinePreference) => {
    setCuisinePreferences((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const updated = await updateUserProfile(user.id, {
        preferences: { dietaryRestrictions, cuisinePreferences },
      });
      setUser(updated);
      Alert.alert(COMMON_STRINGS.OK, PROFILE_STRINGS.PREFERENCES_SAVED);
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, COMMON_STRINGS.ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(AUTH_STRINGS.SIGN_OUT, AUTH_STRINGS.SIGN_OUT_CONFIRM, [
      { text: 'Cancel', style: 'cancel' },
      { text: AUTH_STRINGS.SIGN_OUT, style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <Text className="mb-1 text-2xl font-bold text-neutral-800">{user.displayName}</Text>
      <Text className="mb-6 text-base text-neutral-500">{user.email}</Text>

      <Text className="mb-3 text-lg font-semibold text-neutral-800">
        {PROFILE_STRINGS.DIETARY_RESTRICTIONS}
      </Text>
      <View className="mb-4 flex-row flex-wrap">
        {DIETARY_RESTRICTIONS.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={dietaryRestrictions.includes(item)}
            onPress={() => toggleDietary(item)}
          />
        ))}
      </View>

      <Text className="mb-3 text-lg font-semibold text-neutral-800">
        {PROFILE_STRINGS.CUISINE_PREFERENCES}
      </Text>
      <View className="mb-6 flex-row flex-wrap">
        {CUISINE_PREFERENCES.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={cuisinePreferences.includes(item)}
            onPress={() => toggleCuisine(item)}
          />
        ))}
      </View>

      <Button
        label={PROFILE_STRINGS.SAVE_PREFERENCES}
        onPress={savePreferences}
        loading={saving}
      />

      <View className="mt-8 mb-12">
        <Button label={AUTH_STRINGS.SIGN_OUT} onPress={handleSignOut} variant="danger" />
      </View>
    </ScrollView>
  );
}
