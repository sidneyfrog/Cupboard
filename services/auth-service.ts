import { supabase } from '@/config/supabase';
import type { User, CreateUserInput, UpdateUserInput } from '@/types';

/** Signs in a user with email and password. Returns the user profile. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await getUserProfile(data.user.id);
  return profile;
}

/** Creates a new account with email, password, and display name. Returns the user profile. */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Sign up succeeded but no user was returned.');

  const profile = await createUserProfile({
    email,
    displayName,
    preferences: { dietaryRestrictions: [], cuisinePreferences: [] },
  });
  return profile;
}

/** Signs in using Google OAuth. Requires Supabase Google provider configuration. */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'cupboard://auth/callback' },
  });
  if (error) throw new Error(error.message);
}

/** Signs out the current user. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Fetches the user profile from the users table. */
export async function getUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data as User;
}

/** Creates a new user profile in the users table. */
export async function createUserProfile(input: CreateUserInput): Promise<User> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('No authenticated user found.');

  const profile = {
    id: authData.user.id,
    ...input,
  };

  const { data, error } = await supabase
    .from('users')
    .insert(profile)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as User;
}

/** Updates the current user's profile. */
export async function updateUserProfile(userId: string, updates: UpdateUserInput): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as User;
}

/** Listens for auth state changes and calls the provided callback. Returns an unsubscribe function. */
export function onAuthStateChange(
  callback: (event: string, userId: string | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user?.id ?? null);
  });
  return () => subscription.unsubscribe();
}
