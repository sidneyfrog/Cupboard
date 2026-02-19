/** Result from Open Food Facts barcode lookup. */
export interface BarcodeLookupResult {
  found: boolean;
  productName?: string;
  category?: string;
  imageUrl?: string;
  barcode: string;
}

/** A single item detected from receipt OCR. */
export interface DetectedReceiptItem {
  name: string;
  selected: boolean;
}

/** A single item detected from object/ingredient recognition. */
export interface DetectedIngredient {
  name: string;
  confidence: number;
  selected: boolean;
}

/** A recipe parsed from scanned text or imported text/URL. */
export interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: string[];
  tags: string[];
}
