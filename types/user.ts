import type { CuisinePreference, DietaryRestriction } from '@/constants/categories';

/** User preference settings. */
export interface UserPreferences {
  dietaryRestrictions: DietaryRestriction[];
  cuisinePreferences: CuisinePreference[];
}

/** A Cupboard user profile. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
}

/** Fields required when creating a new user (id comes from auth). */
export type CreateUserInput = Omit<User, 'id'>;

/** Fields that can be updated on an existing user profile. */
export type UpdateUserInput = Partial<Omit<User, 'id' | 'email'>>;
