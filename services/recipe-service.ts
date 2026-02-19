import { supabase } from '@/config/supabase';
import type { Recipe, CreateRecipeInput, UpdateRecipeInput } from '@/types';
import { generateId, nowISO } from '@/utils';

/** Fetches all recipes for the given user. */
export async function fetchRecipes(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRowToRecipe);
}

/** Creates a new recipe in the database. */
export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const id = generateId();
  const createdAt = nowISO();

  const row = mapRecipeToRow({ ...input, id, createdAt });
  const { data, error } = await supabase
    .from('recipes')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToRecipe(data);
}

/** Updates an existing recipe. */
export async function updateRecipe(id: string, updates: UpdateRecipeInput): Promise<Recipe> {
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.source !== undefined) row.source = updates.source;
  if (updates.ingredients !== undefined) row.ingredients = updates.ingredients;
  if (updates.steps !== undefined) row.steps = updates.steps;
  if (updates.tags !== undefined) row.tags = updates.tags;
  if (updates.isFavourite !== undefined) row.is_favourite = updates.isFavourite;

  const { data, error } = await supabase
    .from('recipes')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToRecipe(data);
}

/** Deletes a recipe by id. */
export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Toggles the favourite status of a recipe. */
export async function toggleRecipeFavourite(id: string, isFavourite: boolean): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .update({ is_favourite: isFavourite })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/** Subscribes to real-time changes on the recipes table for a user. */
export function subscribeToRecipeChanges(
  userId: string,
  onInsert: (recipe: Recipe) => void,
  onUpdate: (recipe: Recipe) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel('recipe-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'recipes', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(mapRowToRecipe(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'recipes', filter: `user_id=eq.${userId}` },
      (payload) => onUpdate(mapRowToRecipe(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'recipes', filter: `user_id=eq.${userId}` },
      (payload) => onDelete(String(payload.old.id))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Maps a database row (snake_case) to a Recipe (camelCase). */
function mapRowToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ''),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    source: String(row.source) as Recipe['source'],
    ingredients: (row.ingredients as Recipe['ingredients']) ?? [],
    steps: (row.steps as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    createdAt: String(row.created_at),
    isFavourite: Boolean(row.is_favourite),
    userId: String(row.user_id),
  };
}

/** Maps a Recipe (camelCase) to a database row (snake_case). */
function mapRecipeToRow(recipe: Recipe): Record<string, unknown> {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image_url: recipe.imageUrl ?? null,
    source: recipe.source,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    tags: recipe.tags,
    created_at: recipe.createdAt,
    is_favourite: recipe.isFavourite,
    user_id: recipe.userId,
  };
}
