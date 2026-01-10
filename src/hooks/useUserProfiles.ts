import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string;
  role: string | null;
  clearance: number;
  last_seen: string | null;
  is_online: boolean;
  total_messages: number;
  total_chat_messages: number;
  created_at: string;
  achievement_count?: number;
  friend_count?: number;
  is_vip?: boolean;
  user_role?: string;
}

export const useUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('last_seen', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles and VIP status
      const userIds = profilesData?.map(p => p.user_id) || [];
      
      let userRoles: Record<string, string> = {};
      let vipStatus: Record<string, boolean> = {};
      let achievementCounts: Record<string, number> = {};
      let friendCounts: Record<string, number> = {};

      if (userIds.length > 0) {
        // Get roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (roles) {
          roles.forEach(r => {
            userRoles[r.user_id] = r.role;
          });
        }

        // Get VIP status
        const { data: vips } = await supabase
          .from('vips')
          .select('user_id')
          .in('user_id', userIds);

        if (vips) {
          vips.forEach(v => {
            vipStatus[v.user_id] = true;
          });
        }

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
      }

      const enrichedProfiles: UserProfile[] = (profilesData || []).map(p => ({
        user_id: p.user_id,
        username: p.username,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio || '',
        role: p.role,
        clearance: p.clearance || 3,
        last_seen: p.last_seen,
        is_online: p.is_online || false,
        total_messages: p.total_messages || 0,
        total_chat_messages: p.total_chat_messages || 0,
        created_at: p.created_at,
        achievement_count: achievementCounts[p.user_id] || 0,
        friend_count: friendCounts[p.user_id] || 0,
        is_vip: vipStatus[p.user_id] || false,
        user_role: userRoles[p.user_id],
      }));

      setProfiles(enrichedProfiles);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
      setError('Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const getProfileByUserId = useCallback((userId: string) => {
    return profiles.find(p => p.user_id === userId);
  }, [profiles]);

  const searchProfiles = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return profiles.filter(p => 
      p.username.toLowerCase().includes(lowerQuery) ||
      (p.display_name?.toLowerCase() || '').includes(lowerQuery)
    );
  }, [profiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    getProfileByUserId,
    searchProfiles,
  };
};
