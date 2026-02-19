import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { AUTH_STRINGS, APP_NAME } from '@/constants/strings';

/** Authentication screen with sign-in and sign-up modes. */
export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(AUTH_STRINGS.SIGN_IN_ERROR, 'Please fill in all fields.');
      return;
    }
    if (isSignUp && !displayName.trim()) {
      Alert.alert(AUTH_STRINGS.SIGN_UP_ERROR, 'Please enter a display name.');
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const result = await signUp(email, password, displayName);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(AUTH_STRINGS.SIGN_UP_ERROR, result.error ?? AUTH_STRINGS.SIGN_UP_ERROR);
      }
    } else {
      const result = await signIn(email, password);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(AUTH_STRINGS.SIGN_IN_ERROR, result.error ?? AUTH_STRINGS.SIGN_IN_ERROR);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      Alert.alert(AUTH_STRINGS.SIGN_IN_ERROR, result.error ?? AUTH_STRINGS.SIGN_IN_ERROR);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <Text className="mb-2 text-center text-3xl font-bold text-primary-600">
        {APP_NAME}
      </Text>
      <Text className="mb-10 text-center text-base text-neutral-400">
        Your smart pantry tracker
      </Text>

      {isSignUp && (
        <FormField
          label={AUTH_STRINGS.DISPLAY_NAME_LABEL}
          placeholder={AUTH_STRINGS.DISPLAY_NAME_PLACEHOLDER}
          value={displayName}
          onChangeText={setDisplayName}
        />
      )}

      <FormField
        label={AUTH_STRINGS.EMAIL_LABEL}
        placeholder={AUTH_STRINGS.EMAIL_PLACEHOLDER}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormField
        label={AUTH_STRINGS.PASSWORD_LABEL}
        placeholder={AUTH_STRINGS.PASSWORD_PLACEHOLDER}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View className="mt-4">
        <Button
          label={isSignUp ? AUTH_STRINGS.SIGN_UP : AUTH_STRINGS.SIGN_IN}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>

      <View className="my-6 flex-row items-center">
        <View className="flex-1 border-b border-neutral-200" />
        <Text className="mx-4 text-neutral-400">or</Text>
        <View className="flex-1 border-b border-neutral-200" />
      </View>

      <Button
        label={AUTH_STRINGS.GOOGLE_SIGN_IN}
        onPress={handleGoogleSignIn}
        variant="outline"
      />

      <Pressable onPress={() => setIsSignUp(!isSignUp)} className="mt-6 items-center">
        <Text className="text-base text-primary-500">
          {isSignUp ? AUTH_STRINGS.HAS_ACCOUNT : AUTH_STRINGS.NO_ACCOUNT}
          {' '}
          <Text className="font-semibold">
            {isSignUp ? AUTH_STRINGS.SIGN_IN : AUTH_STRINGS.SIGN_UP}
          </Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
