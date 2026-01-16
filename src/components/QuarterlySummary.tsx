import { useDealStore } from '@/store/dealStore';
import { getQuarterlyNetRevenue, formatCurrency, calculateTieredCommission } from '@/lib/commission';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuarterlySummary() {
  const { deals } = useDealStore();
  const currentYear = new Date().getFullYear();

  const quarters = [1, 2, 3, 4].map((quarter) => {
    const netRevenue = getQuarterlyNetRevenue(deals, quarter, currentYear);
    const { commission, tier } = calculateTieredCommission(netRevenue);
    const monthlyAvg = netRevenue / 3;
    const isBelowSafety = monthlyAvg < 1500;

    return {
      quarter,
      label: `Q${quarter}`,
      netRevenue,
      commission,
      tier,
      monthlyAvg,
      isBelowSafety,
    };
  });

  return (
    <div className="bento-card">
      <h3 className="text-lg font-display font-semibold mb-4">Quarterly Summary - {currentYear}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quarters.map((q) => (
          <div
            key={q.quarter}
            className={cn(
              'p-4 rounded-xl border transition-all',
              q.isBelowSafety
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-border/50 bg-secondary/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">{q.label}</span>
              {q.netRevenue > 0 ? (
                <TrendingUp className={cn(
                  'w-4 h-4',
                  q.isBelowSafety ? 'text-destructive' : 'text-success'
                )} />
              ) : (
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            
            <p className={cn(
              'text-xl font-display font-bold',
              q.isBelowSafety ? 'text-destructive' : 'stat-value'
            )}>
              {formatCurrency(q.netRevenue)}
            </p>
            
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Avg/month: {formatCurrency(q.monthlyAvg)}
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">Commission: </span>
                <span className="text-success font-medium">{formatCurrency(q.commission)}</span>
              </p>
            </div>

            {q.isBelowSafety && (
              <div className="mt-2 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs font-medium">
                Below Safety Net
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
