-- Add upload status and error tracking to conversation_files table
ALTER TABLE public.conversation_files
ADD COLUMN upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'success', 'error')),
ADD COLUMN error_message TEXT,
ADD COLUMN upload_duration_ms INTEGER,
ADD COLUMN retry_count INTEGER DEFAULT 0;

-- Create index on upload_status for efficient querying
CREATE INDEX idx_conversation_files_upload_status ON public.conversation_files(upload_status);

-- Update messages table to better track file associations
ALTER TABLE public.messages
ADD COLUMN file_ids TEXT[] DEFAULT '{}';

-- Create index on file_ids for searching messages with files
CREATE INDEX idx_messages_file_ids ON public.messages USING GIN (file_ids);

-- Note: response_id column already exists from migration 20250928040827
-- Just ensure the unique constraint exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_response_id_key'
  ) THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_response_id_key UNIQUE (response_id);
  END IF;
END $$;
