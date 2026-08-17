import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ──────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURATION — Replace these with your Supabase project credentials
// ──────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://wfxlslwuxfefsrgusghf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmeGxzbHd1eGZlZnNyZ3VzZ2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTIxODAsImV4cCI6MjEwMjM4ODE4MH0.5BPXBbKmqoGrL4z7vtw0TcAdIum3JdOPdnU2H4XtB_g';

// ──────────────────────────────────────────────────────────────────────────────
// Supabase Client Singleton with Persistent Storage
// ──────────────────────────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Check if Supabase is properly configured (credentials are not placeholders).
 */
export function isSupabaseConfigured(): boolean {
  const url: string = SUPABASE_URL;
  const key: string = SUPABASE_ANON_KEY;
  return (
    url !== 'YOUR_SUPABASE_URL' &&
    key !== 'YOUR_SUPABASE_ANON_KEY' &&
    url.startsWith('https://')
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 🔑 Google OAuth Credentials
// ──────────────────────────────────────────────────────────────────────────────
export const GOOGLE_CLIENT_IDS = {
  webClientId: '228087335920-ohbk3oamk0f632fjcs8fvlhdjnkiciso.apps.googleusercontent.com',
  iosClientId: '228087335920-viju88str8a93retgkepngefr39r7jus.apps.googleusercontent.com',
  androidClientId: '228087335920-rs29rtemeruk03vtksm0raijbcbcohbv.apps.googleusercontent.com',
};

// ──────────────────────────────────────────────────────────────────────────────
// Anonymous Device Identity
// ──────────────────────────────────────────────────────────────────────────────
const DEVICE_ID_KEY = 'lekhitguru.device_id';

/**
 * Generates a UUID v4 string.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a persistent anonymous device ID.
 * Uses SecureStore on native platforms (survives app reinstall on iOS),
 * falls back to AsyncStorage on web.
 */
export async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (stored) return stored;
      const id = generateUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
      return id;
    }

    const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (stored) return stored;

    const id = generateUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
    return id;
  } catch (error) {
    // Fallback: generate ephemeral ID if storage fails
    console.warn('[supabase] Failed to get/set device ID:', error);
    const fallback = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (fallback) return fallback;
    const id = generateUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id).catch(() => {});
    return id;
  }
}

/**
 * Gets active unique user/device ID.
 * If user is authenticated in Supabase, returns user.id.
 * Otherwise, returns the local anonymous deviceId.
 */
export async function getEffectiveUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.id) {
      return data.session.user.id;
    }
  } catch (e) {
    // fallback
  }
  return getDeviceId();
}
