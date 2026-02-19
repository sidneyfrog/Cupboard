import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** A labelled text input with optional error display. */
export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-neutral-700">{label}</Text>
      <TextInput
        placeholderTextColor="#a3a3a3"
        className={`rounded-xl border px-4 py-3 text-base text-neutral-800 ${
          error ? 'border-red-400 bg-red-50' : 'border-neutral-200 bg-neutral-50'
        }`}
        {...inputProps}
      />
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
    </View>
  );
}
