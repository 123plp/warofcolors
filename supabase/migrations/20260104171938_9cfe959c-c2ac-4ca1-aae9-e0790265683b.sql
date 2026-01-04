-- =============================================
-- PHASE 1-3: Database migrations (without NAVI profile - will handle in code)
-- =============================================

-- 1. Add message_type and metadata columns to messages table for friend requests and system messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'normal';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 2. Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS on friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Friends RLS policies
CREATE POLICY "Users can view their own friendships"
ON friends FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
ON friends FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests sent to them"
ON friends FOR UPDATE
USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships"
ON friends FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 3. Create monitoring_events table for NAVI anomaly detection
CREATE TABLE IF NOT EXISTS monitoring_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on monitoring_events
ALTER TABLE monitoring_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view monitoring events
CREATE POLICY "Admins can view monitoring events"
ON monitoring_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert monitoring events (via edge function with service role)
CREATE POLICY "System can insert monitoring events"
ON monitoring_events FOR INSERT
WITH CHECK (true);

-- 4. Enable realtime for messages and friends tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE friends;

-- 5. Set REPLICA IDENTITY FULL for realtime
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE friends REPLICA IDENTITY FULL;