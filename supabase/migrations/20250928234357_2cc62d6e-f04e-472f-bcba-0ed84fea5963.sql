-- Add DELETE policy for conversations table
CREATE POLICY "Users can delete own conversations" 
ON public.conversations 
FOR DELETE 
USING (user_id = auth.uid());