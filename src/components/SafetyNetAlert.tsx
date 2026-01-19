import { Deal } from '@/hooks/useDeals';
import { AlertTriangle, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import { parseISO } from 'date-fns';

interface SafetyNetAlertProps {
  deals: Deal[];
  selectedMonth: Date;
}

type AlertLevel = 'safe' | 'urgent' | 'very-urgent';

export function SafetyNetAlert({ deals, selectedMonth }: SafetyNetAlertProps) {
  const getMonthlyRevenue = () => {
    const targetMonth = selectedMonth.getMonth();
    const targetYear = selectedMonth.getFullYear();

    const monthlyDeals = deals.filter((deal) => {
      const date = parseISO(deal.date_payment);
      return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
    });

    return monthlyDeals.reduce((sum, d) => sum + (d.net_revenue ?? 0), 0);
  };

  const getAlertLevel = (revenue: number): AlertLevel => {
    if (revenue >= 3000) return 'safe';
    if (revenue >= 1500) return 'urgent';
    return 'very-urgent';
  };

  const monthlyRevenue = getMonthlyRevenue();
  const alertLevel = getAlertLevel(monthlyRevenue);

  const alertConfig = {
    'very-urgent': {
      icon: ShieldAlert,
      iconBg: 'bg-destructive/20',
      iconColor: 'text-destructive',
      title: 'Very Urgent - Critical Revenue Alert',
      titleColor: 'text-destructive',
      description: `Monthly Net Revenue is $${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (below $1,500). Immediate action required to increase revenue.`,
      actionIcon: AlertTriangle,
      actionIconColor: 'text-destructive',
      actionText: 'Immediate action required',
      borderClass: 'border-destructive/30',
    },
    'urgent': {
      icon: AlertCircle,
      iconBg: 'bg-warning/20',
      iconColor: 'text-warning',
      title: 'Urgent - Revenue Warning',
      titleColor: 'text-warning',
      description: `Monthly Net Revenue is $${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (below $3,000). Consider increasing marketing efforts.`,
      actionIcon: AlertTriangle,
      actionIconColor: 'text-warning',
      actionText: 'Action recommended',
      borderClass: 'border-warning/30',
    },
    'safe': {
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      title: 'Safe Zone',
      titleColor: 'text-emerald-500',
      description: `Monthly Net Revenue is $${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Great job maintaining healthy revenue!`,
      actionIcon: ShieldCheck,
      actionIconColor: 'text-emerald-500',
      actionText: 'Keep up the great work',
      borderClass: 'border-emerald-500/30',
    },
  };

  const config = alertConfig[alertLevel];
  const IconComponent = config.icon;
  const ActionIconComponent = config.actionIcon;

  return (
    <div className={`bento-card flex items-start gap-4 mb-6 border ${config.borderClass}`}>
      <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
        <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
      </div>
      <div>
        <h3 className={`text-lg font-display font-bold ${config.titleColor} mb-1`}>
          {config.title}
        </h3>
        <p className="text-sm text-foreground/80">
          {config.description}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <ActionIconComponent className={`w-4 h-4 ${config.actionIconColor}`} />
          <span className="text-xs text-muted-foreground">
            {config.actionText}
          </span>
        </div>
      </div>
    </div>
  );
}
