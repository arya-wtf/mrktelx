-- Add is_retainer column to deals table
ALTER TABLE public.deals 
ADD COLUMN is_retainer boolean NOT NULL DEFAULT false;