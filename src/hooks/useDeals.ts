import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Deal = Tables<'deals'> & {
  marketer_email?: string;
  status?: string;
  admin_notes?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
};
export type DealInsert = TablesInsert<'deals'>;
export type DealUpdate = TablesUpdate<'deals'>;
export type Correction = Tables<'corrections'>;
export type CorrectionInsert = TablesInsert<'corrections'>;


export function useDeals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch deals with marketer profile info
      const { data: deals, error } = await supabase
        .from('deals')
        .select('*')
        .order('date_payment', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(deals.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);
      
      // Map emails to deals
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) ?? []);
      
      return deals.map(deal => ({
        ...deal,
        marketer_email: profileMap.get(deal.user_id),
      })) as Deal[];
    },
    enabled: !!user,
  });
}

export function useMarketers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['marketers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email')
        .order('email');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deal: Omit<DealInsert, 'user_id'> & { user_id?: string; isAdmin?: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { isAdmin, ...dealData } = deal;
      // Use provided user_id (admin assigning to marketer) or fall back to current user
      const targetUserId = dealData.user_id || user.id;
      
      // Admin deals are auto-approved, marketer deals are pending
      const status = isAdmin ? 'approved' : 'pending';
      
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...dealData, user_id: targetUserId, status: status as any })
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

export function usePendingDeals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['deals', 'pending'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: deals, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const userIds = [...new Set(deals.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) ?? []);
      
      return deals.map(deal => ({
        ...deal,
        marketer_email: profileMap.get(deal.user_id),
      })) as Deal[];
    },
    enabled: !!user,
  });
}

export function useApproveDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, admin_notes, updates }: { id: string; admin_notes?: string; updates?: Partial<DealUpdate> }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('deals')
        .update({
          ...updates,
          status: 'approved' as any,
          admin_notes: admin_notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
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

export function useRejectDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, admin_notes }: { id: string; admin_notes: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('deals')
        .update({
          status: 'rejected' as any,
          admin_notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
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

