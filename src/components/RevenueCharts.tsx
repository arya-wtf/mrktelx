import { useMemo } from 'react';
import { Deal } from '@/hooks/useDeals';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, calculateTieredCommission } from '@/lib/commission';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface RevenueChartsProps {
  deals: Deal[];
  selectedMonth: Date;
}

interface MarketerTierData {
  marketer: string;
  netRevenue: number;
  tier: 1 | 2 | 3;
  tierLabel: string;
  commission: number;
  commissionRate: string;
  color: string;
}

export function RevenueCharts({ deals, selectedMonth }: RevenueChartsProps) {
  // Monthly revenue data for last 6 months
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    });

    return months.map((month) => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      
      const monthDeals = deals.filter((deal) => {
        const paymentDate = parseISO(deal.date_payment);
        return paymentDate >= start && paymentDate <= end;
      });

      const gross = monthDeals.reduce((sum, d) => sum + d.amount_paid, 0);
      const fees = monthDeals.reduce((sum, d) => sum + d.platform_fee, 0);
      const net = monthDeals.reduce((sum, d) => sum + (d.net_revenue ?? 0), 0);

      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMMM yyyy'),
        gross,
        fees,
        net,
        deals: monthDeals.length,
      };
    });
  }, [deals]);

  // Filter deals for selected month
  const selectedMonthDeals = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return deals.filter((deal) => {
      const paymentDate = parseISO(deal.date_payment);
      return paymentDate >= start && paymentDate <= end;
    });
  }, [deals, selectedMonth]);

  // Marketer tier distribution data for selected month
  const marketerTierData = useMemo(() => {
    // Group deals by marketer for the selected month
    const marketerMap = new Map<string, { email: string; netRevenue: number }>();
    
    selectedMonthDeals.forEach((deal) => {
      const email = deal.marketer_email ?? 'Unknown';
      const existing = marketerMap.get(email) || { email, netRevenue: 0 };
      existing.netRevenue += deal.net_revenue ?? 0;
      marketerMap.set(email, existing);
    });

    // Calculate tier for each marketer
    const tierColors = {
      1: 'hsl(var(--muted))',
      2: 'hsl(var(--primary))',
      3: 'hsl(var(--success))',
    };

    const tierLabels = {
      1: 'Tier 1 (0%)',
      2: 'Tier 2 (8%)',
      3: 'Tier 3 (12%)',
    };

    const tierRates = {
      1: '0%',
      2: '8%',
      3: '12%',
    };

    const data: MarketerTierData[] = [];
    
    marketerMap.forEach(({ email, netRevenue }) => {
      const { tier, commission } = calculateTieredCommission(netRevenue);
      data.push({
        marketer: email,
        netRevenue,
        tier,
        tierLabel: tierLabels[tier],
        commission,
        commissionRate: tierRates[tier],
        color: tierColors[tier],
      });
    });

    // Sort by net revenue descending
    return data.sort((a, b) => b.netRevenue - a.netRevenue);
  }, [selectedMonthDeals]);

  // Pie chart data for overall tier distribution
  const tierPieData = useMemo(() => {
    let tier1 = 0, tier2 = 0, tier3 = 0;
    
    marketerTierData.forEach(({ netRevenue }) => {
      if (netRevenue <= 1500) {
        tier1 += netRevenue;
      } else if (netRevenue <= 3000) {
        tier1 += 1500;
        tier2 += netRevenue - 1500;
      } else {
        tier1 += 1500;
        tier2 += 1500;
        tier3 += netRevenue - 3000;
      }
    });

    return [
      { name: 'Tier 1 (0%)', value: tier1, color: 'hsl(var(--muted))' },
      { name: 'Tier 2 (8%)', value: tier2, color: 'hsl(var(--primary))' },
      { name: 'Tier 3 (12%)', value: tier3, color: 'hsl(var(--success))' },
    ].filter(t => t.value > 0);
  }, [marketerTierData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{payload[0]?.payload?.fullMonth || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <div className="bento-card">
        <h3 className="text-lg font-display font-semibold mb-4">Revenue Trend (6 Months)</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="net" 
                name="Net Revenue"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorNet)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gross vs Fees */}
      <div className="bento-card">
        <h3 className="text-lg font-display font-semibold mb-4">Gross vs Platform Fees</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="gross" 
                name="Gross" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="fees" 
                name="Fees" 
                fill="hsl(var(--destructive))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier Distribution by Marketer */}
      <div className="bento-card lg:col-span-2">
        <h3 className="text-lg font-display font-semibold mb-4">
          Commission Tier Distribution by Marketer - {format(selectedMonth, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {tierPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #3a3a5c',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                  itemStyle={{
                    color: '#ffffff',
                  }}
                  labelStyle={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-2 max-h-[250px] overflow-y-auto">
            {marketerTierData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">{item.marketer}</span>
                    <span className="text-xs text-muted-foreground">{item.tierLabel}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-semibold block">{formatCurrency(item.netRevenue)}</span>
                  <span className="text-xs text-muted-foreground">Commission: {formatCurrency(item.commission)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
