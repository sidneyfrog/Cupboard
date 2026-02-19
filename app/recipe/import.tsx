import React, { useState } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { useAuthStore } from '@/store/auth-store';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { parseRecipeText } from '@/services/scan-service';
import { RECIPE_STRINGS, COMMON_STRINGS } from '@/constants/strings';
import type { Unit } from '@/constants/categories';

/** Screen for importing a recipe by pasting text or a URL. */
export default function ImportRecipeScreen() {
  const router = useRouter();
  const { createRecipe } = useRecipes();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImportFromText = async () => {
    if (!text.trim()) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please paste recipe text.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const parsed = parseRecipeText(text);
      await createRecipe({
        title: parsed.title,
        description: parsed.description,
        ingredients: parsed.ingredients.map((i) => ({
          ...i,
          unit: i.unit as Unit,
        })),
        steps: parsed.steps,
        tags: parsed.tags,
        source: 'imported',
        isFavourite: false,
        userId: user.id,
      });
      router.back();
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to parse recipe text.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      Alert.alert(COMMON_STRINGS.ERROR, 'Please enter a URL.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(url);
      const html = await response.text();
      const textContent = html.replace(/<[^>]*>/g, '\n').replace(/\n{3,}/g, '\n\n');
      const parsed = parseRecipeText(textContent);
      await createRecipe({
        title: parsed.title,
        description: parsed.description,
        ingredients: parsed.ingredients.map((i) => ({
          ...i,
          unit: i.unit as Unit,
        })),
        steps: parsed.steps,
        tags: parsed.tags,
        source: 'imported',
        isFavourite: false,
        userId: user.id,
      });
      router.back();
    } catch {
      Alert.alert(COMMON_STRINGS.ERROR, 'Failed to import recipe from URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <Text className="mb-4 text-lg font-semibold text-neutral-800">
        {RECIPE_STRINGS.IMPORT_URL}
      </Text>
      <FormField
        label="URL"
        placeholder="https://example.com/recipe"
        value={url}
        onChangeText={setUrl}
        keyboardType="url"
        autoCapitalize="none"
      />
      <Button
        label={RECIPE_STRINGS.IMPORT_URL}
        onPress={handleImportFromUrl}
        loading={loading}
      />

      <View className="my-6 flex-row items-center">
        <View className="flex-1 border-b border-neutral-200" />
        <Text className="mx-4 text-neutral-400">or</Text>
        <View className="flex-1 border-b border-neutral-200" />
      </View>

      <Text className="mb-4 text-lg font-semibold text-neutral-800">
        {RECIPE_STRINGS.IMPORT_TEXT}
      </Text>
      <FormField
        label="Recipe Text"
        placeholder="Paste the full recipe text here..."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={10}
      />
      <View className="mb-8">
        <Button
          label={RECIPE_STRINGS.IMPORT_TEXT}
          onPress={handleImportFromText}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}
