import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import type { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  missingCount?: number;
  badgeLabel?: string;
}

/** Displays a recipe summary card with image, title, tags, and optional badge. */
export function RecipeCard({ recipe, onPress, missingCount, badgeLabel }: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mb-3 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm"
    >
      {recipe.imageUrl && (
        <Image
          source={{ uri: recipe.imageUrl }}
          className="h-40 w-full"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <Text className="flex-1 text-lg font-semibold text-neutral-800">
            {recipe.title}
          </Text>
          {recipe.isFavourite && (
            <Text className="ml-2 text-lg text-red-400">♥</Text>
          )}
        </View>

        {recipe.description ? (
          <Text className="mt-1 text-sm text-neutral-500" numberOfLines={2}>
            {recipe.description}
          </Text>
        ) : null}

        {badgeLabel && (
          <View className="mt-2 self-start rounded-full bg-primary-100 px-3 py-1">
            <Text className="text-xs font-medium text-primary-700">{badgeLabel}</Text>
          </View>
        )}

        {missingCount !== undefined && missingCount > 0 && (
          <Text className="mt-1.5 text-xs text-amber-500">
            Missing {missingCount} ingredient{missingCount !== 1 ? 's' : ''}
          </Text>
        )}

        {recipe.tags.length > 0 && (
          <View className="mt-2 flex-row flex-wrap">
            {recipe.tags.slice(0, 4).map((tag) => (
              <View key={tag} className="mr-1.5 mb-1 rounded-full bg-neutral-100 px-2.5 py-0.5">
                <Text className="text-xs text-neutral-500">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
