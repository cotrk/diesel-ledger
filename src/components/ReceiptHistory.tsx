import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2, Search, Filter, Star, X } from 'lucide-react';
import { Receipt, LOCATIONS } from '@/types/diesel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { currentIowaAverage } from '@/lib/sampleData';
import { toast } from 'sonner';

interface ReceiptHistoryProps {
  receipts: Receipt[];
  onUpdate: (id: string, updates: Partial<Receipt>) => void;
  onDelete: (id: string) => void;
  bestDealId?: string;
  worstDealId?: string;
}

export function ReceiptHistory({ receipts, onUpdate, onDelete, bestDealId, worstDealId }: ReceiptHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editGallons, setEditGallons] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [editOdometer, setEditOdometer] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const matchesSearch = searchQuery === '' || 
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === 'all' || r.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [receipts, searchQuery, locationFilter]);

  // Group by month for subtotals
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, { receipts: Receipt[]; totalGallons: number; totalCost: number; avgPrice: number }> = {};
    
    filteredReceipts.forEach(r => {
      const month = r.date.substring(0, 7);
      if (!groups[month]) {
        groups[month] = { receipts: [], totalGallons: 0, totalCost: 0, avgPrice: 0 };
      }
      groups[month].receipts.push(r);
      groups[month].totalGallons += r.gallons;
      groups[month].totalCost += r.total;
    });

    Object.keys(groups).forEach(month => {
      const g = groups[month];
      g.avgPrice = g.receipts.reduce((sum, r) => sum + r.pricePerGallon, 0) / g.receipts.length;
    });

    return groups;
  }, [filteredReceipts]);

  const getRowClass = (price: number) => {
    const diff = price - currentIowaAverage;
    if (diff <= -0.05) return 'row-good';
    if (diff >= 0.05) return 'row-bad';
    return 'row-neutral';
  };

  const openEditDialog = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setEditDate(receipt.date);
    setEditLocation(receipt.location);
    setEditGallons(receipt.gallons.toString());
    setEditPrice(receipt.pricePerGallon.toString());
    setEditTotal(receipt.total.toString());
    setEditOdometer(receipt.odometer?.toString() || '');
    setEditNotes(receipt.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingReceipt) return;
    
    onUpdate(editingReceipt.id, {
      date: editDate,
      location: editLocation,
      gallons: parseFloat(editGallons),
      pricePerGallon: parseFloat(editPrice),
      total: parseFloat(editTotal),
      odometer: editOdometer ? parseInt(editOdometer) : undefined,
      notes: editNotes || undefined
    });
    
    setEditingReceipt(null);
    toast.success('Receipt updated!');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
    toast.success('Receipt deleted');
  };

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy');
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Receipt History</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border z-50">
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold text-right">Gallons</TableHead>
              <TableHead className="font-semibold text-right">Price/Gal</TableHead>
              <TableHead className="font-semibold text-right">Total</TableHead>
              <TableHead className="font-semibold text-right hidden md:table-cell">Odometer</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Notes</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(monthlyGroups).map(([month, group]) => (
              <>
                {group.receipts.map((receipt) => (
                  <TableRow 
                    key={receipt.id} 
                    className={`${getRowClass(receipt.pricePerGallon)} transition-colors`}
                  >
                    <TableCell className="font-medium">
                      {format(parseISO(receipt.date), 'MMM d')}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {receipt.location}
                      {receipt.id === bestDealId && <Star className="h-4 w-4 text-accent fill-accent" />}
                      {receipt.id === worstDealId && <X className="h-4 w-4 text-destructive" />}
                    </TableCell>
                    <TableCell className="text-right font-mono">{receipt.gallons}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      ${receipt.pricePerGallon.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">${receipt.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono hidden md:table-cell">
                      {receipt.odometer?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell max-w-[150px] truncate">
                      {receipt.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditDialog(receipt)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDeleteConfirm(receipt.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Monthly Subtotal Row */}
                <TableRow className="bg-primary/5 font-semibold border-t-2 border-primary/20">
                  <TableCell colSpan={2} className="text-primary">
                    {formatMonthLabel(month)} Subtotal
                  </TableCell>
                  <TableCell className="text-right font-mono">{group.totalGallons.toFixed(1)} gal</TableCell>
                  <TableCell className="text-right font-mono">${group.avgPrice.toFixed(2)}/gal</TableCell>
                  <TableCell className="text-right font-mono">${group.totalCost.toFixed(2)}</TableCell>
                  <TableCell colSpan={3} className="hidden md:table-cell" />
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredReceipts.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No receipts found. Start logging your fuel purchases!
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingReceipt} onOpenChange={() => setEditingReceipt(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={editLocation} onValueChange={setEditLocation}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border z-50">
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Gallons</Label>
                <Input type="number" step="0.1" value={editGallons} onChange={(e) => setEditGallons(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Price/Gal</Label>
                <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input type="number" step="0.01" value={editTotal} onChange={(e) => setEditTotal(e.target.value)} className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Odometer</Label>
                <Input type="number" value={editOdometer} onChange={(e) => setEditOdometer(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReceipt(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="btn-primary">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Delete Receipt?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">This action cannot be undone. Are you sure you want to delete this receipt?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
