import { useState } from 'react';
import { format } from 'date-fns';
import { useAddDeal } from '@/hooks/useDeals';
import { useAllUsersWithRoles } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, Loader2, User, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DealFormProps {
  onClose: () => void;
  isAdmin: boolean;
}

export function DealForm({ onClose, isAdmin }: DealFormProps) {
  const addDeal = useAddDeal();
  const { user } = useAuth();
  const { data: allUsers, isLoading: usersLoading } = useAllUsersWithRoles();
  
  // Filter to only show marketers for assignment
  const marketers = allUsers?.filter(u => u.role === 'marketer') ?? [];
  
  const [formData, setFormData] = useState({
    name: '',
    date_deal: undefined as Date | undefined,
    date_payment: undefined as Date | undefined,
    estimate_date_done: undefined as Date | undefined,
    amount_paid: '',
    platform_fee: '',
    is_retainer: false,
    retainer_month: '1',
    assigned_user_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    if (!formData.date_deal || !formData.date_payment || !formData.estimate_date_done) {
      toast.error('Please select all dates');
      return;
    }
    
    // Determine which user_id to use
    const targetUserId = isAdmin && formData.assigned_user_id 
      ? formData.assigned_user_id 
      : user?.id;
    
    if (!targetUserId) {
      toast.error('No user selected');
      return;
    }
    
    try {
      await addDeal.mutateAsync({
        name: formData.name,
        date_deal: format(formData.date_deal, 'yyyy-MM-dd'),
        date_payment: format(formData.date_payment, 'yyyy-MM-dd'),
        estimate_date_done: format(formData.estimate_date_done, 'yyyy-MM-dd'),
        amount_paid: parseFloat(formData.amount_paid),
        platform_fee: parseFloat(formData.platform_fee),
        is_retainer: formData.is_retainer,
        retainer_month: formData.is_retainer ? parseInt(formData.retainer_month) : 1,
        user_id: targetUserId,
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
      <div className="bento-card w-full max-w-lg mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
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
          {isAdmin && (
            <div>
              <Label htmlFor="assigned_user">Assign to Marketer</Label>
              <Select
                value={formData.assigned_user_id}
                onValueChange={(value) => setFormData({ ...formData, assigned_user_id: value })}
              >
                <SelectTrigger className="glass-input mt-1">
                  <SelectValue placeholder={usersLoading ? "Loading..." : "Select a marketer"} />
                </SelectTrigger>
                <SelectContent>
                  {marketers.length === 0 && !usersLoading ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No marketers available</div>
                  ) : (
                    marketers.map((marketer) => (
                      <SelectItem key={marketer.user_id} value={marketer.user_id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {marketer.email}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Select the marketer who brought this deal</p>
            </div>
          )}
          
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
              <Label>Date Deal Signed</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-input mt-1",
                      !formData.date_deal && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_deal ? format(formData.date_deal, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_deal}
                    onSelect={(date) => setFormData({ ...formData, date_deal: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Date Payment Received</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-input mt-1",
                      !formData.date_payment && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_payment ? format(formData.date_payment, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_payment}
                    onSelect={(date) => setFormData({ ...formData, date_payment: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Estimated Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal glass-input mt-1",
                    !formData.estimate_date_done && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.estimate_date_done ? format(formData.estimate_date_done, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.estimate_date_done}
                  onSelect={(date) => setFormData({ ...formData, estimate_date_done: date })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
