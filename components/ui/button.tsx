import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

const VARIANT_STYLES = {
  primary: 'bg-primary-500',
  secondary: 'bg-neutral-200',
  danger: 'bg-red-500',
  outline: 'bg-transparent border border-primary-500',
} as const;

const TEXT_STYLES = {
  primary: 'text-white',
  secondary: 'text-neutral-800',
  danger: 'text-white',
  outline: 'text-primary-500',
} as const;

/** A styled button with loading state and variant support. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-xl px-6 py-3.5 ${VARIANT_STYLES[variant]} ${
        (disabled || loading) ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'secondary' ? '#22c55e' : '#ffffff'}
        />
      ) : (
        <Text className={`text-base font-semibold ${TEXT_STYLES[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
