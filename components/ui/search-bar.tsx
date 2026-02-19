import React from 'react';
import { View, TextInput } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

/** A styled search input field. */
export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View className="mx-4 my-2">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-800"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
