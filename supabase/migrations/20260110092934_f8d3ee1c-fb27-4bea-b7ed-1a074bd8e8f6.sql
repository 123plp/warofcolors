-- Fix leaderboard_stats view to use security invoker (default)
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE VIEW public.leaderboard_stats 
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.total_chat_messages,
  p.total_messages,
  p.last_seen,
  p.is_online,
  p.created_at as member_since,
  COALESCE((SELECT COUNT(*) FROM public.user_achievements ua WHERE ua.user_id = p.user_id), 0) as achievement_count,
  COALESCE((SELECT COUNT(*) FROM public.friends f WHERE (f.user_id = p.user_id OR f.friend_id = p.user_id) AND f.status = 'accepted'), 0) as friend_count,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id;