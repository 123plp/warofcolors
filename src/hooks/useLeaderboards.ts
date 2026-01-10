import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_chat_messages: number;
  total_messages: number;
  achievement_count: number;
  friend_count: number;
  member_since: string;
  role: string | null;
  is_online: boolean;
}

export type LeaderboardType = 'chat' | 'achievements' | 'social' | 'veteran';

export const useLeaderboards = (type: LeaderboardType = 'chat', limit: number = 25) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Query profiles directly with the new columns
      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          username,
          display_name,
          avatar_url,
          total_chat_messages,
          total_messages,
          last_seen,
          is_online,
          created_at
        `)
        .limit(limit);

      // Order based on leaderboard type
      switch (type) {
        case 'chat':
          query = query.order('total_chat_messages', { ascending: false });
          break;
        case 'achievements':
          // We'll need to fetch achievements separately and sort client-side
          break;
        case 'social':
          // Sort by friend count - needs separate query
          break;
        case 'veteran':
          query = query.order('created_at', { ascending: true });
          break;
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Fetch achievement counts for all users
      const userIds = profiles?.map(p => p.user_id) || [];
      
      let achievementCounts: Record<string, number> = {};
      let friendCounts: Record<string, number> = {};
      let userRoles: Record<string, string> = {};

      if (userIds.length > 0) {
        // Get achievement counts
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('user_id')
          .in('user_id', userIds);

        if (achievements) {
          achievements.forEach(a => {
            achievementCounts[a.user_id] = (achievementCounts[a.user_id] || 0) + 1;
          });
        }

        // Get friend counts
        const { data: friends } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`user_id.in.(${userIds.join(',')}),friend_id.in.(${userIds.join(',')})`)
          .eq('status', 'accepted');

        if (friends) {
          friends.forEach(f => {
            if (userIds.includes(f.user_id)) {
              friendCounts[f.user_id] = (friendCounts[f.user_id] || 0) + 1;
            }
            if (userIds.includes(f.friend_id)) {
              friendCounts[f.friend_id] = (friendCounts[f.friend_id] || 0) + 1;
            }
          });
        }

        // Get user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (roles) {
          roles.forEach(r => {
            userRoles[r.user_id] = r.role;
          });
        }
      }

      // Combine data
      let leaderboardData: LeaderboardEntry[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        username: p.username,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        total_chat_messages: p.total_chat_messages || 0,
        total_messages: p.total_messages || 0,
        achievement_count: achievementCounts[p.user_id] || 0,
        friend_count: friendCounts[p.user_id] || 0,
        member_since: p.created_at,
        role: userRoles[p.user_id] || null,
        is_online: p.is_online || false,
      }));

      // Re-sort if needed
      if (type === 'achievements') {
        leaderboardData.sort((a, b) => b.achievement_count - a.achievement_count);
      } else if (type === 'social') {
        leaderboardData.sort((a, b) => b.friend_count - a.friend_count);
      }

      setEntries(leaderboardData.slice(0, limit));
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};
