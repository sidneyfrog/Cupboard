import type { PantryCategory, Unit } from '@/constants/categories';

/** A single item stored in the user's pantry. */
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: PantryCategory;
  barcode?: string;
  imageUrl?: string;
  dateAdded: string;
  expiryDate?: string;
  userId: string;
}

/** Fields required when creating a new pantry item (id and dateAdded are generated). */
export type CreatePantryItemInput = Omit<PantryItem, 'id' | 'dateAdded'>;

/** Fields that can be updated on an existing pantry item. */
export type UpdatePantryItemInput = Partial<Omit<PantryItem, 'id' | 'userId' | 'dateAdded'>>;
