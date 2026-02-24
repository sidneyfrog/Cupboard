/**
 * Supabase Backend Configuration for Cupboard
 *
 * Backend choice: Supabase
 *
 * Rationale:
 * - Real-time sync: Supabase Realtime provides row-level subscriptions out of the
 *   box, so pantry changes sync instantly across devices.
 * - Authentication: Built-in email/password and OAuth (Google) support with
 *   minimal configuration. Works well with Expo via expo-secure-store.
 * - Storage: Supabase Storage offers simple bucket-based file storage for
 *   recipe photos, scanned images, and product images.
 * - Postgres: Full relational database with row-level security, making it easy
 *   to enforce per-user data isolation.
 * - Offline: Combined with @react-native-async-storage/async-storage and
 *   Zustand persist middleware, we get reliable offline-first behaviour.
 * - Developer experience: Open-source, generous free tier, excellent docs, and
 *   a typed JS client that integrates naturally with TypeScript.
 *
 * Compared to alternatives:
 * - Firebase: Proprietary, Firestore's document model is less natural for
 *   relational recipe-ingredient data, and pricing can scale unpredictably.
 * - AWS Amplify: Higher configuration complexity, heavier SDK, and steeper
 *   learning curve for an intermediate developer.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when real Supabase credentials are provided. False triggers local-only mode. */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  !SUPABASE_URL.includes('your-project') &&
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_ANON_KEY.includes('your-anon-key');

/** Configured Supabase client with AsyncStorage for session persistence. */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
