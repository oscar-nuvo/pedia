-- Add response_id field to messages table for tracking OpenAI response IDs
ALTER TABLE public.messages ADD COLUMN response_id TEXT;

-- Add index for response_id lookups
CREATE INDEX IF NOT EXISTS idx_messages_response_id ON public.messages(response_id);

-- Update conversations metadata to track latest response ID
COMMENT ON COLUMN public.conversations.metadata IS 'JSON metadata including latest OpenAI response_id for conversation continuity';