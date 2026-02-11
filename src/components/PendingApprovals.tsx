import { useState } from 'react';
import { Deal, usePendingDeals, useApproveDeal, useRejectDeal, useMarketers } from '@/hooks/useDeals';
import { formatCurrency } from '@/lib/commission';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X, Edit2, Loader2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function PendingApprovals() {
  const { data: pendingDeals = [], isLoading } = usePendingDeals();
  const approveDeal = useApproveDeal();
  const rejectDeal = useRejectDeal();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [revisingId, setRevisingId] = useState<string | null>(null);
  const [reviseData, setReviseData] = useState<{
    amount_paid?: number;
    platform_fee?: number;
    is_retainer?: boolean;
    retainer_month?: number;
    admin_notes?: string;
  }>({});

  const handleApprove = async (id: string) => {
    try {
      await approveDeal.mutateAsync({ id });
      toast.success('Deal approved');
    } catch {
      toast.error('Failed to approve deal');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectDeal.mutateAsync({ id, admin_notes: rejectNotes });
      toast.success('Deal rejected');
      setRejectingId(null);
      setRejectNotes('');
    } catch {
      toast.error('Failed to reject deal');
    }
  };

  const startRevising = (deal: Deal) => {
    setRevisingId(deal.id);
    setReviseData({
      amount_paid: deal.amount_paid,
      platform_fee: deal.platform_fee,
      is_retainer: deal.is_retainer,
      retainer_month: deal.retainer_month,
      admin_notes: '',
    });
  };

  const handleReviseAndApprove = async (id: string) => {
    try {
      const { admin_notes, ...updates } = reviseData;
      await approveDeal.mutateAsync({ id, admin_notes: admin_notes || 'Revised by admin', updates });
      toast.success('Deal revised and approved');
      setRevisingId(null);
      setReviseData({});
    } catch {
      toast.error('Failed to revise deal');
    }
  };

  if (isLoading) {
    return (
      <div className="bento-card flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pendingDeals.length === 0) {
    return (
      <div className="bento-card text-center py-12">
        <Check className="w-12 h-12 mx-auto text-green-500/50 mb-4" />
        <p className="text-muted-foreground">No pending deals to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-display font-semibold">
          Pending Approvals ({pendingDeals.length})
        </h3>
      </div>

      <div className="bento-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Project</TableHead>
                <TableHead className="text-muted-foreground font-medium">Marketer</TableHead>
                <TableHead className="text-muted-foreground font-medium">Payment Date</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Gross</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Fee</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Net</TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDeals.map((deal) => (
                <TableRow key={deal.id} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {deal.marketer_email ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(deal.date_payment), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    {revisingId === deal.id ? (
                      <Input
                        type="number"
                        value={reviseData.amount_paid ?? ''}
                        onChange={(e) => setReviseData({ ...reviseData, amount_paid: parseFloat(e.target.value) })}
                        className="h-8 w-24 glass-input text-right"
                        step="0.01"
                      />
                    ) : (
                      formatCurrency(deal.amount_paid)
                    )}
                  </TableCell>
                  <TableCell className="text-right text-destructive/80">
                    {revisingId === deal.id ? (
                      <Input
                        type="number"
                        value={reviseData.platform_fee ?? ''}
                        onChange={(e) => setReviseData({ ...reviseData, platform_fee: parseFloat(e.target.value) })}
                        className="h-8 w-24 glass-input text-right"
                        step="0.01"
                      />
                    ) : (
                      <>-{formatCurrency(deal.platform_fee)}</>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(deal.net_revenue ?? 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-2">
                      {rejectingId === deal.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <Textarea
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="glass-input text-sm h-16"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(deal.id)}
                              disabled={rejectDeal.isPending}
                              className="flex-1"
                            >
                              {rejectDeal.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reject'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setRejectingId(null); setRejectNotes(''); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : revisingId === deal.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <Input
                            value={reviseData.admin_notes ?? ''}
                            onChange={(e) => setReviseData({ ...reviseData, admin_notes: e.target.value })}
                            placeholder="Revision notes (optional)"
                            className="glass-input text-sm h-8"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleReviseAndApprove(deal.id)}
                              disabled={approveDeal.isPending}
                              className="flex-1 gap-1"
                            >
                              {approveDeal.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Approve</>}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setRevisingId(null); setReviseData({}); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-500 hover:text-green-500 hover:bg-green-500/10"
                            onClick={() => handleApprove(deal.id)}
                            disabled={approveDeal.isPending}
                            title="Approve"
                          >
                            {approveDeal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => startRevising(deal)}
                            title="Revise & Approve"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setRejectingId(deal.id)}
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
