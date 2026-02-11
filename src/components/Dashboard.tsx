import { useState, useMemo } from 'react';
import { useDeals, useCorrections, Deal } from '@/hooks/useDeals';
import { AppRole } from '@/hooks/useUserRole';
import { formatCurrency, calculateTieredCommission } from '@/lib/commission';
import { StatCard } from './StatCard';
import { DealsTable } from './DealsTable';
import { QuarterlySummary } from './QuarterlySummary';
import { SafetyNetAlert } from './SafetyNetAlert';

import { CorrectionLog } from './CorrectionLog';
import { TierExplainer } from './TierExplainer';
import { DealForm } from './DealForm';
import { MonthlyCommissionSummary } from './MonthlyCommissionSummary';
import { BulkDealImport } from './BulkDealImport';
import { RevenueCharts } from './RevenueCharts';
import { UserManagement } from './UserManagement';
import { PendingApprovals } from './PendingApprovals';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Award,
  Calendar,
  BarChart3,
  LineChart,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  Upload,
  ClipboardCheck
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, addMonths } from 'date-fns';

interface DashboardProps {
  userRole: AppRole;
}

export function Dashboard({ userRole }: DashboardProps) {
  const { data: deals = [], isLoading: dealsLoading } = useDeals();
  const { data: corrections = [], isLoading: correctionsLoading } = useCorrections();
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const isAdmin = userRole === 'admin';

  // Filter only approved deals for calculations
  const approvedDeals = useMemo(() => 
    deals.filter((deal: Deal) => (deal as any).status === 'approved'),
    [deals]
  );

  // Selected month deals (approved only)
  const currentMonthDeals = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return approvedDeals.filter((deal: Deal) => {
      const paymentDate = parseISO(deal.date_payment);
      return isWithinInterval(paymentDate, { start, end });
    });
  }, [approvedDeals, selectedMonth]);

  // All month deals (including pending/rejected) for display
  const allCurrentMonthDeals = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return deals.filter((deal: Deal) => {
      const paymentDate = parseISO(deal.date_payment);
      return isWithinInterval(paymentDate, { start, end });
    });
  }, [deals, selectedMonth]);

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
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground font-medium min-w-[140px] text-center">
                {format(selectedMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowBulkImport(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk Import
              </Button>
            )}
            <Button onClick={() => setShowAddDeal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {isAdmin ? 'Add Deal' : 'Submit Deal'}
            </Button>
          </div>
        </div>

        {/* Safety Net Alert */}
        <SafetyNetAlert deals={approvedDeals} selectedMonth={selectedMonth} />

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
            {isAdmin && (
              <TabsTrigger value="approvals" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Approvals
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            {/* Monthly Commission Summary */}
            <MonthlyCommissionSummary deals={currentMonthDeals} isAdmin={isAdmin} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deals Table - Takes 2 columns */}
              <div className="lg:col-span-2">
              <h3 className="text-lg font-display font-semibold mb-4">
                Deals This Month ({allCurrentMonthDeals.length})
              </h3>
              <DealsTable deals={allCurrentMonthDeals} isAdmin={isAdmin} />
              </div>

              {/* Sidebar - 1 column */}
              <div className="space-y-6">
                <TierExplainer />
                {isAdmin && <CorrectionLog corrections={corrections} deals={deals} isAdmin={isAdmin} />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <RevenueCharts deals={approvedDeals} selectedMonth={selectedMonth} />
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-6">
            <QuarterlySummary deals={approvedDeals} />
            
            {isAdmin && (
              <CorrectionLog corrections={corrections} deals={approvedDeals} isAdmin={isAdmin} />
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="approvals" className="space-y-6">
              <PendingApprovals />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Add Deal Modal */}
      {showAddDeal && <DealForm onClose={() => setShowAddDeal(false)} isAdmin={isAdmin} />}
      
      {/* Bulk Import Modal */}
      {showBulkImport && <BulkDealImport onClose={() => setShowBulkImport(false)} isAdmin={isAdmin} />}
    </div>
  );
}
