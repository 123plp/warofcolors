import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackFriendAdded } from '@/hooks/useAchievementTriggers';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  // Populated from profiles
  friend_profile?: {
    user_id: string;
    username: string;
    display_name: string | null;
    role: string | null;
  };
  user_profile?: {
    user_id: string;
    username: string;
    display_name: string | null;
    role: string | null;
  };
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFriends([]);
        setPendingRequests([]);
        setIsLoading(false);
        return;
      }

      // Get all friendships where user is either user_id or friend_id
      const { data: friendships, error } = await (supabase as any)
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setPendingRequests([]);
        setIsLoading(false);
        return;
      }

      // Get all related user IDs
      const userIds = new Set<string>();
      friendships.forEach(f => {
        userIds.add(f.user_id);
        userIds.add(f.friend_id);
      });

      // Fetch profiles
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('user_id, username, display_name, role')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Enrich friendships with profile data
      const enrichedFriendships = friendships.map(f => ({
        ...f,
        friend_profile: profileMap.get(f.friend_id),
        user_profile: profileMap.get(f.user_id),
      })) as Friend[];

      // Split into accepted friends and pending requests
      const accepted = enrichedFriendships.filter(f => f.status === 'accepted');
      const pending = enrichedFriendships.filter(f => 
        f.status === 'pending' && f.friend_id === user.id
      );

      setFriends(accepted);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendFriendRequest = async (friendId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // Check if friendship already exists
      const { data: existing } = await (supabase as any)
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Friend request already exists' };
      }

      const { error } = await (supabase as any)
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      await fetchFriends();
      return { success: true };
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      return { success: false, error: error.message };
    }
  };

  const acceptFriendRequest = async (friendshipId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabase as any)
        .from('friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;

      await fetchFriends();
      
      // Track friend achievement - count after fetching updated list
      const updatedFriendCount = friends.length + 1;
      trackFriendAdded(updatedFriendCount);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: error.message };
    }
  };

  const declineFriendRequest = async (friendshipId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabase as any)
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      await fetchFriends();
      return { success: true };
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFriend = async (friendshipId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabase as any)
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      await fetchFriends();
      return { success: true };
    } catch (error: any) {
      console.error('Error removing friend:', error);
      return { success: false, error: error.message };
    }
  };

  const isFriend = useCallback((userId: string): boolean => {
    return friends.some(f => 
      f.user_id === userId || f.friend_id === userId
    );
  }, [friends]);

  const hasPendingRequest = useCallback((userId: string): boolean => {
    return pendingRequests.some(f => f.user_id === userId);
  }, [pendingRequests]);

  useEffect(() => {
    fetchFriends();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('friends-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends' },
        () => {
          fetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFriends]);

  return {
    friends,
    pendingRequests,
    isLoading,
    fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    isFriend,
    hasPendingRequest,
  };
};
