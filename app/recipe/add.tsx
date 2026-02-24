import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { useAuthStore } from '@/store/auth-store';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { COMMON_STRINGS, AUTH_REQUIRED_STRINGS } from '@/constants/strings';
import type { RecipeIngredient, RecipeSource } from '@/types';

/** Screen for creating a new recipe manually. */
export default function AddRecipeScreen() {
  const router = useRouter();
  const { createRecipe } = useRecipes();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    title: string;
    description: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    tags: string[];
    source: RecipeSource;
  }) => {
    if (!user) {
      Alert.alert(AUTH_REQUIRED_STRINGS.TITLE, AUTH_REQUIRED_STRINGS.MESSAGE, [
        { text: COMMON_STRINGS.CANCEL, style: 'cancel' },
        { text: AUTH_REQUIRED_STRINGS.SIGN_IN, onPress: () => router.replace('/auth') },
      ]);
      return;
    }
    setLoading(true);
    await createRecipe({
      ...values,
      isFavourite: false,
      userId: user.id,
    });
    setLoading(false);
    router.back();
  };

  return (
    <RecipeForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      loading={loading}
    />
  );
}
