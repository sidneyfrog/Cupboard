import type { Unit } from '@/constants/categories';

/** A single ingredient entry within a recipe. */
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: Unit;
}

/** The source from which a recipe was added. */
export type RecipeSource = 'manual' | 'scanned' | 'imported';

/** A recipe stored in the user's collection. */
export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  source: RecipeSource;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  createdAt: string;
  isFavourite: boolean;
  userId: string;
}

/** Fields required when creating a new recipe (id and createdAt are generated). */
export type CreateRecipeInput = Omit<Recipe, 'id' | 'createdAt'>;

/** Fields that can be updated on an existing recipe. */
export type UpdateRecipeInput = Partial<Omit<Recipe, 'id' | 'userId' | 'createdAt'>>;

/** A recipe scored by the recommendation engine. */
export interface ScoredRecipe {
  recipe: Recipe;
  matchScore: number;
  matchedCount: number;
  totalIngredients: number;
  missingIngredients: string[];
  category: 'can_make_now' | 'almost_there' | 'missing_a_few';
}
