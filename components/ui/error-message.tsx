import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { COMMON_STRINGS } from '@/constants/strings';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

/** Displays a user-friendly error message with an optional retry button. */
export function ErrorMessage({
  message = COMMON_STRINGS.ERROR,
  onRetry,
}: ErrorMessageProps) {
  return (
    <View className="items-center justify-center px-6 py-8">
      <Text className="mb-4 text-center text-base text-red-500">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="rounded-lg bg-primary-500 px-6 py-3"
        >
          <Text className="text-base font-semibold text-white">
            {COMMON_STRINGS.RETRY}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
