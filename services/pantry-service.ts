import { supabase } from '@/config/supabase';
import type { PantryItem, CreatePantryItemInput, UpdatePantryItemInput } from '@/types';
import { generateId, nowISO } from '@/utils';

/** Fetches all pantry items for the given user. */
export async function fetchPantryItems(userId: string): Promise<PantryItem[]> {
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRowToPantryItem);
}

/** Creates a new pantry item in the database. */
export async function createPantryItem(input: CreatePantryItemInput): Promise<PantryItem> {
  const id = generateId();
  const dateAdded = nowISO();

  const row = mapPantryItemToRow({ ...input, id, dateAdded });
  const { data, error } = await supabase
    .from('pantry_items')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToPantryItem(data);
}

/** Updates an existing pantry item. */
export async function updatePantryItem(
  id: string,
  updates: UpdatePantryItemInput
): Promise<PantryItem> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.quantity !== undefined) row.quantity = updates.quantity;
  if (updates.unit !== undefined) row.unit = updates.unit;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.barcode !== undefined) row.barcode = updates.barcode;
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.expiryDate !== undefined) row.expiry_date = updates.expiryDate;

  const { data, error } = await supabase
    .from('pantry_items')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToPantryItem(data);
}

/** Deletes a pantry item by id. */
export async function deletePantryItem(id: string): Promise<void> {
  const { error } = await supabase.from('pantry_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Deletes multiple pantry items by id. */
export async function deletePantryItems(ids: string[]): Promise<void> {
  const { error } = await supabase.from('pantry_items').delete().in('id', ids);
  if (error) throw new Error(error.message);
}

/** Subscribes to real-time changes on the pantry_items table for a user. */
export function subscribeToPantryChanges(
  userId: string,
  onInsert: (item: PantryItem) => void,
  onUpdate: (item: PantryItem) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel('pantry-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'pantry_items', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(mapRowToPantryItem(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pantry_items', filter: `user_id=eq.${userId}` },
      (payload) => onUpdate(mapRowToPantryItem(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'pantry_items', filter: `user_id=eq.${userId}` },
      (payload) => onDelete(String(payload.old.id))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Maps a database row (snake_case) to a PantryItem (camelCase). */
function mapRowToPantryItem(row: Record<string, unknown>): PantryItem {
  return {
    id: String(row.id),
    name: String(row.name),
    quantity: Number(row.quantity),
    unit: String(row.unit) as PantryItem['unit'],
    category: String(row.category) as PantryItem['category'],
    barcode: row.barcode ? String(row.barcode) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    dateAdded: String(row.date_added),
    expiryDate: row.expiry_date ? String(row.expiry_date) : undefined,
    userId: String(row.user_id),
  };
}

/** Maps a PantryItem (camelCase) to a database row (snake_case). */
function mapPantryItemToRow(item: PantryItem): Record<string, unknown> {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    barcode: item.barcode ?? null,
    image_url: item.imageUrl ?? null,
    date_added: item.dateAdded,
    expiry_date: item.expiryDate ?? null,
    user_id: item.userId,
  };
}
