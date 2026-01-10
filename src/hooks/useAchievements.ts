import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS, Achievement, getAchievementById, calculateTotalPoints } from '@/lib/achievements';
import { toast } from 'sonner';

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export const useAchievements = (userId?: string) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  // Fetch unlocked achievements
  const fetchAchievements = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setUnlockedAchievements(data || []);
      setTotalPoints(calculateTotalPoints((data || []).map(a => a.achievement_id)));
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Subscribe to real-time achievement updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('user-achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newAchievement = payload.new as UserAchievement;
          const achievement = getAchievementById(newAchievement.achievement_id);
          
          if (achievement && !achievement.hidden) {
            toast.success(`🏆 Achievement Unlocked!`, {
              description: `${achievement.icon} ${achievement.name} - ${achievement.description}`,
              duration: 5000,
            });
          }
          
          setUnlockedAchievements(prev => [...prev, newAchievement]);
          setTotalPoints(prev => prev + (achievement?.points || 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Grant an achievement
  const grantAchievement = useCallback(async (achievementId: string) => {
    if (!userId) return false;

    // Check if already unlocked
    const alreadyUnlocked = unlockedAchievements.some(a => a.achievement_id === achievementId);
    if (alreadyUnlocked) return false;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
        });

      if (error) {
        // Ignore duplicate key errors (already has achievement)
        if (error.code === '23505') return false;
        throw error;
      }

      return true;
    } catch (err) {
      console.error('Failed to grant achievement:', err);
      return false;
    }
  }, [userId, unlockedAchievements]);

  // Check if a specific achievement is unlocked
  const hasAchievement = useCallback((achievementId: string) => {
    return unlockedAchievements.some(a => a.achievement_id === achievementId);
  }, [unlockedAchievements]);

  // Get all achievements with unlock status
  const getAllWithStatus = useCallback(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: hasAchievement(achievement.id),
      unlockedAt: unlockedAchievements.find(a => a.achievement_id === achievement.id)?.unlocked_at,
    }));
  }, [hasAchievement, unlockedAchievements]);

  // Get unlocked achievements as full Achievement objects
  const getUnlockedAchievements = useCallback(() => {
    return unlockedAchievements
      .map(ua => {
        const achievement = getAchievementById(ua.achievement_id);
        return achievement ? { ...achievement, unlockedAt: ua.unlocked_at } : null;
      })
      .filter(Boolean) as (Achievement & { unlockedAt: string })[];
  }, [unlockedAchievements]);

  // Get progress stats
  const getProgress = useCallback(() => {
    const total = ACHIEVEMENTS.filter(a => !a.hidden).length;
    const unlocked = unlockedAchievements.filter(ua => {
      const achievement = getAchievementById(ua.achievement_id);
      return achievement && !achievement.hidden;
    }).length;
    
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  }, [unlockedAchievements]);

  return {
    unlockedAchievements,
    loading,
    totalPoints,
    grantAchievement,
    hasAchievement,
    getAllWithStatus,
    getUnlockedAchievements,
    getProgress,
    refetch: fetchAchievements,
  };
};
