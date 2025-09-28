-- Add created_by column to organizations table (only if doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'organizations' 
                   AND column_name = 'created_by' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.organizations ADD COLUMN created_by uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Create function to set created_by automatically
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$;

-- Add trigger to set created_by on insert (drop if exists first)
DROP TRIGGER IF EXISTS set_organizations_created_by ON public.organizations;
CREATE TRIGGER set_organizations_created_by
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- Add SELECT policy for organization creators
CREATE POLICY "Users can view organizations they created" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (created_by = auth.uid());

-- Add INSERT policy for user_roles to allow onboarding self-admin assignment
CREATE POLICY "Users can assign themselves admin role during onboarding" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'admin'::app_role
  AND EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id 
    AND created_by = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.organization_id = user_roles.organization_id 
    AND ur.role = 'admin'::app_role
  )
);