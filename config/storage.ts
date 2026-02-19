/**
 * Supabase Storage bucket names used throughout the app.
 * Buckets must be created in the Supabase dashboard or via migrations.
 */
export const STORAGE_BUCKETS = {
  /** Bucket for recipe photos uploaded by the user. */
  RECIPE_IMAGES: 'recipe-images',
  /** Bucket for pantry item images (from barcode lookup or camera). */
  PANTRY_IMAGES: 'pantry-images',
  /** Bucket for scanned documents (receipts, recipe pages). */
  SCANNED_DOCUMENTS: 'scanned-documents',
} as const;
