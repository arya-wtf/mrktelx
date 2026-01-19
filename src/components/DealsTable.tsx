import { useState } from 'react';
import { Deal, useUpdateDeal, useDeleteDeal } from '@/hooks/useDeals';
import { formatCurrency } from '@/lib/commission';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit2, Check, X, DollarSign, Loader2, Briefcase, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DealsTableProps {
  deals: Deal[];
  isAdmin: boolean;
}

export function DealsTable({ deals, isAdmin }: DealsTableProps) {
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Deal>>({});

  const startEditing = (deal: Deal) => {
    setEditingId(deal.id);
    setEditData({
      name: deal.name,
      amount_paid: deal.amount_paid,
      platform_fee: deal.platform_fee,
      is_retainer: deal.is_retainer,
      retainer_month: deal.retainer_month,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDeal.mutateAsync({
        id,
        ...editData,
      });
      toast.success('Deal updated');
      setEditingId(null);
      setEditData({});
    } catch (error) {
      toast.error('Failed to update deal');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeal.mutateAsync(id);
      toast.success('Deal deleted');
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const getDealTypeBadge = (deal: Deal) => {
    if (deal.is_retainer) {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
            <RefreshCw className="w-3 h-3" />
            Retainer
          </span>
          <span className="tier-badge tier-2">M{deal.retainer_month > 3 ? '4+' : deal.retainer_month}</span>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
        <Briefcase className="w-3 h-3" />
        Project
      </span>
    );
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
              {isAdmin && (
                <TableHead className="text-muted-foreground font-medium">Marketer</TableHead>
              )}
              <TableHead className="text-muted-foreground font-medium">Payment Date</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Gross</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Fee</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Net</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Type</TableHead>
              
              {isAdmin && (
                <TableHead className="text-muted-foreground font-medium text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => {
              const isEditing = editingId === deal.id;
              
              return (
                <TableRow key={deal.id} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="font-medium">
                    {isEditing ? (
                      <Input
                        value={editData.name ?? ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="h-8 glass-input"
                      />
                    ) : (
                      deal.name
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-muted-foreground text-sm">
                      {deal.marketer_email ?? 'Unknown'}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {format(new Date(deal.date_payment), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.amount_paid ?? ''}
                        onChange={(e) => setEditData({ ...editData, amount_paid: parseFloat(e.target.value) })}
                        className="h-8 w-24 glass-input text-right"
                        step="0.01"
                      />
                    ) : (
                      formatCurrency(deal.amount_paid)
                    )}
                  </TableCell>
                  <TableCell className="text-right text-destructive/80">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.platform_fee ?? ''}
                        onChange={(e) => setEditData({ ...editData, platform_fee: parseFloat(e.target.value) })}
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
                  <TableCell className="text-center">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Retainer</span>
                          <Switch
                            checked={editData.is_retainer ?? false}
                            onCheckedChange={(checked) => setEditData({ ...editData, is_retainer: checked })}
                          />
                        </div>
                        {editData.is_retainer && (
                          <Select
                            value={String(editData.retainer_month ?? 1)}
                            onValueChange={(value) => setEditData({ ...editData, retainer_month: parseInt(value) })}
                          >
                            <SelectTrigger className="h-8 w-20 glass-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">M1</SelectItem>
                              <SelectItem value="2">M2</SelectItem>
                              <SelectItem value="3">M3</SelectItem>
                              <SelectItem value="4">M4+</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ) : (
                      getDealTypeBadge(deal)
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                              onClick={() => saveEdit(deal.id)}
                              disabled={updateDeal.isPending}
                            >
                              {updateDeal.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={cancelEditing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => startEditing(deal)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(deal.id)}
                              disabled={deleteDeal.isPending}
                            >
                              {deleteDeal.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
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
