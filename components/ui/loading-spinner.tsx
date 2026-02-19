import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { COMMON_STRINGS } from '@/constants/strings';
import { COLORS } from '@/constants/colors';

interface LoadingSpinnerProps {
  message?: string;
}

/** Full-screen centered loading indicator with optional message. */
export function LoadingSpinner({ message = COMMON_STRINGS.LOADING }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={COLORS.primary[500]} />
      <Text className="mt-3 text-base text-neutral-500">{message}</Text>
    </View>
  );
}
