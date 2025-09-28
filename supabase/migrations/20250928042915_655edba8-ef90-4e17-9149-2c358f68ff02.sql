-- Add unique index to prevent duplicate assistant messages
CREATE UNIQUE INDEX IF NOT EXISTS messages_response_id_unique 
ON public.messages(response_id) 
WHERE response_id IS NOT NULL;

-- Add composite index for faster message lookups
CREATE INDEX IF NOT EXISTS messages_conversation_created_at_idx 
ON public.messages(conversation_id, created_at);