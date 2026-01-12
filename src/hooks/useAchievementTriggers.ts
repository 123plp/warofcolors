/**
 * Achievement Triggers Hook
 * Centralized logic for triggering achievements throughout the app
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Storage keys for tracking progress
const STORAGE_KEYS = {
  OPENED_APPS: 'achievement_opened_apps',
  CHAT_COUNT: 'achievement_chat_count',
  TERMINAL_COMMANDS: 'achievement_terminal_commands',
  LOGIN_DATES: 'achievement_login_dates',
  SESSION_START: 'achievement_session_start',
  THEME_CHANGED: 'achievement_theme_changed',
};

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Helper to grant achievement
async function grantAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_achievements')
      .insert({ user_id: userId, achievement_id: achievementId });
    
    if (error) {
      // 23505 = unique violation (already has achievement)
      if (error.code === '23505') return false;
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Failed to grant achievement:', err);
    return false;
  }
}

// Check and grant time-based achievements
export async function checkTimeAchievements(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const hour = new Date().getHours();
  
  // Night Owl: 12 AM - 4 AM (0-4)
  if (hour >= 0 && hour < 4) {
    await grantAchievement(userId, 'night_owl');
  }
  
  // Early Bird: 5 AM - 7 AM
  if (hour >= 5 && hour < 7) {
    await grantAchievement(userId, 'early_bird');
  }
}

// Track app opens and grant explorer achievements
export async function trackAppOpen(appId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const stored = localStorage.getItem(STORAGE_KEYS.OPENED_APPS);
  const openedApps: string[] = stored ? JSON.parse(stored) : [];
  
  if (!openedApps.includes(appId)) {
    openedApps.push(appId);
    localStorage.setItem(STORAGE_KEYS.OPENED_APPS, JSON.stringify(openedApps));
    
    // Check thresholds
    if (openedApps.length >= 5) {
      await grantAchievement(userId, 'app_opener_5');
    }
    if (openedApps.length >= 15) {
      await grantAchievement(userId, 'app_opener_15');
    }
    // Note: app_opener_all requires knowing total apps - will check in Desktop component
  }
}

// Track chat messages
export async function trackChatMessage(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const count = parseInt(localStorage.getItem(STORAGE_KEYS.CHAT_COUNT) || '0') + 1;
  localStorage.setItem(STORAGE_KEYS.CHAT_COUNT, count.toString());

  // Check thresholds
  if (count === 1) await grantAchievement(userId, 'first_chat');
  if (count === 10) await grantAchievement(userId, 'chat_10');
  if (count === 50) await grantAchievement(userId, 'chat_50');
  if (count === 100) await grantAchievement(userId, 'chat_100');
  if (count === 500) await grantAchievement(userId, 'chat_500');
}

// Track terminal commands
export async function trackTerminalCommand(command: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const stored = localStorage.getItem(STORAGE_KEYS.TERMINAL_COMMANDS);
  const commands: string[] = stored ? JSON.parse(stored) : [];
  
  if (!commands.includes(command)) {
    commands.push(command);
    localStorage.setItem(STORAGE_KEYS.TERMINAL_COMMANDS, JSON.stringify(commands));
    
    if (commands.length >= 20) {
      await grantAchievement(userId, 'terminal_hacker');
    }
  }
}

// Track friend count
export async function trackFriendAdded(friendCount: number): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  if (friendCount >= 1) await grantAchievement(userId, 'friend_1');
  if (friendCount >= 5) await grantAchievement(userId, 'friend_5');
  if (friendCount >= 20) await grantAchievement(userId, 'friend_20');
}

// Track login streaks
export async function trackLogin(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Grant first login
  await grantAchievement(userId, 'first_login');

  // Track daily streak
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE_KEYS.LOGIN_DATES);
  const dates: string[] = stored ? JSON.parse(stored) : [];
  
  if (!dates.includes(today)) {
    dates.push(today);
    // Keep only last 30 dates
    if (dates.length > 30) dates.shift();
    localStorage.setItem(STORAGE_KEYS.LOGIN_DATES, JSON.stringify(dates));
  }

  // Calculate consecutive days
  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 1;
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = sortedDates[i].getTime() - sortedDates[i + 1].getTime();
    if (diff <= oneDay * 1.5) { // Allow some flexibility
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3) await grantAchievement(userId, 'daily_streak_3');
  if (streak >= 7) await grantAchievement(userId, 'daily_streak_7');
  if (streak >= 30) await grantAchievement(userId, 'daily_streak_30');
}

// Track window count for multitasking achievements
export async function trackWindowCount(count: number): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  if (count >= 5) await grantAchievement(userId, 'window_multitask_5');
  if (count >= 10) await grantAchievement(userId, 'window_multitask_10');
}

// Track theme change
export async function trackThemeChange(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await grantAchievement(userId, 'theme_changer');
}

// Track crash recovery
export async function trackCrashRecovery(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await grantAchievement(userId, 'crash_survivor');
}

// Start session tracking
export function startSessionTracking(): void {
  localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
}

// Check session duration achievements
export async function checkSessionAchievements(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const startTime = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_START) || '0');
  if (!startTime) return;

  const elapsed = Date.now() - startTime;
  const oneHour = 60 * 60 * 1000;
  const threeHours = 3 * oneHour;

  if (elapsed >= oneHour) {
    await grantAchievement(userId, 'session_1hr');
  }
  if (elapsed >= threeHours) {
    await grantAchievement(userId, 'session_3hr');
  }
}

// Hook for components to use
export function useAchievementTriggers() {
  const triggerAppOpen = useCallback(async (appId: string) => {
    await trackAppOpen(appId);
    await checkTimeAchievements();
  }, []);

  const triggerChatMessage = useCallback(async () => {
    await trackChatMessage();
  }, []);

  const triggerTerminalCommand = useCallback(async (command: string) => {
    await trackTerminalCommand(command);
  }, []);

  const triggerFriendAdded = useCallback(async (count: number) => {
    await trackFriendAdded(count);
  }, []);

  const triggerLogin = useCallback(async () => {
    await trackLogin();
    startSessionTracking();
  }, []);

  const triggerWindowCount = useCallback(async (count: number) => {
    await trackWindowCount(count);
  }, []);

  const triggerThemeChange = useCallback(async () => {
    await trackThemeChange();
  }, []);

  const triggerCrashRecovery = useCallback(async () => {
    await trackCrashRecovery();
  }, []);

  const checkSession = useCallback(async () => {
    await checkSessionAchievements();
  }, []);

  return {
    triggerAppOpen,
    triggerChatMessage,
    triggerTerminalCommand,
    triggerFriendAdded,
    triggerLogin,
    triggerWindowCount,
    triggerThemeChange,
    triggerCrashRecovery,
    checkSession,
  };
}
