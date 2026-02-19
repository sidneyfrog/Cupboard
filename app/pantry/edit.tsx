import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePantry } from '@/hooks/use-pantry';
import { PantryItemForm } from '@/components/pantry/pantry-item-form';
import { ErrorMessage } from '@/components/ui/error-message';
import type { PantryCategory, Unit } from '@/constants/categories';

/** Screen for editing an existing pantry item. */
export default function EditPantryItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, editItem } = usePantry();
  const [loading, setLoading] = useState(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View className="flex-1 bg-white">
        <ErrorMessage message="Item not found." />
      </View>
    );
  }

  const handleSubmit = async (values: {
    name: string;
    quantity: number;
    unit: Unit;
    category: PantryCategory;
    expiryDate?: string;
    barcode?: string;
    imageUrl?: string;
  }) => {
    setLoading(true);
    await editItem(id, values);
    setLoading(false);
    router.back();
  };

  return (
    <PantryItemForm
      initialValues={item}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      loading={loading}
    />
  );
}
