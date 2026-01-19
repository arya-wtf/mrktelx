-- Drop existing SELECT policies for deals (they're RESTRICTIVE which causes issues)
DROP POLICY IF EXISTS "Users can view their own deals or admins can view all" ON public.deals;

-- Create new PERMISSIVE SELECT policies for deals
CREATE POLICY "Users can view their own deals"
ON public.deals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all deals"
ON public.deals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Also fix INSERT policy for admins to insert deals for any user
DROP POLICY IF EXISTS "Users can create their own deals" ON public.deals;

CREATE POLICY "Users can create their own deals"
ON public.deals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create deals for any user"
ON public.deals
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));