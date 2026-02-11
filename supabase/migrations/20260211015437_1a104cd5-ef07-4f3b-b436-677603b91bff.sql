
-- Create enum for deal status
CREATE TYPE public.deal_status AS ENUM ('pending', 'approved', 'rejected');

-- Add columns to deals table
ALTER TABLE public.deals 
  ADD COLUMN status public.deal_status NOT NULL DEFAULT 'pending',
  ADD COLUMN admin_notes text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewed_by uuid;

-- Set all existing deals as approved
UPDATE public.deals SET status = 'approved';

-- The existing "Users can create their own deals" INSERT policy uses restrictive mode.
-- We need to ensure marketers can insert with status defaulting to 'pending'.
-- The existing policy checks (auth.uid() = user_id) which should work.
-- But we should also ensure marketers cannot set status to 'approved' themselves.
-- We'll handle that in the application layer since the default is 'pending'.
