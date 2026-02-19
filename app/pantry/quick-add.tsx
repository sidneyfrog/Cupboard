import React from 'react';
import { useRouter } from 'expo-router';
import { QuickAdd } from '@/components/pantry/quick-add';
import { usePantry } from '@/hooks/use-pantry';
import { useAuthStore } from '@/store/auth-store';

/** Screen for quickly adding a common ingredient to the pantry. */
export default function QuickAddScreen() {
  const router = useRouter();
  const { createItem } = usePantry();
  const user = useAuthStore((s) => s.user);

  const handleSelect = async (name: string) => {
    if (!user) return;
    await createItem({
      name,
      quantity: 1,
      unit: 'units',
      category: 'Other',
      userId: user.id,
    });
    router.back();
  };

  return <QuickAdd onSelect={handleSelect} />;
}
