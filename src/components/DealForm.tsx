import { useState } from 'react';
import { useAddDeal } from '@/hooks/useDeals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DealFormProps {
  onClose: () => void;
}

export function DealForm({ onClose }: DealFormProps) {
  const addDeal = useAddDeal();
  const [formData, setFormData] = useState({
    name: '',
    date_deal: '',
    date_payment: '',
    estimate_date_done: '',
    amount_paid: '',
    platform_fee: '',
    is_retainer: false,
    retainer_month: '1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addDeal.mutateAsync({
        name: formData.name,
        date_deal: formData.date_deal,
        date_payment: formData.date_payment,
        estimate_date_done: formData.estimate_date_done,
        amount_paid: parseFloat(formData.amount_paid),
        platform_fee: parseFloat(formData.platform_fee),
        is_retainer: formData.is_retainer,
        retainer_month: formData.is_retainer ? parseInt(formData.retainer_month) : 1,
      });
      toast.success('Deal added successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to add deal');
    }
  };

  const netRevenue = formData.amount_paid && formData.platform_fee
    ? parseFloat(formData.amount_paid) - parseFloat(formData.platform_fee)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bento-card w-full max-w-lg mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold">Add New Deal</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Client / Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input mt-1"
              placeholder="e.g., TechCorp Rebranding"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_deal">Date Deal Signed</Label>
              <Input
                id="date_deal"
                type="date"
                value={formData.date_deal}
                onChange={(e) => setFormData({ ...formData, date_deal: e.target.value })}
                className="glass-input mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="date_payment">Date Payment Received</Label>
              <Input
                id="date_payment"
                type="date"
                value={formData.date_payment}
                onChange={(e) => setFormData({ ...formData, date_payment: e.target.value })}
                className="glass-input mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimate_date_done">Estimated Completion Date</Label>
            <Input
              id="estimate_date_done"
              type="date"
              value={formData.estimate_date_done}
              onChange={(e) => setFormData({ ...formData, estimate_date_done: e.target.value })}
              className="glass-input mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount_paid">Amount Paid (Gross)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount_paid"
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  className="glass-input pl-7"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="platform_fee">Platform Fee</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="platform_fee"
                  type="number"
                  value={formData.platform_fee}
                  onChange={(e) => setFormData({ ...formData, platform_fee: e.target.value })}
                  className="glass-input pl-7"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {netRevenue > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="text-2xl font-display font-bold stat-value">
                ${netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div>
              <Label htmlFor="is_retainer" className="text-base font-medium">Retainer Deal</Label>
              <p className="text-sm text-muted-foreground">Enable for recurring retainer clients</p>
            </div>
            <Switch
              id="is_retainer"
              checked={formData.is_retainer}
              onCheckedChange={(checked) => setFormData({ ...formData, is_retainer: checked })}
            />
          </div>

          {formData.is_retainer && (
            <div>
              <Label htmlFor="retainer_month">Retainer Month</Label>
              <Select
                value={formData.retainer_month}
                onValueChange={(value) => setFormData({ ...formData, retainer_month: value })}
              >
                <SelectTrigger className="glass-input mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Month 1 (100% commission)</SelectItem>
                  <SelectItem value="2">Month 2 (50% commission)</SelectItem>
                  <SelectItem value="3">Month 3 (50% commission)</SelectItem>
                  <SelectItem value="4">Month 4+ (0% commission)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={addDeal.isPending}>
              {addDeal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Deal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
