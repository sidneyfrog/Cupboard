/** Pantry item categories used throughout the app. */
export const PANTRY_CATEGORIES = [
  'Dairy',
  'Produce',
  'Meat & Seafood',
  'Bakery',
  'Grains & Pasta',
  'Canned Goods',
  'Frozen',
  'Snacks',
  'Beverages',
  'Condiments & Sauces',
  'Spices & Herbs',
  'Baking',
  'Oils & Vinegars',
  'Nuts & Seeds',
  'Other',
] as const;

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

/** Units of measurement for pantry items. */
export const UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'oz',
  'lb',
  'cup',
  'tbsp',
  'tsp',
  'units',
  'slices',
  'pieces',
  'cans',
  'bottles',
  'bags',
  'boxes',
  'bunches',
] as const;

export type Unit = (typeof UNITS)[number];

/** Dietary restriction options for user preferences. */
export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Halal',
  'Kosher',
] as const;

export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number];

/** Cuisine preference options. */
export const CUISINE_PREFERENCES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'French',
  'Mediterranean',
  'American',
  'Korean',
  'Middle Eastern',
  'Vietnamese',
  'Greek',
  'Spanish',
  'British',
] as const;

export type CuisinePreference = (typeof CUISINE_PREFERENCES)[number];

/** Common ingredients for quick-add autocomplete. */
export const COMMON_INGREDIENTS = [
  'Milk',
  'Eggs',
  'Butter',
  'Bread',
  'Rice',
  'Pasta',
  'Chicken',
  'Beef',
  'Onion',
  'Garlic',
  'Tomatoes',
  'Potatoes',
  'Carrots',
  'Salt',
  'Pepper',
  'Olive Oil',
  'Flour',
  'Sugar',
  'Cheese',
  'Yoghurt',
  'Cream',
  'Lemon',
  'Lime',
  'Soy Sauce',
  'Vinegar',
  'Honey',
  'Ginger',
  'Basil',
  'Oregano',
  'Cumin',
  'Paprika',
  'Chilli Flakes',
  'Cinnamon',
  'Coconut Milk',
  'Stock Cubes',
  'Baked Beans',
  'Tuna',
  'Chickpeas',
  'Lentils',
  'Mushrooms',
  'Spinach',
  'Broccoli',
  'Bell Pepper',
  'Celery',
  'Corn',
  'Peas',
  'Avocado',
  'Banana',
  'Apple',
  'Strawberries',
] as const;
