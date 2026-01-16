import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'marketer';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export interface UserWithProfile {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email: string;
}

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data as UserRole;
    },
    enabled: !!user,
  });
}

export function useHasAnyAdmin() {
  return useQuery({
    queryKey: ['has-any-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_any_admin');
      
      if (error) {
        console.error('Error checking for admins:', error);
        return true; // Assume admins exist on error to prevent unauthorized promotion
      }
      
      return data as boolean;
    },
  });
}

export function usePromoteToFirstAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('promote_to_first_admin', {
        _user_id: userId,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['has-any-admin'] });
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
    },
  });
}

export function useAllUsersWithRoles() {
  return useQuery({
    queryKey: ['all-users-roles'],
    queryFn: async () => {
      // Get all user roles with their profiles (only admins can see all via RLS)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Error fetching all user roles:', rolesError);
        throw rolesError;
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Merge roles with profiles
      const usersWithProfiles: UserWithProfile[] = (roles as UserRole[]).map((role) => {
        const profile = (profiles as Profile[]).find((p) => p.user_id === role.user_id);
        return {
          ...role,
          email: profile?.email ?? 'Unknown',
        };
      });

      return usersWithProfiles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
    },
  });
}
