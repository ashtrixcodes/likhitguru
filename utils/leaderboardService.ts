import { supabase, isSupabaseConfigured, getDeviceId, getEffectiveUserId } from '@/utils/supabase';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  device_id: string;
  user_name: string;
  avatar_url?: string | null;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  last_quiz_date: string | null;
  updated_at: string;
}

export interface LeaderboardData {
  topPlayers: LeaderboardEntry[];
  userRank: number | null;
  isOnline: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Fetch Functions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the top N players from the global leaderboard, ordered by XP descending.
 * Returns an empty array if offline or Supabase is not configured.
 */
export async function fetchTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('daily_leaderboard')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[leaderboard] Failed to fetch top players:', error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.warn('[leaderboard] Network error fetching top players:', error);
    return [];
  }
}

/**
 * Fetches the current user's rank (1-indexed position) in the global leaderboard.
 * Returns null if offline, not configured, or user has no entry yet.
 */
export async function fetchPlayerRank(deviceId?: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const id = deviceId ?? await getEffectiveUserId();

    // First, get the user's XP
    const { data: userData, error: userError } = await supabase
      .from('daily_leaderboard')
      .select('total_xp')
      .eq('device_id', id)
      .single();

    if (userError || !userData) return null;

    // Count how many players have more XP than this user
    const { count, error: countError } = await supabase
      .from('daily_leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('total_xp', userData.total_xp);

    if (countError) {
      console.warn('[leaderboard] Failed to fetch rank:', countError.message);
      return null;
    }

    // Rank is (number of players with more XP) + 1
    return (count ?? 0) + 1;
  } catch (error) {
    console.warn('[leaderboard] Network error fetching rank:', error);
    return null;
  }
}

/**
 * Upserts the user's score to the cloud leaderboard.
 * This is fire-and-forget — it never blocks or crashes the app.
 */
export async function upsertPlayerScore(params: {
  userName: string;
  avatarUrl?: string | null;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  lastQuizDate: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const id = await getEffectiveUserId();

    const payload: any = {
      device_id: id,
      user_name: params.userName,
      total_xp: params.totalXP,
      current_streak: params.currentStreak,
      best_streak: params.bestStreak,
      last_quiz_date: params.lastQuizDate,
      updated_at: new Date().toISOString(),
    };

    if (params.avatarUrl) {
      payload.avatar_url = params.avatarUrl;
    }

    const { error } = await supabase
      .from('daily_leaderboard')
      .upsert(payload, { onConflict: 'device_id' });

    if (error) {
      console.warn('[leaderboard] Failed to upsert score:', error.message);
    }
  } catch (error) {
    console.warn('[leaderboard] Network error upserting score:', error);
  }
}

/**
 * Fetches both the top players and the current user's rank in a single call.
 * Gracefully returns offline fallback if anything fails.
 */
export async function fetchLeaderboardData(topCount: number = 3): Promise<LeaderboardData> {
  if (!isSupabaseConfigured()) {
    return { topPlayers: [], userRank: null, isOnline: false };
  }

  try {
    const [topPlayers, userRank] = await Promise.all([
      fetchTopPlayers(topCount),
      fetchPlayerRank(),
    ]);

    return {
      topPlayers,
      userRank,
      isOnline: topPlayers.length > 0,
    };
  } catch {
    return { topPlayers: [], userRank: null, isOnline: false };
  }
}
