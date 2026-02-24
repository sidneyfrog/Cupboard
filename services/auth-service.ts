import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import { generateId } from '@/utils';
import type { User, CreateUserInput, UpdateUserInput } from '@/types';

// ---------------------------------------------------------------------------
// AsyncStorage keys for local-only auth
// ---------------------------------------------------------------------------
const LOCAL_USERS_KEY = 'cupboard-local-users';
const LOCAL_SESSION_KEY = 'cupboard-local-session';

interface LocalUserRecord {
  id: string;
  email: string;
  password: string;
  displayName: string;
  preferences: User['preferences'];
}

async function getLocalUsers(): Promise<LocalUserRecord[]> {
  const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveLocalUsers(users: LocalUserRecord[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// ---------------------------------------------------------------------------
// Auth service – delegates to Supabase when configured, otherwise local-only
// ---------------------------------------------------------------------------

/** Signs in a user with email and password. Returns the user profile. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!isSupabaseConfigured) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await getLocalUsers();
    const record = users.find((u) => u.email === normalizedEmail);
    if (!record || record.password !== password) {
      throw new Error('Invalid email or password.');
    }
    await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ userId: record.id }));
    return toUser(record);
  }

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
  if (!isSupabaseConfigured) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await getLocalUsers();
    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const record: LocalUserRecord = {
      id: generateId(),
      email: normalizedEmail,
      password,
      displayName,
      preferences: { dietaryRestrictions: [], cuisinePreferences: [] },
    };
    users.push(record);
    await saveLocalUsers(users);
    await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ userId: record.id }));
    return toUser(record);
  }

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
  if (!isSupabaseConfigured) {
    throw new Error('Google sign-in requires a Supabase backend. Please use email sign-up.');
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'cupboard://auth/callback' },
  });
  if (error) throw new Error(error.message);
}

/** Signs out the current user. */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) {
    await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Fetches the user profile from the users table. */
export async function getUserProfile(userId: string): Promise<User> {
  if (!isSupabaseConfigured) {
    const users = await getLocalUsers();
    const record = users.find((u) => u.id === userId);
    if (!record) throw new Error('User not found.');
    return toUser(record);
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return mapRowToUser(data);
}

/** Creates a new user profile in the users table. */
export async function createUserProfile(input: CreateUserInput): Promise<User> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('No authenticated user found.');

  const row = {
    id: authData.user.id,
    email: input.email,
    display_name: input.displayName,
    preferences: input.preferences,
  };

  const { data, error } = await supabase
    .from('users')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToUser(data);
}

/** Updates the current user's profile. */
export async function updateUserProfile(userId: string, updates: UpdateUserInput): Promise<User> {
  if (!isSupabaseConfigured) {
    const users = await getLocalUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    if (updates.displayName !== undefined) users[idx].displayName = updates.displayName;
    if (updates.preferences !== undefined) users[idx].preferences = updates.preferences;
    await saveLocalUsers(users);
    return toUser(users[idx]);
  }

  const row: Record<string, unknown> = {};
  if (updates.displayName !== undefined) row.display_name = updates.displayName;
  if (updates.preferences !== undefined) row.preferences = updates.preferences;

  const { data, error } = await supabase
    .from('users')
    .update(row)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToUser(data);
}

/** Listens for auth state changes and calls the provided callback. Returns an unsubscribe function. */
export function onAuthStateChange(
  callback: (event: string, userId: string | null) => void
): () => void {
  if (!isSupabaseConfigured) {
    // Check for an existing local session on startup
    let cancelled = false;
    AsyncStorage.getItem(LOCAL_SESSION_KEY).then((raw) => {
      if (cancelled) return;
      if (raw) {
        const { userId } = JSON.parse(raw);
        callback('SIGNED_IN', userId);
      } else {
        callback('SIGNED_OUT', null);
      }
    });
    return () => { cancelled = true; };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user?.id ?? null);
  });
  return () => subscription.unsubscribe();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a snake_case database row to a camelCase User object. */
function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    displayName: row.display_name as string,
    preferences: row.preferences as User['preferences'],
  };
}

/** Converts a LocalUserRecord to a User (strips the password). */
function toUser(record: LocalUserRecord): User {
  return {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    preferences: record.preferences,
  };
}
