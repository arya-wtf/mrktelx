import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { AuthForm } from '@/components/AuthForm';
import { UserRole } from '@/types/deal';
import { Loader2 } from 'lucide-react';

function IndexContent() {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} onRoleChange={setUserRole} />
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
