import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermission } from '@/hooks/use-camera-permission';
import { usePantry } from '@/hooks/use-pantry';
import { useAuthStore } from '@/store/auth-store';
import { parseReceiptText } from '@/services/scan-service';
import { DetectedItemsList } from '@/components/scan/detected-items-list';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SCAN_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import type { DetectedReceiptItem } from '@/types/scan';

/**
 * Receipt scanning screen.
 * Uses expo-image-picker to capture a receipt photo and a text recognition
 * placeholder for OCR processing. In a full build, integrate
 * @react-native-ml-kit/text-recognition or expo-compatible OCR.
 */
export default function ReceiptScanScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission, openSettings } = useCameraPermission();
  const { createItem } = usePantry();
  const user = useAuthStore((s) => s.user);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedReceiptItem[] | null>(null);
  const [saving, setSaving] = useState(false);

  const captureReceipt = async () => {
    if (hasPermission === false) {
      const granted = await requestPermission();
      if (!granted) {
        openSettings();
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    setImageUri(result.assets[0].uri);
    processReceipt(result.assets[0].uri);
  };

  const processReceipt = async (_uri: string) => {
    setProcessing(true);
    try {
      /**
       * OCR integration point:
       * In production, use @react-native-ml-kit/text-recognition:
       *   import TextRecognition from '@react-native-ml-kit/text-recognition';
       *   const result = await TextRecognition.recognize(uri);
       *   const ocrText = result.text;
       *
       * For now, we demonstrate the flow with a placeholder.
       */
      const ocrText = await simulateOcr();
      const items = parseReceiptText(ocrText);
      setDetectedItems(items);
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to process receipt.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleItem = (index: number) => {
    if (!detectedItems) return;
    const updated = [...detectedItems];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setDetectedItems(updated);
  };

  const confirmItems = async () => {
    if (!detectedItems || !user) return;
    setSaving(true);
    try {
      const selected = detectedItems.filter((i) => i.selected);
      for (const item of selected) {
        await createItem({
          name: item.name,
          quantity: 1,
          unit: 'units',
          category: 'Other',
          userId: user.id,
        });
      }
      router.back();
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to add items.');
    } finally {
      setSaving(false);
    }
  };

  if (processing) return <LoadingSpinner message={SCAN_STRINGS.PROCESSING} />;

  if (detectedItems) {
    return (
      <DetectedItemsList
        items={detectedItems}
        onToggle={toggleItem}
        onConfirm={confirmItems}
        onCancel={() => {
          setDetectedItems(null);
          setImageUri(null);
        }}
        loading={saving}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="mb-4 h-64 w-64 rounded-xl" resizeMode="contain" />
      ) : null}
      <Text className="mb-6 text-center text-base text-neutral-500">
        Take a photo of your receipt to automatically detect items.
      </Text>
      <Button label="Capture Receipt" onPress={captureReceipt} />
      {hasPermission === false && (
        <View className="mt-4">
          <Text className="mb-2 text-center text-sm text-neutral-400">
            {SCAN_STRINGS.CAMERA_PERMISSION_MESSAGE}
          </Text>
          <Button label={SCAN_STRINGS.OPEN_SETTINGS} onPress={openSettings} variant="outline" />
        </View>
      )}
    </View>
  );
}

/**
 * Placeholder OCR simulation.
 * Replace with actual ML Kit text recognition in production.
 */
async function simulateOcr(): Promise<string> {
  return [
    'GROCERY MART',
    'Date: 2026-02-19',
    '',
    'Whole Milk 2L',
    'Free Range Eggs x12',
    'Sourdough Bread',
    'Chicken Breast 500g',
    'Broccoli',
    'Cheddar Cheese 200g',
    '',
    'SUBTOTAL $24.50',
    'TAX $2.45',
    'TOTAL $26.95',
    'VISA ****1234',
    'THANK YOU',
  ].join('\n');
}
