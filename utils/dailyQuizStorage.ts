import AsyncStorage from '@react-native-async-storage/async-storage';
import { dailyquizQT } from '@/app/(tabs)/dailyquizQT';
import { knowledgeQuestions as nepaliKnowledgeQuestions } from '@/app/practiceMore/bikeKnowledge';
import { unicodeToAakriti } from '@/utils/unicodeToAakriti';

export const DAILY_QUIZ_STORAGE_KEY = '@lekhitguru/daily_quiz_progress';
export const USER_XP_STORAGE_KEY = '@user_xp';
export const USER_STREAK_STORAGE_KEY = '@user_streak';

export interface DailyQuizRecord {
  completedAt: number;
  score: number;
  totalQuestions: number;
  xpEarned: number;
}

export interface DailyQuizProgress {
  currentStreak: number;
  bestStreak: number;
  totalXP: number;
  lastCompletedDate: string | null; // Format: "YYYY-MM-DD"
  history: Record<string, DailyQuizRecord>;
}

export interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: string;
}

/**
 * Returns today's local calendar date in "YYYY-MM-DD" format.
 */
export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's local calendar date in "YYYY-MM-DD" format.
 */
export function getYesterdayDateString(date: Date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateString(yesterday);
}

const DEFAULT_PROGRESS: DailyQuizProgress = {
  currentStreak: 0,
  bestStreak: 0,
  totalXP: 0,
  lastCompletedDate: null,
  history: {},
};

/**
 * Reads the daily quiz progress from AsyncStorage, validates streak against today's date,
 * and resets currentStreak if user missed a day.
 */
export async function getDailyQuizProgress(): Promise<DailyQuizProgress> {
  try {
    const raw = await AsyncStorage.getItem(DAILY_QUIZ_STORAGE_KEY);
    let progress: DailyQuizProgress = raw ? JSON.parse(raw) : { ...DEFAULT_PROGRESS };

    // Also check legacy keys if progress is empty
    if (!raw) {
      const legacyXP = await AsyncStorage.getItem(USER_XP_STORAGE_KEY);
      const legacyStreak = await AsyncStorage.getItem(USER_STREAK_STORAGE_KEY);
      if (legacyXP) progress.totalXP = parseInt(legacyXP, 10) || 0;
      if (legacyStreak) {
        progress.currentStreak = parseInt(legacyStreak, 10) || 0;
        progress.bestStreak = progress.currentStreak;
      }
    }

    // Validate streak continuity against current date
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (progress.lastCompletedDate) {
      if (progress.lastCompletedDate === today || progress.lastCompletedDate === yesterday) {
        // Streak is intact!
      } else {
        // User missed at least 1 calendar day -> streak resets to 0
        progress.currentStreak = 0;
        await saveDailyQuizProgress(progress);
      }
    }

    return progress;
  } catch (error) {
    console.warn('[dailyQuizStorage] Failed to read progress:', error);
    return { ...DEFAULT_PROGRESS };
  }
}

/**
 * Saves daily quiz progress to AsyncStorage and syncs legacy keys.
 */
export async function saveDailyQuizProgress(progress: DailyQuizProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_QUIZ_STORAGE_KEY, JSON.stringify(progress));
    await AsyncStorage.setItem(USER_XP_STORAGE_KEY, String(progress.totalXP));
    await AsyncStorage.setItem(USER_STREAK_STORAGE_KEY, String(progress.currentStreak));
  } catch (error) {
    console.warn('[dailyQuizStorage] Failed to save progress:', error);
  }
}

/**
 * Records a quiz completion for today.
 * Calculates XP earned, increments streak if this is the first completion today,
 * updates bestStreak, and persists the record.
 */
export async function recordQuizCompletion(
  score: number,
  totalQuestions: number = 5
): Promise<{
  progress: DailyQuizProgress;
  isFirstCompletionToday: boolean;
  xpEarned: number;
  streakIncremented: boolean;
}> {
  const progress = await getDailyQuizProgress();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const isFirstCompletionToday = progress.lastCompletedDate !== today;

  // Base XP: 10 XP per correct answer + 20 bonus XP for 100% score
  const baseXP = score * 10;
  const perfectBonus = score === totalQuestions && totalQuestions > 0 ? 20 : 0;
  const xpEarned = baseXP + perfectBonus;

  let streakIncremented = false;

  if (isFirstCompletionToday) {
    if (progress.lastCompletedDate === yesterday) {
      progress.currentStreak += 1;
    } else {
      progress.currentStreak = 1;
    }
    streakIncremented = true;
    progress.lastCompletedDate = today;
  }

  if (progress.currentStreak > progress.bestStreak) {
    progress.bestStreak = progress.currentStreak;
  }

  progress.totalXP += xpEarned;

  // Store in history
  progress.history[today] = {
    completedAt: Date.now(),
    score,
    totalQuestions,
    xpEarned,
  };

  await saveDailyQuizProgress(progress);

  return {
    progress,
    isFirstCompletionToday,
    xpEarned,
    streakIncremented,
  };
}

/**
 * Simple deterministic pseudo-random number generator using Mulberry32.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a deterministic integer hash from a date string (e.g. "2026-08-15" -> 20260815).
 */
function getDateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a deterministic, non-repeating set of 5 questions for today.
 * All users across the world get the exact same question set for the same calendar date.
 */
export function getDailyQuestionsForDate(
  dateStr: string = getTodayDateString(),
  isNepali: boolean = true,
  count: number = 5
): Question[] {
  const totalCount = Math.min(dailyquizQT.length, nepaliKnowledgeQuestions.length);
  if (totalCount === 0) return [];

  const seed = getDateHash(dateStr);
  const rng = mulberry32(seed);

  // Generate deterministic indices
  const indices: number[] = Array.from({ length: totalCount }, (_, i) => i);
  // Fisher-Yates with seeded RNG
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const selectedIndices = indices.slice(0, Math.min(count, totalCount));

  return selectedIndices.map((idx) => {
    const englishQ = dailyquizQT[idx];
    const nepaliQ = nepaliKnowledgeQuestions[idx];

    if (isNepali && nepaliQ && Array.isArray(nepaliQ.options) && nepaliQ.options.length === 4) {
      const cleanNepaliOptions = nepaliQ.options.map((opt) =>
        opt.replace(/^(\([a-dक-घ]\)|[a-dक-घ]\.|\([a-d]\))\s*/i, '')
      ) as [string, string, string, string];

      const correctIdx = englishQ ? englishQ.options.indexOf(englishQ.correctAnswer) : 0;
      const validCorrectIdx = correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0;
      const correctAnswer = cleanNepaliOptions[validCorrectIdx];

      // Shuffle options deterministically
      const shuffledOptions = [...cleanNepaliOptions];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      return {
        question: nepaliQ.question,
        options: shuffledOptions as [string, string, string, string],
        correctAnswer,
      };
    }

    const shuffledOptions = [...(englishQ?.options || ['Option A', 'Option B', 'Option C', 'Option D'])];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return {
      question: englishQ?.question || 'Question missing',
      options: shuffledOptions as [string, string, string, string],
      correctAnswer: englishQ?.correctAnswer || 'Option A',
    };
  });
}
