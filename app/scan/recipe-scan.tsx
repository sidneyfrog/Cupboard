import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermission } from '@/hooks/use-camera-permission';
import { useRecipes } from '@/hooks/use-recipes';
import { useAuthStore } from '@/store/auth-store';
import { parseRecipeText } from '@/services/scan-service';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SCAN_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import type { RecipeIngredient, RecipeSource } from '@/types';
import type { Unit } from '@/constants/categories';

/**
 * Recipe scanning screen.
 * Captures a photo of a recipe from a cookbook, performs OCR,
 * and pre-fills a recipe form for user review.
 */
export default function RecipeScanScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission, openSettings } = useCameraPermission();
  const { createRecipe } = useRecipes();
  const user = useAuthStore((s) => s.user);
  const [processing, setProcessing] = useState(false);
  const [parsedValues, setParsedValues] = useState<{
    title: string;
    description: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    tags: string[];
    source: RecipeSource;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const captureRecipe = async () => {
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
    processRecipeImage(result.assets[0].uri);
  };

  const processRecipeImage = async (_uri: string) => {
    setProcessing(true);
    try {
      /**
       * OCR integration point (same as receipt scanning):
       * Use @react-native-ml-kit/text-recognition in production.
       */
      const ocrText = await simulateRecipeOcr();
      const parsed = parseRecipeText(ocrText);
      setParsedValues({
        title: parsed.title,
        description: parsed.description,
        ingredients: parsed.ingredients.map((i) => ({
          ...i,
          unit: i.unit as Unit,
        })),
        steps: parsed.steps,
        tags: parsed.tags,
        source: 'scanned',
      });
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to process recipe image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    tags: string[];
    source: RecipeSource;
  }) => {
    if (!user) return;
    setSaving(true);
    await createRecipe({
      ...values,
      isFavourite: false,
      userId: user.id,
    });
    setSaving(false);
    router.back();
  };

  if (processing) return <LoadingSpinner message={SCAN_STRINGS.PROCESSING} />;

  if (parsedValues) {
    return (
      <RecipeForm
        initialValues={parsedValues}
        onSubmit={handleSubmit}
        onCancel={() => setParsedValues(null)}
        loading={saving}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-center text-lg font-semibold text-neutral-800">
        {SCAN_STRINGS.RECIPE_SCAN}
      </Text>
      <Text className="mb-6 text-center text-base text-neutral-500">
        Take a photo of a recipe from a cookbook or printed page to scan it in.
      </Text>
      <Button label="Scan Recipe" onPress={captureRecipe} />
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
 * Placeholder recipe OCR simulation.
 * Replace with actual ML Kit text recognition in production.
 */
async function simulateRecipeOcr(): Promise<string> {
  return [
    'Classic Tomato Pasta',
    '',
    'Ingredients',
    '400g spaghetti',
    '2 cans crushed tomatoes',
    '3 cloves garlic',
    '2 tbsp olive oil',
    '1 tsp salt',
    '1 tsp pepper',
    '10 leaves basil',
    '',
    'Instructions',
    '1. Cook the spaghetti in a large pot of boiling salted water until al dente.',
    '2. Heat olive oil in a pan over medium heat. Add minced garlic and cook for 1 minute.',
    '3. Add the crushed tomatoes, salt, and pepper. Simmer for 15 minutes.',
    '4. Drain the pasta and toss with the sauce.',
    '5. Garnish with fresh basil and serve immediately.',
  ].join('\n');
}
