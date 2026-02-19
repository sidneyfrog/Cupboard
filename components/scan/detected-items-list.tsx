import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { Button } from '@/components/ui/button';
import { SCAN_STRINGS, COMMON_STRINGS } from '@/constants/strings';

interface DetectedItem {
  name: string;
  selected: boolean;
}

interface DetectedItemsListProps {
  items: DetectedItem[];
  onToggle: (index: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/** Displays a list of detected items (from OCR or ML) for user review and selection. */
export function DetectedItemsList({
  items,
  onToggle,
  onConfirm,
  onCancel,
  loading = false,
}: DetectedItemsListProps) {
  return (
    <View className="flex-1 bg-white">
      <Text className="px-4 pt-4 text-lg font-semibold text-neutral-800">
        {SCAN_STRINGS.REVIEW_ITEMS}
      </Text>
      <Text className="px-4 pb-2 text-sm text-neutral-500">
        Tap items to select or deselect them.
      </Text>

      <FlatList
        data={items}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onToggle(index)}
            className={`mx-4 mb-2 flex-row items-center rounded-xl border px-4 py-3 ${
              item.selected
                ? 'border-primary-200 bg-primary-50'
                : 'border-neutral-100 bg-neutral-50'
            }`}
          >
            <View
              className={`mr-3 h-5 w-5 items-center justify-center rounded border ${
                item.selected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 bg-white'
              }`}
            >
              {item.selected && <Text className="text-xs text-white">✓</Text>}
            </View>
            <Text className="flex-1 text-base text-neutral-700">{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-neutral-400">{SCAN_STRINGS.NO_RESULTS}</Text>
          </View>
        }
      />

      <View className="flex-row border-t border-neutral-100 p-4">
        <View className="mr-2 flex-1">
          <Button label={COMMON_STRINGS.CANCEL} onPress={onCancel} variant="outline" />
        </View>
        <View className="flex-1">
          <Button
            label={SCAN_STRINGS.CONFIRM_ADD}
            onPress={onConfirm}
            loading={loading}
            disabled={!items.some((i) => i.selected)}
          />
        </View>
      </View>
    </View>
  );
}
