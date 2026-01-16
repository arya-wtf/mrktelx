import { useState } from 'react';
import { useDealStore } from '@/store/dealStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface DealFormProps {
  onClose: () => void;
}

export function DealForm({ onClose }: DealFormProps) {
  const { addDeal } = useDealStore();
  const [formData, setFormData] = useState({
    name: '',
    dateDeal: '',
    datePayment: '',
    estimateDateDone: '',
    amountPaid: '',
    platformFee: '',
    retainerMonth: '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addDeal({
      name: formData.name,
      dateDeal: formData.dateDeal,
      datePayment: formData.datePayment,
      estimateDateDone: formData.estimateDateDone,
      amountPaid: parseFloat(formData.amountPaid),
      platformFee: parseFloat(formData.platformFee),
      retainerMonth: parseInt(formData.retainerMonth),
    });

    onClose();
  };

  const netRevenue = formData.amountPaid && formData.platformFee
    ? parseFloat(formData.amountPaid) - parseFloat(formData.platformFee)
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
              <Label htmlFor="dateDeal">Date Deal Signed</Label>
              <Input
                id="dateDeal"
                type="date"
                value={formData.dateDeal}
                onChange={(e) => setFormData({ ...formData, dateDeal: e.target.value })}
                className="glass-input mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="datePayment">Date Payment Received</Label>
              <Input
                id="datePayment"
                type="date"
                value={formData.datePayment}
                onChange={(e) => setFormData({ ...formData, datePayment: e.target.value })}
                className="glass-input mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimateDateDone">Estimated Completion Date</Label>
            <Input
              id="estimateDateDone"
              type="date"
              value={formData.estimateDateDone}
              onChange={(e) => setFormData({ ...formData, estimateDateDone: e.target.value })}
              className="glass-input mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amountPaid">Amount Paid (Gross)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amountPaid"
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="glass-input pl-7"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="platformFee">Platform Fee</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="platformFee"
                  type="number"
                  value={formData.platformFee}
                  onChange={(e) => setFormData({ ...formData, platformFee: e.target.value })}
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

          <div>
            <Label htmlFor="retainerMonth">Retainer Month</Label>
            <Select
              value={formData.retainerMonth}
              onValueChange={(value) => setFormData({ ...formData, retainerMonth: value })}
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Add Deal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
