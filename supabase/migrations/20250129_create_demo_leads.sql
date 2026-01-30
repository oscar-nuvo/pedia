-- Create demo_leads table for landing page demo lead capture
-- This tracks emails and query usage for the free demo experience

CREATE TABLE IF NOT EXISTS public.demo_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  queries_used INTEGER DEFAULT 1,
  first_question TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_query_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per email
  CONSTRAINT demo_leads_email_unique UNIQUE (email)
);

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS idx_demo_leads_email ON public.demo_leads(email);

-- Index for analytics queries (leads over time)
CREATE INDEX IF NOT EXISTS idx_demo_leads_created_at ON public.demo_leads(created_at);

-- Enable RLS but allow public insert/update for demo functionality
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from edge functions (service role)
CREATE POLICY "Service role can manage demo_leads"
  ON public.demo_leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE public.demo_leads IS 'Stores email leads from landing page demo with query tracking';
