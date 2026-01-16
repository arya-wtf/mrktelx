import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Deal = Tables<'deals'>;
export type DealInsert = TablesInsert<'deals'>;
export type DealUpdate = TablesUpdate<'deals'>;
export type Correction = Tables<'corrections'>;
export type CorrectionInsert = TablesInsert<'corrections'>;
export type PhantomShare = Tables<'phantom_shares'>;

export function useDeals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('date_payment', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!user,
  });
}

export function useAddDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deal: Omit<DealInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...deal, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DealUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useCorrections() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['corrections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('corrections')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Correction[];
    },
    enabled: !!user,
  });
}

export function useAddCorrection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (correction: Omit<CorrectionInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('corrections')
        .insert({ ...correction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
}

export function useDeleteCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('corrections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
}

export function usePhantomShares() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['phantom_shares', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('phantom_shares')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as PhantomShare | null;
    },
    enabled: !!user,
  });
}

export function useCreatePhantomShares() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (startDate: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('phantom_shares')
        .insert({ user_id: user.id, start_date: startDate })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phantom_shares'] });
    },
  });
}
