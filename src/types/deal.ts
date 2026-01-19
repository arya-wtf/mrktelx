export interface Deal {
  id: string;
  name: string;
  dateDeal: string;
  datePayment: string;
  estimateDateDone: string;
  amountPaid: number;
  platformFee: number;
  netRevenue: number;
  isRetainer: boolean; // true = retainer deal, false = project deal
  retainerMonth: number; // 1, 2, 3, or 4+ (only applies when isRetainer = true)
  createdAt: string;
}

export interface Correction {
  id: string;
  dealId: string;
  dealName: string;
  amount: number;
  reason: string;
  date: string;
}

export interface CommissionTier {
  tier: 1 | 2 | 3;
  label: string;
  rate: number;
  threshold: number;
}

export type UserRole = 'admin' | 'marketer';

export interface QuarterlySummary {
  quarter: string;
  netRevenue: number;
  commission: number;
  dealCount: number;
}
