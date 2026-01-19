import { Deal } from '@/hooks/useDeals';
import { calculateTieredCommission, formatCurrency, formatPercentage, COMMISSION_TIERS } from '@/lib/commission';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, DollarSign } from 'lucide-react';

interface MonthlyCommissionSummaryProps {
  deals: Deal[];
}

export function MonthlyCommissionSummary({ deals }: MonthlyCommissionSummaryProps) {
  const totalNetRevenue = deals.reduce((sum, deal) => sum + (deal.net_revenue ?? 0), 0);
  const { commission, tier, breakdown } = calculateTieredCommission(totalNetRevenue);
  
  const tierInfo = COMMISSION_TIERS.find(t => t.tier === tier);
  const currentRate = tierInfo?.rate ?? 0;
  
  // Calculate how much more to next tier
  const nextTierThreshold = tier === 1 ? 1500 : tier === 2 ? 3000 : null;
  const amountToNextTier = nextTierThreshold ? nextTierThreshold - totalNetRevenue : null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/30 border-primary/20">
      <CardContent className="p-4">
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
                <span className="text-lg font-semibold">{formatPercentage(currentRate)}</span>
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
        {amountToNextTier !== null && amountToNextTier > 0 && (
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
        {tier === 3 && (
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
