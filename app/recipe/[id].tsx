import React from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { RecipeDetail } from '@/components/recipe/recipe-detail';
import { ErrorMessage } from '@/components/ui/error-message';

/** Screen displaying the full details of a recipe. */
export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, toggleFavourite, markAsMade, deleteRecipe } = useRecipes();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View className="flex-1 bg-white">
        <ErrorMessage message="Recipe not found." />
      </View>
    );
  }

  return (
    <RecipeDetail
      recipe={recipe}
      onMarkAsMade={() => {
        markAsMade(recipe.id);
        router.back();
      }}
      onToggleFavourite={() => toggleFavourite(recipe.id)}
      onEdit={() => router.push({ pathname: '/recipe/edit', params: { id: recipe.id } })}
      onDelete={async () => {
        await deleteRecipe(recipe.id);
        router.back();
      }}
    />
  );
}
