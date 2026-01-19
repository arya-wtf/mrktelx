import { useMemo } from 'react';
import { Deal } from '@/hooks/useDeals';
import { calculateTieredCommission, formatCurrency, formatPercentage, COMMISSION_TIERS } from '@/lib/commission';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, DollarSign, User } from 'lucide-react';

interface MonthlyCommissionSummaryProps {
  deals: Deal[];
  isAdmin?: boolean;
}

interface MarketerSummary {
  email: string;
  totalNetRevenue: number;
  commission: number;
  tier: number;
  rate: number;
}

function CommissionCard({ 
  label,
  totalNetRevenue, 
  commission, 
  tier, 
  rate,
  showProgress = true 
}: { 
  label?: string;
  totalNetRevenue: number; 
  commission: number; 
  tier: number;
  rate: number;
  showProgress?: boolean;
}) {
  const nextTierThreshold = tier === 1 ? 1500 : tier === 2 ? 3000 : null;
  const amountToNextTier = nextTierThreshold ? nextTierThreshold - totalNetRevenue : null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/30 border-primary/20">
      <CardContent className="p-4">
        {label && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Total Revenue */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Net Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalNetRevenue)}</p>
            </div>
          </div>

          {/* Current Tier */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50">
              <Target className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={tier === 3 ? 'default' : 'secondary'}
                  className={tier === 3 ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  Tier {tier}
                </Badge>
                <span className="text-lg font-semibold">{formatPercentage(rate)}</span>
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Commission</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(commission)}</p>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {showProgress && amountToNextTier !== null && amountToNextTier > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{formatCurrency(amountToNextTier)}</span> more to reach{' '}
              <Badge variant="outline" className="ml-1">
                Tier {tier + 1} ({tier === 1 ? '8%' : '12%'})
              </Badge>
            </p>
          </div>
        )}

        {/* Tier 3 achievement */}
        {showProgress && tier === 3 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-green-500 font-medium">
              🎉 Maximum tier achieved! Earning 12% on revenue above $3,000
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyCommissionSummary({ deals, isAdmin = false }: MonthlyCommissionSummaryProps) {
  // Group deals by marketer for admin view
  const marketerSummaries = useMemo(() => {
    if (!isAdmin) return null;
    
    const grouped = deals.reduce((acc, deal) => {
      const email = deal.marketer_email ?? 'Unknown';
      if (!acc[email]) {
        acc[email] = { email, deals: [] };
      }
      acc[email].deals.push(deal);
      return acc;
    }, {} as Record<string, { email: string; deals: Deal[] }>);

    return Object.values(grouped).map(({ email, deals }) => {
      const totalNetRevenue = deals.reduce((sum, d) => sum + (d.net_revenue ?? 0), 0);
      const { commission, tier } = calculateTieredCommission(totalNetRevenue);
      const tierInfo = COMMISSION_TIERS.find(t => t.tier === tier);
      return {
        email,
        totalNetRevenue,
        commission,
        tier,
        rate: tierInfo?.rate ?? 0,
      };
    }).sort((a, b) => b.totalNetRevenue - a.totalNetRevenue);
  }, [deals, isAdmin]);

  // For non-admin, show single summary
  if (!isAdmin) {
    const totalNetRevenue = deals.reduce((sum, deal) => sum + (deal.net_revenue ?? 0), 0);
    const { commission, tier } = calculateTieredCommission(totalNetRevenue);
    const tierInfo = COMMISSION_TIERS.find(t => t.tier === tier);

    return (
      <CommissionCard
        totalNetRevenue={totalNetRevenue}
        commission={commission}
        tier={tier}
        rate={tierInfo?.rate ?? 0}
      />
    );
  }

  // Admin view: show per-marketer summaries
  if (!marketerSummaries || marketerSummaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Commission by Marketer</h3>
      <div className="grid grid-cols-1 gap-4">
        {marketerSummaries.map((summary) => (
          <CommissionCard
            key={summary.email}
            label={summary.email}
            totalNetRevenue={summary.totalNetRevenue}
            commission={summary.commission}
            tier={summary.tier}
            rate={summary.rate}
            showProgress={false}
          />
        ))}
      </div>
    </div>
  );
}
