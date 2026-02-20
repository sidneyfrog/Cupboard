import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePantry } from '@/hooks/use-pantry';
import { PantryItemForm } from '@/components/pantry/pantry-item-form';
import { ErrorMessage } from '@/components/ui/error-message';
import { COMMON_STRINGS } from '@/constants/strings';
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
    try {
      const updated = await editItem(id, values);
      if (!updated) {
        Alert.alert(COMMON_STRINGS.ERROR, 'Failed to update item. Please try again.');
        return;
      }
      router.back();
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
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
