import { useDealStore } from '@/store/dealStore';
import { UserRole } from '@/types/deal';
import { Shield, Eye, Sparkles } from 'lucide-react';

export function Header() {
  const { userRole, setUserRole } = useDealStore();

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">Elux Space</h1>
              <p className="text-xs text-muted-foreground">Marketing Performance Tracker</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">View as:</span>
            <div className="flex rounded-lg bg-secondary/50 p-1">
              <button
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  userRole === 'admin'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin (CEO)
              </button>
              <button
                onClick={() => handleRoleChange('marketer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  userRole === 'marketer'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-4 h-4" />
                Marketer
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
