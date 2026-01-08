-- Fix the Security Definer View issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_uur_submissions;

CREATE VIEW public.public_uur_submissions 
WITH (security_invoker = true) AS
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

-- Re-grant access
GRANT SELECT ON public.public_uur_submissions TO anon, authenticated;