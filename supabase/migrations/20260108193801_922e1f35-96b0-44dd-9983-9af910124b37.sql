-- Fix 1: Create a public view for uur_submissions that hides internal reviewer_notes
CREATE VIEW public.public_uur_submissions AS
SELECT 
  id, 
  package_name, 
  github_url, 
  author, 
  description, 
  submitted_at, 
  status, 
  reviewed_at, 
  submitted_by
FROM public.uur_submissions;

-- Enable RLS on the view (views inherit from base table, but we can grant access)
GRANT SELECT ON public.public_uur_submissions TO anon, authenticated;

-- Fix 2: Add rate limiting table for anonymous UUR submissions
CREATE TABLE public.uur_submission_rate_limits (
  ip_hash TEXT NOT NULL PRIMARY KEY,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.uur_submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (used by edge function)
-- No public policies needed

-- Fix 3: Update uur_submissions INSERT policy to require authentication
-- First drop the permissive policy
DROP POLICY IF EXISTS "Anyone can submit packages" ON public.uur_submissions;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can submit packages" 
ON public.uur_submissions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add comment explaining the change
COMMENT ON TABLE public.uur_submission_rate_limits IS 'Rate limiting for UUR package submissions to prevent spam';
COMMENT ON VIEW public.public_uur_submissions IS 'Public view of UUR submissions that hides internal reviewer_notes field';