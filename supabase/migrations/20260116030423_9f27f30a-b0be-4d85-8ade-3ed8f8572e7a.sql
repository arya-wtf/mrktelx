-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  date_deal DATE NOT NULL,
  date_payment DATE NOT NULL,
  estimate_date_done DATE NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_revenue NUMERIC(12,2) GENERATED ALWAYS AS (amount_paid - platform_fee) STORED,
  retainer_month INTEGER NOT NULL DEFAULT 1 CHECK (retainer_month >= 1 AND retainer_month <= 4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create corrections table for clawbacks
CREATE TABLE public.corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  deal_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create phantom_shares table for vesting tracking
CREATE TABLE public.phantom_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phantom_shares ENABLE ROW LEVEL SECURITY;

-- Deals RLS Policies
CREATE POLICY "Users can view their own deals" 
ON public.deals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" 
ON public.deals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" 
ON public.deals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Corrections RLS Policies
CREATE POLICY "Users can view their own corrections" 
ON public.corrections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own corrections" 
ON public.corrections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own corrections" 
ON public.corrections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Phantom Shares RLS Policies
CREATE POLICY "Users can view their own phantom shares" 
ON public.phantom_shares 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phantom shares" 
ON public.phantom_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phantom shares" 
ON public.phantom_shares 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();