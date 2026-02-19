import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useCameraPermission } from '@/hooks/use-camera-permission';
import { usePantry } from '@/hooks/use-pantry';
import { useAuthStore } from '@/store/auth-store';
import { lookupBarcode } from '@/services/scan-service';
import { PantryItemForm } from '@/components/pantry/pantry-item-form';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SCAN_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import type { BarcodeLookupResult } from '@/types/scan';
import type { PantryCategory, Unit } from '@/constants/categories';

/** Barcode scanning screen that looks up products via Open Food Facts. */
export default function BarcodeScanScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission, openSettings } = useCameraPermission();
  const { createItem } = usePantry();
  const user = useAuthStore((s) => s.user);
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BarcodeLookupResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!scanning || processing) return;
    setScanning(false);
    setProcessing(true);

    try {
      const lookupResult = await lookupBarcode(data);
      setResult(lookupResult);
      if (!lookupResult.found) {
        Alert.alert(SCAN_STRINGS.PRODUCT_NOT_FOUND, SCAN_STRINGS.PRODUCT_NOT_FOUND);
      }
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, COMMON_STRINGS.ERROR);
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (values: {
    name: string;
    quantity: number;
    unit: Unit;
    category: PantryCategory;
    expiryDate?: string;
    barcode?: string;
    imageUrl?: string;
  }) => {
    if (!user) return;
    setSaving(true);
    await createItem({
      ...values,
      barcode: result?.barcode,
      imageUrl: result?.imageUrl ?? values.imageUrl,
      userId: user.id,
    });
    setSaving(false);
    router.back();
  };

  if (hasPermission === null) return <LoadingSpinner />;

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-neutral-800">
          {SCAN_STRINGS.CAMERA_PERMISSION_TITLE}
        </Text>
        <Text className="mb-6 text-center text-base text-neutral-500">
          {SCAN_STRINGS.CAMERA_PERMISSION_MESSAGE}
        </Text>
        <Button label={SCAN_STRINGS.OPEN_SETTINGS} onPress={openSettings} />
      </View>
    );
  }

  if (result?.found) {
    return (
      <PantryItemForm
        initialValues={{
          name: result.productName ?? '',
          barcode: result.barcode,
          imageUrl: result.imageUrl,
          category: (result.category as PantryCategory) ?? 'Other',
        }}
        onSubmit={handleSave}
        onCancel={() => {
          setResult(null);
          setScanning(true);
        }}
        loading={saving}
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      {processing && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-black/60">
          <LoadingSpinner message={SCAN_STRINGS.PROCESSING} />
        </View>
      )}
      <CameraView
        className="flex-1"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
      />
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <Text className="rounded-full bg-black/50 px-4 py-2 text-sm text-white">
          Point camera at a barcode
        </Text>
      </View>
    </View>
  );
}
