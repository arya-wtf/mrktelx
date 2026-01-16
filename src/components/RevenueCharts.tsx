import { useMemo } from 'react';
import { Deal } from '@/hooks/useDeals';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency } from '@/lib/commission';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface RevenueChartsProps {
  deals: Deal[];
}

export function RevenueCharts({ deals }: RevenueChartsProps) {
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

  // Tier distribution
  const tierData = useMemo(() => {
    let tier1 = 0, tier2 = 0, tier3 = 0;
    
    deals.forEach((deal) => {
      const net = deal.net_revenue ?? 0;
      if (net <= 1500) {
        tier1 += net;
      } else if (net <= 3000) {
        tier1 += 1500;
        tier2 += net - 1500;
      } else {
        tier1 += 1500;
        tier2 += 1500;
        tier3 += net - 3000;
      }
    });

    return [
      { name: 'Tier 1 (0%)', value: tier1, color: 'hsl(var(--muted))' },
      { name: 'Tier 2 (8%)', value: tier2, color: 'hsl(var(--primary))' },
      { name: 'Tier 3 (12%)', value: tier3, color: 'hsl(var(--success))' },
    ].filter(t => t.value > 0);
  }, [deals]);

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

      {/* Tier Distribution */}
      <div className="bento-card lg:col-span-2">
        <h3 className="text-lg font-display font-semibold mb-4">Commission Tier Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            {tierData.map((tier, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-sm font-medium">{tier.name}</span>
                </div>
                <span className="font-semibold">{formatCurrency(tier.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
