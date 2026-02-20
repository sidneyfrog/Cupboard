import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePantry } from '@/hooks/use-pantry';
import { useAuthStore } from '@/store/auth-store';
import { PantryItemForm } from '@/components/pantry/pantry-item-form';
import { COMMON_STRINGS } from '@/constants/strings';
import type { PantryCategory, Unit } from '@/constants/categories';

/** Screen for manually adding a new item to the pantry. */
export default function AddPantryItemScreen() {
  const router = useRouter();
  const { createItem } = usePantry();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    quantity: number;
    unit: Unit;
    category: PantryCategory;
    expiryDate?: string;
    barcode?: string;
    imageUrl?: string;
  }) => {
    if (!user) return;
    setLoading(true);
    try {
      const created = await createItem({
        ...values,
        userId: user.id,
      });
      if (!created) {
        Alert.alert(COMMON_STRINGS.ERROR, 'Failed to save item. Please try again.');
        return;
      }
      router.back();
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PantryItemForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      loading={loading}
    />
  );
}
