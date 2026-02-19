import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermission } from '@/hooks/use-camera-permission';
import { usePantry } from '@/hooks/use-pantry';
import { useAuthStore } from '@/store/auth-store';
import { DetectedItemsList } from '@/components/scan/detected-items-list';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SCAN_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import type { DetectedIngredient } from '@/types/scan';

/**
 * Ingredient recognition screen.
 * Uses the device camera to photograph ingredients and an ML model
 * to identify them. In production, integrate an Expo-compatible
 * vision model such as TensorFlow Lite via expo-tf-lite or a
 * cloud vision API (e.g. Google Cloud Vision).
 */
export default function IngredientScanScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission, openSettings } = useCameraPermission();
  const { createItem } = usePantry();
  const user = useAuthStore((s) => s.user);
  const [processing, setProcessing] = useState(false);
  const [detected, setDetected] = useState<DetectedIngredient[] | null>(null);
  const [saving, setSaving] = useState(false);

  const capturePhoto = async () => {
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
    processImage(result.assets[0].uri);
  };

  const processImage = async (_uri: string) => {
    setProcessing(true);
    try {
      /**
       * ML integration point:
       * In production, use an on-device or cloud vision model:
       *
       * Option A — Google Cloud Vision API:
       *   const response = await fetch('https://vision.googleapis.com/v1/images:annotate', ...);
       *   const labels = response.labelAnnotations;
       *
       * Option B — TensorFlow Lite (expo-tf-lite):
       *   import { loadModel, classify } from 'expo-tf-lite';
       *   const model = await loadModel(require('./food-model.tflite'));
       *   const results = await classify(uri);
       *
       * For now, we demonstrate the flow with placeholder data.
       */
      const items = await simulateIngredientDetection();
      setDetected(items);
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to identify ingredients.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleItem = (index: number) => {
    if (!detected) return;
    const updated = [...detected];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setDetected(updated);
  };

  const confirmItems = async () => {
    if (!detected || !user) return;
    setSaving(true);
    try {
      const selected = detected.filter((i) => i.selected);
      for (const item of selected) {
        await createItem({
          name: item.name,
          quantity: 1,
          unit: 'units',
          category: 'Produce',
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

  if (detected) {
    return (
      <DetectedItemsList
        items={detected}
        onToggle={toggleItem}
        onConfirm={confirmItems}
        onCancel={() => setDetected(null)}
        loading={saving}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-center text-lg font-semibold text-neutral-800">
        {SCAN_STRINGS.INGREDIENT_SCAN}
      </Text>
      <Text className="mb-6 text-center text-base text-neutral-500">
        Take a photo of ingredients or food items to identify them automatically.
      </Text>
      <Button label="Take Photo" onPress={capturePhoto} />
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
 * Placeholder ingredient detection simulation.
 * Replace with actual ML model inference in production.
 */
async function simulateIngredientDetection(): Promise<DetectedIngredient[]> {
  return [
    { name: 'Tomato', confidence: 0.95, selected: true },
    { name: 'Onion', confidence: 0.88, selected: true },
    { name: 'Garlic', confidence: 0.82, selected: true },
    { name: 'Bell Pepper', confidence: 0.76, selected: true },
    { name: 'Basil', confidence: 0.71, selected: true },
  ];
}
