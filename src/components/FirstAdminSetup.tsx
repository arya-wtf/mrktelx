import { useAuth } from '@/hooks/useAuth';
import { useHasAnyAdmin, usePromoteToFirstAdmin } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FirstAdminSetupProps {
  onComplete: () => void;
}

export function FirstAdminSetup({ onComplete }: FirstAdminSetupProps) {
  const { user } = useAuth();
  const { data: hasAdmin, isLoading } = useHasAnyAdmin();
  const promoteToAdmin = usePromoteToFirstAdmin();

  const handlePromote = async () => {
    if (!user) return;

    try {
      const success = await promoteToAdmin.mutateAsync(user.id);
      if (success) {
        toast.success('You are now an admin!');
        onComplete();
      } else {
        toast.error('An admin already exists');
      }
    } catch (error) {
      toast.error('Failed to promote to admin');
      console.error('Error promoting to admin:', error);
    }
  };

  // Don't show if still loading or if admin exists
  if (isLoading || hasAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome to Elux Space!</CardTitle>
          <CardDescription>
            No administrators have been set up yet. As the first user, you can become the admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">As an admin, you'll be able to:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• View and manage all deals</li>
              <li>• Add corrections and clawbacks</li>
              <li>• Manage user roles</li>
              <li>• Access the full dashboard</li>
            </ul>
          </div>
          
          <Button 
            onClick={handlePromote} 
            className="w-full gap-2" 
            size="lg"
            disabled={promoteToAdmin.isPending}
          >
            {promoteToAdmin.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Become Admin
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            This option is only available because no admins exist yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
