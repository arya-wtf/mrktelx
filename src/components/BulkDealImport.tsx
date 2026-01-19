import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { useAddDeal } from '@/hooks/useDeals';
import { useAllUsersWithRoles } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Upload, Download, Loader2, User, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BulkDealImportProps {
  onClose: () => void;
  isAdmin: boolean;
}

interface ParsedDeal {
  name: string;
  date_deal: string;
  date_payment: string;
  estimate_date_done: string;
  amount_paid: number;
  platform_fee: number;
  is_retainer: boolean;
  retainer_month: number;
  status?: 'pending' | 'success' | 'error';
  error?: string;
}

export function BulkDealImport({ onClose, isAdmin }: BulkDealImportProps) {
  const addDeal = useAddDeal();
  const { user } = useAuth();
  const { data: allUsers, isLoading: usersLoading } = useAllUsersWithRoles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const marketers = allUsers?.filter(u => u.role === 'marketer') ?? [];
  
  const [parsedDeals, setParsedDeals] = useState<ParsedDeal[]>([]);
  const [assignedUserId, setAssignedUserId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const parseCSV = (text: string): ParsedDeal[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const deals: ParsedDeal[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 6) continue;
      
      const deal: ParsedDeal = {
        name: values[headers.indexOf('name')] || '',
        date_deal: values[headers.indexOf('date_deal')] || '',
        date_payment: values[headers.indexOf('date_payment')] || '',
        estimate_date_done: values[headers.indexOf('estimate_date_done')] || '',
        amount_paid: parseFloat(values[headers.indexOf('amount_paid')]) || 0,
        platform_fee: parseFloat(values[headers.indexOf('platform_fee')]) || 0,
        is_retainer: values[headers.indexOf('is_retainer')]?.toLowerCase() === 'true',
        retainer_month: parseInt(values[headers.indexOf('retainer_month')]) || 1,
        status: 'pending',
      };
      
      if (deal.name && deal.date_deal && deal.date_payment) {
        deals.push(deal);
      }
    }
    
    return deals;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const deals = parseCSV(text);
      setParsedDeals(deals);
      if (deals.length === 0) {
        toast.error('No valid deals found in file');
      } else {
        toast.success(`Found ${deals.length} deals to import`);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const targetUserId = isAdmin && assignedUserId ? assignedUserId : user?.id;
    
    if (!targetUserId) {
      toast.error('No user selected');
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    
    const updatedDeals = [...parsedDeals];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < updatedDeals.length; i++) {
      const deal = updatedDeals[i];
      try {
        await addDeal.mutateAsync({
          name: deal.name,
          date_deal: deal.date_deal,
          date_payment: deal.date_payment,
          estimate_date_done: deal.estimate_date_done,
          amount_paid: deal.amount_paid,
          platform_fee: deal.platform_fee,
          is_retainer: deal.is_retainer,
          retainer_month: deal.is_retainer ? deal.retainer_month : 1,
          user_id: targetUserId,
        });
        updatedDeals[i] = { ...deal, status: 'success' };
        successCount++;
      } catch (error) {
        updatedDeals[i] = { ...deal, status: 'error', error: 'Failed to import' };
        errorCount++;
      }
      
      setParsedDeals([...updatedDeals]);
      setImportProgress(((i + 1) / updatedDeals.length) * 100);
    }
    
    setIsImporting(false);
    
    if (errorCount === 0) {
      toast.success(`Successfully imported ${successCount} deals`);
      setTimeout(() => onClose(), 1500);
    } else {
      toast.warning(`Imported ${successCount} deals, ${errorCount} failed`);
    }
  };

  const formatCurrency = (value: number) => 
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bento-card w-full max-w-4xl mx-4 animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold">Bulk Import Deals</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Download Sample */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex-1">
              <p className="font-medium">Download Sample CSV</p>
              <p className="text-sm text-muted-foreground">
                Use this template to format your deals data correctly
              </p>
            </div>
            <a href="/sample-deals.csv" download>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </a>
          </div>

          {/* File Upload */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload CSV File
            </Button>
            
            {isAdmin && (
              <div className="flex-1">
                <Select
                  value={assignedUserId}
                  onValueChange={setAssignedUserId}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder={usersLoading ? "Loading..." : "Assign to marketer (optional)"} />
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
              </div>
            )}
          </div>

          {/* Preview Table */}
          {parsedDeals.length > 0 && (
            <div className="flex-1 overflow-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium w-10">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Deal Date</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Payment Date</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">Gross</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">Fee</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedDeals.map((deal, index) => (
                    <TableRow key={index} className="border-border/30 hover:bg-secondary/30">
                      <TableCell>
                        {deal.status === 'pending' && (
                          <div className="w-4 h-4 rounded-full bg-muted" />
                        )}
                        {deal.status === 'success' && (
                          <Check className="w-4 h-4 text-success" />
                        )}
                        {deal.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{deal.name}</TableCell>
                      <TableCell className="text-muted-foreground">{deal.date_deal}</TableCell>
                      <TableCell className="text-muted-foreground">{deal.date_payment}</TableCell>
                      <TableCell className="text-right">{formatCurrency(deal.amount_paid)}</TableCell>
                      <TableCell className="text-right text-destructive/80">-{formatCurrency(deal.platform_fee)}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          deal.is_retainer 
                            ? "bg-blue-500/20 text-blue-400" 
                            : "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {deal.is_retainer ? `Retainer M${deal.retainer_month}` : 'Project'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Progress Bar */}
          {isImporting && (
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              className="flex-1 gap-2" 
              disabled={parsedDeals.length === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing... ({Math.round(importProgress)}%)
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {parsedDeals.length} Deals
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
