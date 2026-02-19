import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Placeholder shown when a list is empty, with an optional call-to-action. */
export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="mb-4 text-center text-base text-neutral-400">{message}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="rounded-lg bg-primary-500 px-6 py-3"
        >
          <Text className="text-base font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
