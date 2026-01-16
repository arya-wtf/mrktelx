-- 1. Create profiles table for storing user emails
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert profiles (for trigger)
CREATE POLICY "System can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Update handle_new_user function to also create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'marketer');
  
  -- Create profile with email
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  RETURN NEW;
END;
$$;

-- 5. Create function to check if any admin exists (for first admin setup)
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'admin'
  )
$$;

-- 6. Create function to promote to first admin (only works if no admins exist)
CREATE OR REPLACE FUNCTION public.promote_to_first_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if no admins exist
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN FALSE;
  END IF;
  
  -- Promote the user
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;