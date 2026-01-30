-- Fix RLS policy for demo_leads table
-- The previous policy was too permissive, allowing any role to access all data
-- Service role bypasses RLS automatically, so we don't need an explicit policy for it

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage demo_leads" ON public.demo_leads;

-- Create restrictive policy that blocks all public access
-- Service role (used by edge functions) bypasses RLS and will still work
CREATE POLICY "No public access to demo_leads"
  ON public.demo_leads
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Add comment explaining the security model
COMMENT ON POLICY "No public access to demo_leads" ON public.demo_leads IS
  'Blocks all access from anon and authenticated roles. Service role bypasses RLS for edge function access.';
