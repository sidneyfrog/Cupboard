import React from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { RECIPE_STRINGS } from '@/constants/strings';
import type { Recipe } from '@/types';

interface RecipeDetailProps {
  recipe: Recipe;
  onMarkAsMade: () => void;
  onToggleFavourite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Full recipe detail view with ingredients, steps, and action buttons. */
export function RecipeDetail({
  recipe,
  onMarkAsMade,
  onToggleFavourite,
  onEdit,
  onDelete,
}: RecipeDetailProps) {
  const confirmMarkAsMade = () => {
    Alert.alert(RECIPE_STRINGS.MARK_AS_MADE, RECIPE_STRINGS.MADE_CONFIRM, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: onMarkAsMade },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(RECIPE_STRINGS.DELETE_RECIPE, RECIPE_STRINGS.DELETE_CONFIRM, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {recipe.imageUrl && (
        <Image
          source={{ uri: recipe.imageUrl }}
          className="h-56 w-full"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        <Text className="text-2xl font-bold text-neutral-800">{recipe.title}</Text>
        {recipe.description ? (
          <Text className="mt-2 text-base text-neutral-500">{recipe.description}</Text>
        ) : null}

        {recipe.tags.length > 0 && (
          <View className="mt-3 flex-row flex-wrap">
            {recipe.tags.map((tag) => (
              <View key={tag} className="mr-1.5 mb-1 rounded-full bg-neutral-100 px-3 py-1">
                <Text className="text-xs text-neutral-500">{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <Text className="mt-6 mb-3 text-lg font-semibold text-neutral-800">
          {RECIPE_STRINGS.INGREDIENTS_LABEL}
        </Text>
        {recipe.ingredients.map((ing, index) => (
          <View key={index} className="mb-1.5 flex-row">
            <Text className="text-base text-neutral-400">• </Text>
            <Text className="flex-1 text-base text-neutral-700">
              {ing.quantity} {ing.unit} {ing.name}
            </Text>
          </View>
        ))}

        <Text className="mt-6 mb-3 text-lg font-semibold text-neutral-800">
          {RECIPE_STRINGS.STEPS_LABEL}
        </Text>
        {recipe.steps.map((step, index) => (
          <View key={index} className="mb-3 flex-row">
            <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-primary-100">
              <Text className="text-sm font-semibold text-primary-700">{index + 1}</Text>
            </View>
            <Text className="flex-1 pt-0.5 text-base leading-6 text-neutral-700">
              {step}
            </Text>
          </View>
        ))}

        <View className="mt-6 mb-8">
          <View className="mb-3 flex-row">
            <View className="mr-2 flex-1">
              <Button
                label={recipe.isFavourite ? RECIPE_STRINGS.UNFAVOURITE : RECIPE_STRINGS.FAVOURITE}
                onPress={onToggleFavourite}
                variant="outline"
              />
            </View>
            <View className="flex-1">
              <Button label={RECIPE_STRINGS.MARK_AS_MADE} onPress={confirmMarkAsMade} />
            </View>
          </View>
          <View className="flex-row">
            <View className="mr-2 flex-1">
              <Button label={COMMON_EDIT} onPress={onEdit} variant="secondary" />
            </View>
            <View className="flex-1">
              <Button label={COMMON_DELETE} onPress={confirmDelete} variant="danger" />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const COMMON_EDIT = 'Edit';
const COMMON_DELETE = 'Delete';
