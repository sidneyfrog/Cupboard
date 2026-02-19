import React, { useState } from 'react';
import { View, Text, SectionList, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePantry } from '@/hooks/use-pantry';
import { SearchBar } from '@/components/ui/search-bar';
import { CategoryFilter } from '@/components/pantry/category-filter';
import { PantryItemCard } from '@/components/pantry/pantry-item-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { PANTRY_STRINGS } from '@/constants/strings';

/** Main pantry screen listing all items grouped by category. */
export default function PantryScreen() {
  const router = useRouter();
  const {
    groupedItems,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    deleteItem,
    refresh,
  } = usePantry();

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sections = Object.entries(groupedItems).map(([category, items]) => ({
    title: category,
    data: items,
  }));

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleItemPress = (item: typeof sections[number]['data'][number]) => {
    if (bulkMode) {
      toggleSelection(item.id);
    } else {
      router.push({ pathname: '/pantry/edit', params: { id: item.id } });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(PANTRY_STRINGS.DELETE_ITEM, PANTRY_STRINGS.DELETE_CONFIRM, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  return (
    <View className="flex-1 bg-neutral-50">
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={PANTRY_STRINGS.SEARCH_PLACEHOLDER}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {sections.length === 0 ? (
        <EmptyState
          message={PANTRY_STRINGS.EMPTY_STATE}
          actionLabel={PANTRY_STRINGS.ADD_ITEM}
          onAction={() => router.push('/pantry/add')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text className="bg-neutral-50 px-4 pb-1 pt-3 text-sm font-semibold uppercase text-neutral-400">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <PantryItemCard
              item={item}
              onPress={() => handleItemPress(item)}
              onLongPress={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      <View className="absolute bottom-6 right-4 flex-row">
        <Pressable
          onPress={() => router.push('/pantry/quick-add')}
          className="mr-3 h-12 items-center justify-center rounded-full bg-accent-500 px-5 shadow-md"
        >
          <Text className="text-sm font-semibold text-white">{PANTRY_STRINGS.QUICK_ADD}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/pantry/add')}
          className="h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-md"
        >
          <Text className="text-2xl text-white">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
