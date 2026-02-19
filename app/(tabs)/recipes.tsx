import React from 'react';
import { View, Text, SectionList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { SearchBar } from '@/components/ui/search-bar';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { RECIPE_STRINGS } from '@/constants/strings';
import type { ScoredRecipe } from '@/types';

/** Recipes screen showing recommendations and the user's recipe collection. */
export default function RecipesScreen() {
  const router = useRouter();
  const {
    filteredRecipes,
    recommendations,
    isLoading,
    error,
    searchQuery,
    showFavouritesOnly,
    setSearchQuery,
    setShowFavouritesOnly,
    refresh,
  } = useRecipes();

  const categoryLabel = (category: ScoredRecipe['category']): string => {
    switch (category) {
      case 'can_make_now':
        return RECIPE_STRINGS.CAN_MAKE_NOW;
      case 'almost_there':
        return RECIPE_STRINGS.ALMOST_THERE;
      case 'missing_a_few':
        return RECIPE_STRINGS.MISSING_A_FEW;
    }
  };

  const sections = [
    {
      title: RECIPE_STRINGS.CAN_MAKE_NOW,
      data: recommendations.filter((r) => r.category === 'can_make_now'),
    },
    {
      title: RECIPE_STRINGS.ALMOST_THERE,
      data: recommendations.filter((r) => r.category === 'almost_there'),
    },
    {
      title: RECIPE_STRINGS.MISSING_A_FEW,
      data: recommendations.filter((r) => r.category === 'missing_a_few'),
    },
  ].filter((s) => s.data.length > 0);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  return (
    <View className="flex-1 bg-neutral-50">
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search recipes..."
      />

      <View className="flex-row px-4 pb-2">
        <Pressable
          onPress={() => setShowFavouritesOnly(!showFavouritesOnly)}
          className={`rounded-full px-4 py-2 ${
            showFavouritesOnly ? 'bg-primary-500' : 'bg-neutral-100'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              showFavouritesOnly ? 'text-white' : 'text-neutral-600'
            }`}
          >
            Favourites
          </Text>
        </Pressable>
      </View>

      {sections.length === 0 && filteredRecipes.length === 0 ? (
        <EmptyState
          message={RECIPE_STRINGS.EMPTY_STATE}
          actionLabel={RECIPE_STRINGS.ADD_RECIPE}
          onAction={() => router.push('/recipe/add')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.recipe.id}
          renderSectionHeader={({ section }) => (
            <Text className="bg-neutral-50 px-4 pb-1 pt-3 text-sm font-semibold uppercase text-neutral-400">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item.recipe}
              onPress={() =>
                router.push({ pathname: '/recipe/[id]', params: { id: item.recipe.id } })
              }
              missingCount={item.missingIngredients.length}
              badgeLabel={categoryLabel(item.category)}
            />
          )}
        />
      )}

      <Pressable
        onPress={() => router.push('/recipe/add')}
        className="absolute bottom-6 right-4 h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-md"
      >
        <Text className="text-2xl text-white">+</Text>
      </Pressable>
    </View>
  );
}
