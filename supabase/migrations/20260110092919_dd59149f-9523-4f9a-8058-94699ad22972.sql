-- =============================================
-- UrbanShade v3.1 - Online Features Migration
-- =============================================

-- Add new columns to profiles table for stats
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_messages integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_chat_messages integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_achievements
CREATE POLICY "Anyone can view achievements"
  ON public.user_achievements
  FOR SELECT
  USING (true);

CREATE POLICY "System can grant achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage achievements"
  ON public.user_achievements
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create system_events table
CREATE TABLE IF NOT EXISTS public.system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'announcement',
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  priority text DEFAULT 'normal'
);

-- Enable RLS on system_events
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for system_events
CREATE POLICY "Anyone can view active events"
  ON public.system_events
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage events"
  ON public.system_events
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create leaderboard stats view
CREATE OR REPLACE VIEW public.leaderboard_stats AS
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

-- Function to update last_seen on activity
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = now(), is_online = true 
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- Function to increment chat message count
CREATE OR REPLACE FUNCTION public.increment_chat_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET total_chat_messages = total_chat_messages + 1 
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to increment chat count on new messages
DROP TRIGGER IF EXISTS on_chat_message_insert ON public.global_chat_messages;
CREATE TRIGGER on_chat_message_insert
  AFTER INSERT ON public.global_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_chat_count();

-- Add system_events and user_achievements to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;