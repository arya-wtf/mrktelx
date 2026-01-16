import { COMMISSION_TIERS, formatPercentage, formatCurrency } from '@/lib/commission';
import { Layers } from 'lucide-react';

export function TierExplainer() {
  return (
    <div className="bento-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold">Commission Tiers</h3>
          <p className="text-xs text-muted-foreground">Monthly Net Revenue Based</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Tier 1 */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center justify-between mb-1">
            <span className="tier-badge tier-1">Tier 1</span>
            <span className="text-sm font-medium text-muted-foreground">0%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            $0 — $1,500 (Safety Net)
          </p>
        </div>

        {/* Tier 2 */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-1">
            <span className="tier-badge tier-2">Tier 2</span>
            <span className="text-sm font-medium text-primary">8%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            $1,501 — $3,000 (on amount exceeding $1,500)
          </p>
        </div>

        {/* Tier 3 */}
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center justify-between mb-1">
            <span className="tier-badge tier-3">Tier 3</span>
            <span className="text-sm font-medium text-success">12%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Above $3,000 (on amount exceeding $3,000)
          </p>
        </div>
      </div>

      {/* Retainer Note */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs font-medium text-muted-foreground mb-2">Retainer Multiplier:</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-success/10 text-success">
            <span className="font-bold">100%</span>
            <br />Month 1
          </div>
          <div className="p-2 rounded bg-primary/10 text-primary">
            <span className="font-bold">50%</span>
            <br />Month 2-3
          </div>
          <div className="p-2 rounded bg-muted text-muted-foreground">
            <span className="font-bold">0%</span>
            <br />Month 4+
          </div>
        </div>
      </div>
    </div>
  );
}
