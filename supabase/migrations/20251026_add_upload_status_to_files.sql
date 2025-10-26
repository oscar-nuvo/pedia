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

-- Add a response_id field to messages for idempotency
ALTER TABLE public.messages
ADD COLUMN response_id TEXT UNIQUE;

-- Create index on response_id for deduplication
CREATE INDEX idx_messages_response_id ON public.messages(response_id);
