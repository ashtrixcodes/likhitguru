import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase, GOOGLE_CLIENT_IDS, isSupabaseConfigured } from '@/utils/supabase';

// Safely resolve native module
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.warn('[AuthContext] RNGoogleSignin native binary not linked yet. Rebuild with `npx expo run:ios`.');
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isSyncing: boolean;
  userName: string;
  userAvatar: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isSyncing: false,
  userName: 'Prashant',
  userAvatar: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userName, setUserName] = useState<string>('Prashant');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Configure Google Sign-In SDK
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_IDS.webClientId,
        iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
      });
    } catch (e) {
      console.warn('GoogleSignin configure error:', e);
    }

    // Load initial Supabase session
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await syncUserData(session.user);
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });

      // Listen for Auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await syncUserData(session.user);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const syncUserData = async (u: User) => {
    try {
      setIsSyncing(true);
      const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Rider';
      const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;
      
      setUserName(name);
      setUserAvatar(avatar);

      await AsyncStorage.setItem('user_name', name).catch(() => {});
      if (avatar) {
        await AsyncStorage.setItem('user_avatar', avatar).catch(() => {});
      }
    } finally {
      // Small graceful buffer to allow network image caches to warm up
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsSyncing(true);
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        return;
      }

      if (!GoogleSignin) {
        Alert.alert(
          'Rebuild Required',
          'Google Sign-In native library requires a native rebuild. Please run `npx expo run:ios` or `npx expo run:android`.'
        );
        setIsSyncing(false);
        return;
      }

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      const idToken = response.data?.idToken || (response as any).idToken;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        await syncUserData(data.user);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setIsSyncing(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsSyncing(true);
      await GoogleSignin.signOut().catch(() => {});
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setUserAvatar(null);
      setUserName('Prashant');
      await AsyncStorage.removeItem('user_avatar').catch(() => {});
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isSyncing,
        userName,
        userAvatar,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
