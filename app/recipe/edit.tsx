import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { RecipeForm } from '@/components/recipe/recipe-form';
import { ErrorMessage } from '@/components/ui/error-message';
import type { RecipeIngredient, RecipeSource } from '@/types';

/** Screen for editing an existing recipe. */
export default function EditRecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, editRecipe } = useRecipes();
  const [loading, setLoading] = useState(false);

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View className="flex-1 bg-white">
        <ErrorMessage message="Recipe not found." />
      </View>
    );
  }

  const handleSubmit = async (values: {
    title: string;
    description: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    tags: string[];
    source: RecipeSource;
  }) => {
    setLoading(true);
    await editRecipe(id, values);
    setLoading(false);
    router.back();
  };

  return (
    <RecipeForm
      initialValues={recipe}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      loading={loading}
    />
  );
}
