import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Deal, Correction, UserRole } from '@/types/deal';

interface DealStore {
  deals: Deal[];
  corrections: Correction[];
  userRole: UserRole;
  phantomSharesStartDate: string;
  
  // Actions
  setUserRole: (role: UserRole) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'netRevenue' | 'createdAt'>) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  addCorrection: (correction: Omit<Correction, 'id'>) => void;
  deleteCorrection: (id: string) => void;
}

// Demo data
const demoDeals: Deal[] = [
  {
    id: '1',
    name: 'TechCorp Website Redesign',
    dateDeal: '2024-01-05',
    datePayment: '2024-01-15',
    estimateDateDone: '2024-02-28',
    amountPaid: 2500,
    platformFee: 250,
    netRevenue: 2250,
    retainerMonth: 1,
    createdAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '2',
    name: 'StartupXYZ Brand Campaign',
    dateDeal: '2024-01-12',
    datePayment: '2024-01-20',
    estimateDateDone: '2024-03-15',
    amountPaid: 4200,
    platformFee: 420,
    netRevenue: 3780,
    retainerMonth: 1,
    createdAt: '2024-01-12T14:30:00Z',
  },
  {
    id: '3',
    name: 'RetailMax SEO Package',
    dateDeal: '2024-02-01',
    datePayment: '2024-02-10',
    estimateDateDone: '2024-04-01',
    amountPaid: 1800,
    platformFee: 180,
    netRevenue: 1620,
    retainerMonth: 2,
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    id: '4',
    name: 'FinanceApp Social Media',
    dateDeal: '2024-02-15',
    datePayment: '2024-02-25',
    estimateDateDone: '2024-05-15',
    amountPaid: 3500,
    platformFee: 350,
    netRevenue: 3150,
    retainerMonth: 1,
    createdAt: '2024-02-15T11:00:00Z',
  },
  {
    id: '5',
    name: 'HealthPlus Content Strategy',
    dateDeal: '2024-03-01',
    datePayment: '2024-03-12',
    estimateDateDone: '2024-06-01',
    amountPaid: 5000,
    platformFee: 500,
    netRevenue: 4500,
    retainerMonth: 1,
    createdAt: '2024-03-01T16:00:00Z',
  },
];

export const useDealStore = create<DealStore>()(
  persist(
    (set) => ({
      deals: demoDeals,
      corrections: [],
      userRole: 'admin',
      phantomSharesStartDate: '2023-01-01',

      setUserRole: (role) => set({ userRole: role }),

      addDeal: (dealData) =>
        set((state) => ({
          deals: [
            ...state.deals,
            {
              ...dealData,
              id: crypto.randomUUID(),
              netRevenue: dealData.amountPaid - dealData.platformFee,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateDeal: (id, updates) =>
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === id
              ? {
                  ...deal,
                  ...updates,
                  netRevenue:
                    (updates.amountPaid ?? deal.amountPaid) -
                    (updates.platformFee ?? deal.platformFee),
                }
              : deal
          ),
        })),

      deleteDeal: (id) =>
        set((state) => ({
          deals: state.deals.filter((deal) => deal.id !== id),
        })),

      addCorrection: (correctionData) =>
        set((state) => ({
          corrections: [
            ...state.corrections,
            {
              ...correctionData,
              id: crypto.randomUUID(),
            },
          ],
        })),

      deleteCorrection: (id) =>
        set((state) => ({
          corrections: state.corrections.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'elux-space-deals',
    }
  )
);
