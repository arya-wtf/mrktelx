import { Deal, CommissionTier } from '@/types/deal';

export const COMMISSION_TIERS: CommissionTier[] = [
  { tier: 1, label: 'Tier 1', rate: 0, threshold: 1500 },
  { tier: 2, label: 'Tier 2', rate: 0.08, threshold: 3000 },
  { tier: 3, label: 'Tier 3', rate: 0.12, threshold: Infinity },
];

export function calculateTieredCommission(netRevenue: number): {
  commission: number;
  tier: 1 | 2 | 3;
  breakdown: { tier: number; amount: number; rate: number }[];
} {
  const breakdown: { tier: number; amount: number; rate: number }[] = [];
  let commission = 0;
  let currentTier: 1 | 2 | 3 = 1;

  if (netRevenue <= 1500) {
    // Tier 1: 0%
    breakdown.push({ tier: 1, amount: netRevenue, rate: 0 });
    currentTier = 1;
  } else if (netRevenue <= 3000) {
    // Tier 1 portion + Tier 2 portion
    breakdown.push({ tier: 1, amount: 1500, rate: 0 });
    const tier2Amount = netRevenue - 1500;
    const tier2Commission = tier2Amount * 0.08;
    breakdown.push({ tier: 2, amount: tier2Amount, rate: 0.08 });
    commission = tier2Commission;
    currentTier = 2;
  } else {
    // All three tiers
    breakdown.push({ tier: 1, amount: 1500, rate: 0 });
    const tier2Amount = 1500; // $1,501 - $3,000
    const tier2Commission = tier2Amount * 0.08;
    breakdown.push({ tier: 2, amount: tier2Amount, rate: 0.08 });
    
    const tier3Amount = netRevenue - 3000;
    const tier3Commission = tier3Amount * 0.12;
    breakdown.push({ tier: 3, amount: tier3Amount, rate: 0.12 });
    
    commission = tier2Commission + tier3Commission;
    currentTier = 3;
  }

  return { commission, tier: currentTier, breakdown };
}

export function calculateRetainerMultiplier(month: number): number {
  if (month === 1) return 1.0;
  if (month === 2 || month === 3) return 0.5;
  return 0;
}

export function calculateDealCommission(deal: Deal): number {
  const { commission } = calculateTieredCommission(deal.netRevenue);
  
  // Project deals get full commission, retainer deals apply multiplier
  if (!deal.isRetainer) {
    return commission;
  }
  
  const multiplier = calculateRetainerMultiplier(deal.retainerMonth);
  return commission * multiplier;
}

export function getMonthlyNetRevenue(deals: Deal[], month: number, year: number): number {
  return deals
    .filter(deal => {
      const date = new Date(deal.datePayment);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .reduce((sum, deal) => sum + deal.netRevenue, 0);
}

export function getQuarterlyNetRevenue(deals: Deal[], quarter: number, year: number): number {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  
  return deals
    .filter(deal => {
      const date = new Date(deal.datePayment);
      const month = date.getMonth();
      return month >= startMonth && month <= endMonth && date.getFullYear() === year;
    })
    .reduce((sum, deal) => sum + deal.netRevenue, 0);
}

export function checkSafetyNet(deals: Deal[]): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  
  // Check last two quarters
  let belowThresholdCount = 0;
  
  for (let i = 0; i < 2; i++) {
    let quarter = currentQuarter - i;
    let year = currentYear;
    
    if (quarter <= 0) {
      quarter += 4;
      year -= 1;
    }
    
    const revenue = getQuarterlyNetRevenue(deals, quarter, year);
    const monthlyAvg = revenue / 3;
    
    if (monthlyAvg < 1500) {
      belowThresholdCount++;
    }
  }
  
  return belowThresholdCount >= 2;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}
