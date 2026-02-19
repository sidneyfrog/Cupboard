import { useCallback, useEffect } from 'react';
import { useRecipeStore } from '@/store/recipe-store';
import { useAuthStore } from '@/store/auth-store';
import { usePantryStore } from '@/store/pantry-store';
import * as recipeService from '@/services/recipe-service';
import { getRecommendedRecipes } from '@/services/recommendation-service';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/types';
import { RECIPE_STRINGS } from '@/constants/strings';

/** Hook providing recipe CRUD, favourites, recommendations, and pantry deduction. */
export function useRecipes() {
  const {
    recipes,
    recommendations,
    isLoading,
    error,
    searchQuery,
    filterTags,
    showFavouritesOnly,
    setRecipes,
    addRecipe,
    updateRecipe: updateStoreRecipe,
    removeRecipe,
    toggleFavourite: toggleStoreFavourite,
    setRecommendations,
    setLoading,
    setError,
    setSearchQuery,
    setFilterTags,
    setShowFavouritesOnly,
  } = useRecipeStore();

  const user = useAuthStore((s) => s.user);
  const pantryItems = usePantryStore((s) => s.items);
  const deductIngredients = usePantryStore((s) => s.deductIngredients);

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await recipeService.fetchRecipes(user.id);
      setRecipes(fetched);
    } catch {
      setError(RECIPE_STRINGS.TITLE);
    } finally {
      setLoading(false);
    }
  }, [user, setRecipes, setLoading, setError]);

  const createRecipe = useCallback(
    async (input: CreateRecipeInput) => {
      setError(null);
      try {
        const created = await recipeService.createRecipe(input);
        addRecipe(created);
        return created;
      } catch {
        setError(RECIPE_STRINGS.ADD_RECIPE);
        return null;
      }
    },
    [addRecipe, setError]
  );

  const editRecipe = useCallback(
    async (id: string, updates: UpdateRecipeInput) => {
      setError(null);
      try {
        const updated = await recipeService.updateRecipe(id, updates);
        updateStoreRecipe(id, updated);
        return updated;
      } catch {
        setError(RECIPE_STRINGS.EDIT_RECIPE);
        return null;
      }
    },
    [updateStoreRecipe, setError]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await recipeService.deleteRecipe(id);
        removeRecipe(id);
      } catch {
        setError(RECIPE_STRINGS.DELETE_RECIPE);
      }
    },
    [removeRecipe, setError]
  );

  const toggleFavourite = useCallback(
    async (id: string) => {
      const recipe = recipes.find((r) => r.id === id);
      if (!recipe) return;
      toggleStoreFavourite(id);
      try {
        await recipeService.toggleRecipeFavourite(id, !recipe.isFavourite);
      } catch {
        toggleStoreFavourite(id);
        setError(RECIPE_STRINGS.FAVOURITE);
      }
    },
    [recipes, toggleStoreFavourite, setError]
  );

  /** Marks a recipe as made and deducts its ingredients from the pantry. */
  const markAsMade = useCallback(
    (recipeId: string) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;

      const deductions = recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
      }));
      deductIngredients(deductions);
    },
    [recipes, deductIngredients]
  );

  /** Refreshes recommendations based on current pantry and recipes. */
  const refreshRecommendations = useCallback(() => {
    const scored = getRecommendedRecipes(pantryItems, recipes);
    setRecommendations(scored);
  }, [pantryItems, recipes, setRecommendations]);

  /** Returns recipes filtered by search, tags, and favourites toggle. */
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      searchQuery === '' ||
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      filterTags.length === 0 ||
      filterTags.some((tag) => recipe.tags.includes(tag));
    const matchesFavourites = !showFavouritesOnly || recipe.isFavourite;
    return matchesSearch && matchesTags && matchesFavourites;
  });

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = recipeService.subscribeToRecipeChanges(
      user.id,
      (recipe) => addRecipe(recipe),
      (recipe) => updateStoreRecipe(recipe.id, recipe),
      (id) => removeRecipe(id)
    );
    return unsubscribe;
  }, [user, addRecipe, updateStoreRecipe, removeRecipe]);

  return {
    recipes,
    filteredRecipes,
    recommendations,
    isLoading,
    error,
    searchQuery,
    filterTags,
    showFavouritesOnly,
    setSearchQuery,
    setFilterTags,
    setShowFavouritesOnly,
    createRecipe,
    editRecipe,
    deleteRecipe,
    toggleFavourite,
    markAsMade,
    refreshRecommendations,
    refresh: loadRecipes,
  };
}
