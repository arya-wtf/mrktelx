import { useDealStore } from '@/store/dealStore';
import { checkSafetyNet } from '@/lib/commission';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export function SafetyNetAlert() {
  const { deals } = useDealStore();
  const isAlertTriggered = checkSafetyNet(deals);

  if (!isAlertTriggered) {
    return null;
  }

  return (
    <div className="safety-alert bento-card flex items-start gap-4">
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
