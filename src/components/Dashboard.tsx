import { useState, useMemo } from 'react';
import { useDeals, useCorrections, Deal } from '@/hooks/useDeals';
import { UserRole } from '@/types/deal';
import { formatCurrency, calculateTieredCommission } from '@/lib/commission';
import { StatCard } from './StatCard';
import { DealsTable } from './DealsTable';
import { QuarterlySummary } from './QuarterlySummary';
import { SafetyNetAlert } from './SafetyNetAlert';
import { PhantomShares } from './PhantomShares';
import { CorrectionLog } from './CorrectionLog';
import { TierExplainer } from './TierExplainer';
import { DealForm } from './DealForm';
import { RevenueCharts } from './RevenueCharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Award,
  Calendar,
  BarChart3,
  LineChart,
  Loader2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface DashboardProps {
  userRole: UserRole;
}

export function Dashboard({ userRole }: DashboardProps) {
  const { data: deals = [], isLoading: dealsLoading } = useDeals();
  const { data: corrections = [], isLoading: correctionsLoading } = useCorrections();
  const [showAddDeal, setShowAddDeal] = useState(false);
  
  const isAdmin = userRole === 'admin';

  // Current month deals
  const currentMonthDeals = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return deals.filter((deal: Deal) => {
      const paymentDate = parseISO(deal.date_payment);
      return isWithinInterval(paymentDate, { start, end });
    });
  }, [deals]);

  // Calculate totals
  const totalNetRevenue = useMemo(() => 
    currentMonthDeals.reduce((sum: number, deal: Deal) => sum + (deal.net_revenue ?? 0), 0),
    [currentMonthDeals]
  );

  const totalCommission = useMemo(() => {
    const { commission } = calculateTieredCommission(totalNetRevenue);
    return commission;
  }, [totalNetRevenue]);

  const totalClawback = useMemo(() =>
    corrections.reduce((sum, c) => sum + c.amount, 0),
    [corrections]
  );

  const netCommission = totalCommission - totalClawback;
  const { tier } = calculateTieredCommission(totalNetRevenue);

  if (dealsLoading || correctionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              {isAdmin ? 'Management Dashboard' : 'Performance Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'MMMM yyyy')} Overview
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setShowAddDeal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Deal
            </Button>
          )}
        </div>

        {/* Safety Net Alert */}
        <SafetyNetAlert deals={deals} />

        {/* Stats Grid - Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Monthly Net Revenue"
            value={formatCurrency(totalNetRevenue)}
            subtitle={`${currentMonthDeals.length} deals this month`}
            icon={<DollarSign className="w-6 h-6" />}
            glow
          />
          <StatCard
            title="Gross Commission"
            value={formatCurrency(totalCommission)}
            subtitle={`Current Tier: ${tier}`}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="success"
          />
          <StatCard
            title="Clawbacks"
            value={formatCurrency(totalClawback)}
            subtitle={`${corrections.length} adjustments`}
            icon={<FileText className="w-6 h-6" />}
            variant={totalClawback > 0 ? 'warning' : 'default'}
          />
          <StatCard
            title="Net Commission"
            value={formatCurrency(netCommission)}
            subtitle="After corrections"
            icon={<Award className="w-6 h-6" />}
            variant="success"
            glow
          />
        </div>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="monthly" className="gap-2">
              <Calendar className="w-4 h-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <LineChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Quarterly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deals Table - Takes 2 columns */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-display font-semibold mb-4">
                  Deals This Month
                </h3>
                <DealsTable deals={currentMonthDeals} isAdmin={isAdmin} />
              </div>

              {/* Sidebar - 1 column */}
              <div className="space-y-6">
                <TierExplainer />
                {isAdmin && <CorrectionLog corrections={corrections} deals={deals} isAdmin={isAdmin} />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <RevenueCharts deals={deals} />
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-6">
            <QuarterlySummary deals={deals} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PhantomShares />
              {isAdmin && <CorrectionLog corrections={corrections} deals={deals} isAdmin={isAdmin} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Deal Modal */}
      {showAddDeal && <DealForm onClose={() => setShowAddDeal(false)} />}
    </div>
  );
}
