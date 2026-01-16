import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useUserRole, useHasAnyAdmin } from '@/hooks/useUserRole';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { AuthForm } from '@/components/AuthForm';
import { FirstAdminSetup } from '@/components/FirstAdminSetup';
import { Loader2 } from 'lucide-react';

function IndexContent() {
  const { user, loading } = useAuth();
  const { data: userRoleData, isLoading: roleLoading, refetch: refetchRole } = useUserRole();
  const { data: hasAdmin, isLoading: adminCheckLoading } = useHasAnyAdmin();
  const [setupComplete, setSetupComplete] = useState(false);

  if (loading || (user && (roleLoading || adminCheckLoading))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const userRole = userRoleData?.role ?? 'marketer';
  const showFirstAdminSetup = !hasAdmin && !setupComplete;

  const handleSetupComplete = () => {
    setSetupComplete(true);
    refetchRole();
  };

  return (
    <div className="min-h-screen bg-background">
      {showFirstAdminSetup && <FirstAdminSetup onComplete={handleSetupComplete} />}
      <Header userRole={userRole} />
      <Dashboard userRole={userRole} />
    </div>
  );
}

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
