import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SCAN_STRINGS } from '@/constants/strings';

interface ScanOption {
  label: string;
  description: string;
  route: string;
  icon: string;
}

const SCAN_OPTIONS: ScanOption[] = [
  {
    label: SCAN_STRINGS.BARCODE_SCAN,
    description: 'Scan a product barcode to add it to your pantry.',
    route: '/scan/barcode',
    icon: '📊',
  },
  {
    label: SCAN_STRINGS.RECEIPT_SCAN,
    description: 'Photograph a receipt to extract items automatically.',
    route: '/scan/receipt',
    icon: '🧾',
  },
  {
    label: SCAN_STRINGS.INGREDIENT_SCAN,
    description: 'Point your camera at ingredients to identify them.',
    route: '/scan/ingredient',
    icon: '🥕',
  },
  {
    label: SCAN_STRINGS.RECIPE_SCAN,
    description: 'Scan a recipe from a cookbook or printed page.',
    route: '/scan/recipe-scan',
    icon: '📄',
  },
];

/** Scan hub screen with options for barcode, receipt, ingredient, and recipe scanning. */
export default function ScanScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-neutral-50 px-4 pt-4">
      <Text className="mb-6 text-center text-2xl font-bold text-neutral-800">
        {SCAN_STRINGS.TITLE}
      </Text>

      {SCAN_OPTIONS.map((option) => (
        <Pressable
          key={option.route}
          onPress={() => router.push(option.route as never)}
          className="mb-3 flex-row items-center rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
        >
          <Text className="mr-4 text-3xl">{option.icon}</Text>
          <View className="flex-1">
            <Text className="text-base font-semibold text-neutral-800">{option.label}</Text>
            <Text className="mt-0.5 text-sm text-neutral-500">{option.description}</Text>
          </View>
          <Text className="text-neutral-300">›</Text>
        </Pressable>
      ))}
    </View>
  );
}
