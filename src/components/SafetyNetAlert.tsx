import { Deal } from '@/hooks/useDeals';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { parseISO } from 'date-fns';

interface SafetyNetAlertProps {
  deals: Deal[];
}

export function SafetyNetAlert({ deals }: SafetyNetAlertProps) {
  const checkSafetyNet = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    
    let belowThresholdCount = 0;
    
    for (let i = 0; i < 2; i++) {
      let quarter = currentQuarter - i;
      let year = currentYear;
      
      if (quarter <= 0) {
        quarter += 4;
        year -= 1;
      }
      
      const startMonth = (quarter - 1) * 3;
      const endMonth = startMonth + 2;
      
      const quarterDeals = deals.filter((deal) => {
        const date = parseISO(deal.date_payment);
        const month = date.getMonth();
        return month >= startMonth && month <= endMonth && date.getFullYear() === year;
      });
      
      const revenue = quarterDeals.reduce((sum, d) => sum + (d.net_revenue ?? 0), 0);
      const monthlyAvg = revenue / 3;
      
      if (monthlyAvg < 1500) {
        belowThresholdCount++;
      }
    }
    
    return belowThresholdCount >= 2;
  };

  const isAlertTriggered = checkSafetyNet();

  if (!isAlertTriggered) {
    return null;
  }

  return (
    <div className="safety-alert bento-card flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
        <ShieldAlert className="w-6 h-6 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-display font-bold text-destructive mb-1">
          Safety Net Alert
        </h3>
        <p className="text-sm text-foreground/80">
          Monthly Net Revenue has been below $1,500 for two consecutive quarters.
          Consider reviewing marketing strategies and lead generation efforts.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-xs text-muted-foreground">
            Immediate action recommended
          </span>
        </div>
      </div>
    </div>
  );
}
