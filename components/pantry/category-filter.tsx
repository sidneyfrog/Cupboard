import React from 'react';
import { ScrollView } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { PANTRY_CATEGORIES } from '@/constants/categories';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

/** Horizontal scrollable chip list for filtering pantry items by category. */
export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      <Chip
        label="All"
        selected={selectedCategory === null}
        onPress={() => onSelectCategory(null)}
      />
      {PANTRY_CATEGORIES.map((cat) => (
        <Chip
          key={cat}
          label={cat}
          selected={selectedCategory === cat}
          onPress={() => onSelectCategory(selectedCategory === cat ? null : cat)}
        />
      ))}
    </ScrollView>
  );
}
