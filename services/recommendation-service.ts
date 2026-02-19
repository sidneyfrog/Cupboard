import type { PantryItem, Recipe, ScoredRecipe } from '@/types';
import { normalise } from '@/utils';

/**
 * Scores and ranks recipes based on how many of their required ingredients
 * exist in the current pantry. Returns recipes sorted by match score descending.
 *
 * Categories:
 * - "can_make_now": 100% ingredient match
 * - "almost_there": >= 70% ingredient match
 * - "missing_a_few": < 70% ingredient match
 */
export function getRecommendedRecipes(
  pantryItems: PantryItem[],
  recipes: Recipe[]
): ScoredRecipe[] {
  const pantryNames = new Set(pantryItems.map((item) => normalise(item.name)));

  const scored: ScoredRecipe[] = recipes.map((recipe) => {
    const totalIngredients = recipe.ingredients.length;
    if (totalIngredients === 0) {
      return {
        recipe,
        matchScore: 1,
        matchedCount: 0,
        totalIngredients: 0,
        missingIngredients: [],
        category: 'can_make_now' as const,
      };
    }

    const missingIngredients: string[] = [];
    let matchedCount = 0;

    for (const ingredient of recipe.ingredients) {
      const normalisedName = normalise(ingredient.name);
      const found = pantryNames.has(normalisedName) ||
        [...pantryNames].some(
          (pantryName) =>
            pantryName.includes(normalisedName) || normalisedName.includes(pantryName)
        );

      if (found) {
        matchedCount++;
      } else {
        missingIngredients.push(ingredient.name);
      }
    }

    const matchScore = matchedCount / totalIngredients;

    let category: ScoredRecipe['category'];
    if (matchScore === 1) {
      category = 'can_make_now';
    } else if (matchScore >= 0.7) {
      category = 'almost_there';
    } else {
      category = 'missing_a_few';
    }

    return {
      recipe,
      matchScore,
      matchedCount,
      totalIngredients,
      missingIngredients,
      category,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored;
}
