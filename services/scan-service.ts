import type { BarcodeLookupResult, DetectedReceiptItem, ParsedRecipe } from '@/types/scan';

const OPEN_FOOD_FACTS_BASE = 'https://world.openfoodfacts.org/api/v0/product';

/** Looks up a product by barcode using the Open Food Facts API. */
export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult> {
  const response = await fetch(`${OPEN_FOOD_FACTS_BASE}/${barcode}.json`);
  if (!response.ok) {
    return { found: false, barcode };
  }

  const json = await response.json();
  if (json.status !== 1 || !json.product) {
    return { found: false, barcode };
  }

  const product = json.product;
  return {
    found: true,
    productName: product.product_name ?? product.product_name_en ?? undefined,
    category: extractCategory(product.categories_tags),
    imageUrl: product.image_front_url ?? product.image_url ?? undefined,
    barcode,
  };
}

/**
 * Parses raw OCR text from a receipt into a list of detected item names.
 * Filters out prices, totals, store metadata, and common non-product lines.
 */
export function parseReceiptText(ocrText: string): DetectedReceiptItem[] {
  const lines = ocrText.split('\n').map((line) => line.trim()).filter(Boolean);

  const skipPatterns = [
    /^\$?\d+[.,]\d{2}$/,
    /^[\d.,]+$/,
    /total/i,
    /subtotal/i,
    /tax/i,
    /change/i,
    /cash/i,
    /credit/i,
    /debit/i,
    /visa/i,
    /mastercard/i,
    /receipt/i,
    /thank\s?you/i,
    /welcome/i,
    /store\s?#/i,
    /date/i,
    /time/i,
    /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/,
    /^\d{1,2}:\d{2}/,
    /tel|phone|fax/i,
    /www\.|http/i,
    /address/i,
    /qty|quantity/i,
    /price/i,
    /discount/i,
    /saving/i,
    /member/i,
    /loyalty/i,
    /points/i,
    /barcode/i,
  ];

  const items: DetectedReceiptItem[] = [];

  for (const line of lines) {
    if (line.length < 2 || line.length > 60) continue;

    const shouldSkip = skipPatterns.some((pattern) => pattern.test(line));
    if (shouldSkip) continue;

    const cleaned = line
      .replace(/\$?\d+[.,]\d{2}\s*$/, '')
      .replace(/^\d+\s*[xX]\s*/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (cleaned.length >= 2) {
      items.push({ name: cleaned, selected: true });
    }
  }

  return items;
}

/**
 * Parses raw text (from OCR or pasted input) into a structured recipe.
 * Attempts to identify title, ingredients, and steps from the text layout.
 */
export function parseRecipeText(text: string): ParsedRecipe {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ?? 'Untitled Recipe';
  const ingredients: ParsedRecipe['ingredients'] = [];
  const steps: string[] = [];
  let section: 'unknown' | 'ingredients' | 'steps' = 'unknown';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.includes('ingredient')) {
      section = 'ingredients';
      continue;
    }
    if (lower.includes('instruction') || lower.includes('direction') || lower.includes('method') || lower.includes('step')) {
      section = 'steps';
      continue;
    }

    if (section === 'ingredients' || (section === 'unknown' && isLikelyIngredient(line))) {
      const parsed = parseIngredientLine(line);
      if (parsed) {
        ingredients.push(parsed);
        if (section === 'unknown') section = 'ingredients';
      }
    } else if (section === 'steps') {
      const cleaned = line.replace(/^\d+[.)]\s*/, '');
      if (cleaned.length > 0) {
        steps.push(cleaned);
      }
    } else if (section === 'unknown' && line.length > 30) {
      section = 'steps';
      steps.push(line);
    }
  }

  return {
    title,
    description: '',
    ingredients,
    steps,
    tags: [],
  };
}

/** Parses a single ingredient line like "200g flour" or "2 cups milk". */
function parseIngredientLine(line: string): ParsedRecipe['ingredients'][number] | null {
  const cleaned = line.replace(/^[-•*]\s*/, '').trim();
  const match = cleaned.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|oz|lb|cup|cups|tbsp|tsp|units?|pieces?|slices?)\s+(.+)/i);
  if (match) {
    const quantity = parseFloat(match[1]);
    let unit = match[2].toLowerCase();
    if (unit === 'cups') unit = 'cup';
    if (unit === 'pieces') unit = 'units';
    if (unit === 'piece') unit = 'units';
    const name = match[3].trim();
    return { name, quantity, unit };
  }

  const simpleMatch = cleaned.match(/^(\d+\.?\d*)\s+(.+)/);
  if (simpleMatch) {
    return {
      name: simpleMatch[2].trim(),
      quantity: parseFloat(simpleMatch[1]),
      unit: 'units',
    };
  }

  if (cleaned.length > 0) {
    return { name: cleaned, quantity: 1, unit: 'units' };
  }

  return null;
}

/** Heuristic: a line that starts with a number or bullet is likely an ingredient. */
function isLikelyIngredient(line: string): boolean {
  return /^[\d•*-]/.test(line) && line.length < 60;
}

/** Extracts a user-friendly category from Open Food Facts category tags. */
function extractCategory(tags: string[] | undefined): string | undefined {
  if (!tags || tags.length === 0) return undefined;
  const tag = tags[0].replace(/^en:/, '').replace(/-/g, ' ');
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}
