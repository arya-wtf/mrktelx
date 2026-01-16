import { useAllUsersWithRoles, useUpdateUserRole, AppRole, UserWithProfile } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, Eye, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

export function UserManagement() {
  const { data: users = [], isLoading } = useAllUsersWithRoles();
  const updateRole = useUpdateUserRole();

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateRole.mutateAsync({ userId, newRole });
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating role:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users found</p>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user: UserWithProfile) => (
                <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {user.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-primary" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm font-medium truncate max-w-[250px]">
                          {user.email}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {format(parseISO(user.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <Select
                    value={user.role}
                    onValueChange={(value: AppRole) => handleRoleChange(user.user_id, value)}
                    disabled={updateRole.isPending}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="marketer">
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          Marketer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
