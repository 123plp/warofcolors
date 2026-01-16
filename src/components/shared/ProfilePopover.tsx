import { useState, useEffect } from "react";
import { Crown, Shield, Star, UserPlus, MessageSquare, Loader2, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFriends } from "@/hooks/useFriends";
import { useOnlineAccount } from "@/hooks/useOnlineAccount";

interface ProfilePopoverProps {
  userId?: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
  isVip?: boolean;
  onSendMessage?: (userId: string, username: string) => void;
}

interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  clearance: number | null;
  created_at: string;
  lifetime_kroner: number;
  spendable_kroner: number;
  total_chat_messages: number | null;
}

interface UserStats {
  achievementCount: number;
  friendCount: number;
}

export const ProfilePopover = ({
  userId,
  username,
  displayName,
  avatarUrl,
  role,
  isVip,
  onSendMessage
}: ProfilePopoverProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ achievementCount: 0, friendCount: 0 });
  const [loading, setLoading] = useState(true);
  const { sendFriendRequest, isFriend } = useFriends();
  const { user } = useOnlineAccount();
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  const isCreator = username.toLowerCase() === 'aswd';
  const isAdmin = role === 'admin';
  const isCurrentUser = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchStats();
    }
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data as unknown as UserProfile);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!userId) return;
    try {
      const { count: achievementCount } = await supabase
        .from("user_achievements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      
      const { count: friendCount } = await supabase
        .from("friends")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      
      setStats({
        achievementCount: achievementCount || 0,
        friendCount: friendCount || 0
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleAddFriend = async () => {
    if (!userId) return;
    const result = await sendFriendRequest(userId);
    if (result.success) {
      toast.success("Friend request sent!");
      setFriendRequestSent(true);
    } else {
      toast.error(result.error || "Failed to send friend request");
    }
  };

  const handleSendMessage = () => {
    if (userId && onSendMessage) {
      onSendMessage(userId, username);
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    if (isCreator) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30">
          <Crown className="w-3 h-3 mr-1" />
          Creator
        </Badge>
      );
    }
    if (isAdmin) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    if (isVip || profile?.role === 'vip') {
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          <Star className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const isAlreadyFriend = userId ? isFriend(userId) : false;

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-64 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 border-2 border-background shadow">
          {avatarUrl || profile?.avatar_url ? (
            <AvatarImage src={avatarUrl || profile?.avatar_url || undefined} />
          ) : null}
          <AvatarFallback className="text-sm bg-primary/20 text-primary">
            {isCreator ? <Crown className="w-5 h-5" /> : 
             isAdmin ? <Shield className="w-5 h-5" /> : 
             getInitials(displayName || username)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-sm truncate">
              {profile?.display_name || displayName || username}
            </span>
            {getRoleBadge()}
          </div>
          <p className="text-xs text-muted-foreground">@{profile?.username || username}</p>
        </div>
      </div>
      
      {/* Bio */}
      {profile?.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {profile.bio}
        </p>
      )}
      
      {/* Stats */}
      <div className="flex gap-3 text-center">
        <div className="flex-1 p-2 rounded bg-muted/30">
          <Trophy className="w-3 h-3 mx-auto text-amber-400 mb-0.5" />
          <div className="text-sm font-bold">{stats.achievementCount}</div>
        </div>
        <div className="flex-1 p-2 rounded bg-muted/30">
          <Users className="w-3 h-3 mx-auto text-blue-400 mb-0.5" />
          <div className="text-sm font-bold">{stats.friendCount}</div>
        </div>
        <div className="flex-1 p-2 rounded bg-muted/30">
          <MessageSquare className="w-3 h-3 mx-auto text-green-400 mb-0.5" />
          <div className="text-sm font-bold">{profile?.total_chat_messages || 0}</div>
        </div>
      </div>
      
      {/* Member Since */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Member since {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}</span>
      </div>
      
      {/* Actions */}
      {!isCurrentUser && userId && (
        <div className="flex gap-2">
          {!isAlreadyFriend && !friendRequestSent && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleAddFriend}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
          {isAlreadyFriend && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              disabled
            >
              <Users className="w-3 h-3 mr-1" />
              Friends
            </Button>
          )}
          {friendRequestSent && !isAlreadyFriend && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              disabled
            >
              Sent
            </Button>
          )}
          {onSendMessage && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleSendMessage}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;
