import { useState } from 'react';
import { useDealStore } from '@/store/dealStore';
import { formatCurrency } from '@/lib/commission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function CorrectionLog() {
  const { corrections, deals, addCorrection, deleteCorrection, userRole } = useDealStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    dealId: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  const isAdmin = userRole === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deal = deals.find(d => d.id === formData.dealId);
    if (!deal) return;

    addCorrection({
      dealId: formData.dealId,
      dealName: deal.name,
      amount: parseFloat(formData.amount),
      reason: formData.reason,
      date: formData.date,
    });

    setFormData({
      dealId: '',
      amount: '',
      reason: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAdding(false);
  };

  const totalClawback = corrections.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold">Correction Log</h3>
            <p className="text-xs text-muted-foreground">Clawbacks & Adjustments</p>
          </div>
        </div>
        {isAdmin && !isAdding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && isAdmin && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="grid gap-3">
            <div>
              <Label>Select Deal</Label>
              <Select
                value={formData.dealId}
                onValueChange={(value) => setFormData({ ...formData, dealId: value })}
              >
                <SelectTrigger className="glass-input mt-1">
                  <SelectValue placeholder="Select a deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="glass-input pl-7"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="glass-input mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="glass-input mt-1"
                placeholder="e.g., Project refund"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">Add Correction</Button>
            </div>
          </div>
        </form>
      )}

      {/* Corrections List */}
      {corrections.length > 0 ? (
        <div className="space-y-2">
          {corrections.map((correction) => (
            <div
              key={correction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
            >
              <div>
                <p className="font-medium text-sm">{correction.dealName}</p>
                <p className="text-xs text-muted-foreground">
                  {correction.reason} • {format(new Date(correction.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-destructive font-semibold">
                  -{formatCurrency(correction.amount)}
                </span>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteCorrection(correction.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-3 mt-3 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Clawback</span>
              <span className="text-lg font-display font-bold text-destructive">
                -{formatCurrency(totalClawback)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">
          No corrections recorded
        </p>
      )}
    </div>
  );
}
