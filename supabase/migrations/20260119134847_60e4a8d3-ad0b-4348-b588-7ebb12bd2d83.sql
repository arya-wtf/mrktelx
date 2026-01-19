-- Add foreign key constraint on deals.user_id referencing profiles.user_id
ALTER TABLE public.deals
ADD CONSTRAINT deals_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- Add index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);