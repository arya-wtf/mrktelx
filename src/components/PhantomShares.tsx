import { useDealStore } from '@/store/dealStore';
import { differenceInDays, differenceInMonths, addYears, format } from 'date-fns';
import { Award, Calendar, TrendingUp } from 'lucide-react';

export function PhantomShares() {
  const { phantomSharesStartDate } = useDealStore();
  
  const startDate = new Date(phantomSharesStartDate);
  const vestingEndDate = addYears(startDate, 4);
  const today = new Date();
  
  const totalDays = differenceInDays(vestingEndDate, startDate);
  const elapsedDays = Math.min(differenceInDays(today, startDate), totalDays);
  const progress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
  
  const monthsElapsed = differenceInMonths(today, startDate);
  const yearsElapsed = Math.floor(monthsElapsed / 12);
  const remainingMonths = 48 - monthsElapsed;
  
  const vestedPercentage = Math.min(4, (progress / 100) * 4);

  return (
    <div className="bento-card-glow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold">Phantom Shares</h3>
          <p className="text-xs text-muted-foreground">4% Annual Net Profit Sharing</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Vesting Progress</span>
            <span className="font-medium text-primary">{vestedPercentage.toFixed(2)}% vested</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Time Elapsed</span>
            </div>
            <p className="text-lg font-display font-bold">
              {yearsElapsed}y {monthsElapsed % 12}m
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Remaining</span>
            </div>
            <p className="text-lg font-display font-bold">
              {Math.max(0, remainingMonths)} months
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Start: {format(startDate, 'MMM d, yyyy')}</span>
            <span>Full Vest: {format(vestingEndDate, 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
