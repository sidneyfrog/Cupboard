import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { PantryItem } from '@/types';
import { formatDate, daysUntil } from '@/utils';

interface PantryItemCardProps {
  item: PantryItem;
  onPress: () => void;
  onLongPress?: () => void;
}

/** Displays a single pantry item with name, quantity, and expiry status. */
export function PantryItemCard({ item, onPress, onLongPress }: PantryItemCardProps) {
  const expiryDays = item.expiryDate ? daysUntil(item.expiryDate) : null;
  const isExpiringSoon = expiryDays !== null && expiryDays >= 0 && expiryDays <= 3;
  const isExpired = expiryDays !== null && expiryDays < 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="mx-4 mb-2 flex-row items-center rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-800">{item.name}</Text>
        <Text className="mt-0.5 text-sm text-neutral-500">
          {item.quantity} {item.unit}
        </Text>
      </View>

      <View className="items-end">
        {item.expiryDate && (
          <Text
            className={`text-xs font-medium ${
              isExpired
                ? 'text-red-500'
                : isExpiringSoon
                ? 'text-amber-500'
                : 'text-neutral-400'
            }`}
          >
            {isExpired
              ? 'Expired'
              : isExpiringSoon
              ? `Expires in ${expiryDays}d`
              : formatDate(item.expiryDate)}
          </Text>
        )}
        <Text className="mt-0.5 text-xs text-neutral-300">{item.category}</Text>
      </View>
    </Pressable>
  );
}
