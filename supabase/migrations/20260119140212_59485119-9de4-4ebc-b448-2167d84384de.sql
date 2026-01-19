-- Drop existing restrictive SELECT policies on deals
DROP POLICY IF EXISTS "Admins can view all deals" ON public.deals;
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;

-- Create PERMISSIVE SELECT policies (at least one must pass)
CREATE POLICY "Users can view their own deals"
ON public.deals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all deals"
ON public.deals
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));