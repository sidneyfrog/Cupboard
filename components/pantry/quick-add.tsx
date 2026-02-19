import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { COMMON_INGREDIENTS } from '@/constants/categories';
import { PANTRY_STRINGS } from '@/constants/strings';

interface QuickAddProps {
  onSelect: (name: string) => void;
}

/** Autocomplete list of common ingredients for quick pantry additions. */
export function QuickAdd({ onSelect }: QuickAddProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [...COMMON_INGREDIENTS];
    return COMMON_INGREDIENTS.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <View className="flex-1 bg-white">
      <View className="mx-4 my-2">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={PANTRY_STRINGS.SEARCH_PLACEHOLDER}
          placeholderTextColor="#a3a3a3"
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-800"
          autoFocus
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="border-b border-neutral-50 px-4 py-3.5"
          >
            <Text className="text-base text-neutral-700">{item}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-neutral-400">{PANTRY_STRINGS.QUICK_ADD}</Text>
          </View>
        }
      />
    </View>
  );
}
