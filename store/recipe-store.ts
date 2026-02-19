import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe, ScoredRecipe } from '@/types';

interface RecipeState {
  recipes: Recipe[];
  recommendations: ScoredRecipe[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterTags: string[];
  showFavouritesOnly: boolean;
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  toggleFavourite: (id: string) => void;
  setRecommendations: (recommendations: ScoredRecipe[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
  setShowFavouritesOnly: (show: boolean) => void;
}

/** Recipe state store with offline persistence via AsyncStorage. */
export const useRecipeStore = create<RecipeState>()(
  persist(
    (set) => ({
      recipes: [],
      recommendations: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      filterTags: [],
      showFavouritesOnly: false,

      setRecipes: (recipes) => set({ recipes }),

      addRecipe: (recipe) =>
        set((state) => ({ recipes: [...state.recipes, recipe] })),

      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates } : recipe
          ),
        })),

      removeRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
        })),

      toggleFavourite: (id) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id
              ? { ...recipe, isFavourite: !recipe.isFavourite }
              : recipe
          ),
        })),

      setRecommendations: (recommendations) => set({ recommendations }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterTags: (filterTags) => set({ filterTags }),
      setShowFavouritesOnly: (showFavouritesOnly) => set({ showFavouritesOnly }),
    }),
    {
      name: 'cupboard-recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
