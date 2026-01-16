import { Deal } from '@/hooks/useDeals';
import { formatCurrency, calculateTieredCommission } from '@/lib/commission';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseISO } from 'date-fns';

interface QuarterlySummaryProps {
  deals: Deal[];
}

export function QuarterlySummary({ deals }: QuarterlySummaryProps) {
  const currentYear = new Date().getFullYear();

  const getQuarterlyData = (quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    const quarterDeals = deals.filter((deal) => {
      const date = parseISO(deal.date_payment);
      const month = date.getMonth();
      return month >= startMonth && month <= endMonth && date.getFullYear() === currentYear;
    });

    const netRevenue = quarterDeals.reduce((sum, d) => sum + (d.net_revenue ?? 0), 0);
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
      dealCount: quarterDeals.length,
    };
  };

  const quarters = [1, 2, 3, 4].map(getQuarterlyData);

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
                {q.dealCount} deals • Avg/mo: {formatCurrency(q.monthlyAvg)}
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
