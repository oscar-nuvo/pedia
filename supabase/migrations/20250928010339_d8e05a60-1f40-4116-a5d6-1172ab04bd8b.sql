-- Add INSERT policy for organizations table to allow users without an organization to create one
CREATE POLICY "Users can create organization during onboarding" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow insert only if the user doesn't already have an organization
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND organization_id IS NOT NULL
  )
);