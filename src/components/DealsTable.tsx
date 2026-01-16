import { useState } from 'react';
import { useDealStore } from '@/store/dealStore';
import { Deal } from '@/types/deal';
import { formatCurrency, calculateDealCommission, calculateRetainerMultiplier } from '@/lib/commission';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface DealsTableProps {
  deals: Deal[];
  showActions?: boolean;
}

export function DealsTable({ deals, showActions = true }: DealsTableProps) {
  const { deleteDeal, userRole } = useDealStore();
  const isAdmin = userRole === 'admin';

  const getRetainerBadge = (month: number) => {
    const multiplier = calculateRetainerMultiplier(month);
    if (multiplier === 1) return <span className="tier-badge tier-3">100%</span>;
    if (multiplier === 0.5) return <span className="tier-badge tier-2">50%</span>;
    return <span className="tier-badge tier-1">0%</span>;
  };

  if (deals.length === 0) {
    return (
      <div className="bento-card text-center py-12">
        <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No deals found for this period</p>
      </div>
    );
  }

  return (
    <div className="bento-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Project</TableHead>
              <TableHead className="text-muted-foreground font-medium">Deal Date</TableHead>
              <TableHead className="text-muted-foreground font-medium">Payment Date</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Gross</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Fee</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Net</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Retainer</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Commission</TableHead>
              {isAdmin && showActions && (
                <TableHead className="text-muted-foreground font-medium text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => {
              const commission = calculateDealCommission(deal);
              return (
                <TableRow key={deal.id} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(deal.dateDeal), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(deal.datePayment), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(deal.amountPaid)}</TableCell>
                  <TableCell className="text-right text-destructive/80">
                    -{formatCurrency(deal.platformFee)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(deal.netRevenue)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getRetainerBadge(deal.retainerMonth)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-success">
                    {formatCurrency(commission)}
                  </TableCell>
                  {isAdmin && showActions && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteDeal(deal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
