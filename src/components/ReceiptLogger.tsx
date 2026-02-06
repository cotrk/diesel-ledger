import { useState, useCallback } from 'react';
import { Camera, Edit3, Zap, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, LOCATIONS } from '@/types/diesel';
import { toast } from 'sonner';

interface ReceiptLoggerProps {
  onAddReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>) => void;
  avgPrice: number;
}

export function ReceiptLogger({ onAddReceipt, avgPrice }: ReceiptLoggerProps) {
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual entry state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [gallons, setGallons] = useState('');
  const [pricePerGallon, setPricePerGallon] = useState('');
  const [total, setTotal] = useState('');
  const [odometer, setOdometer] = useState('');
  const [notes, setNotes] = useState('');
  
  // Photo upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    date?: string;
    amount?: string;
    location?: string;
    gallons?: string;
    confidence: { date: number; amount: number; location: number };
  } | null>(null);

  // Quick entry state
  const [quickText, setQuickText] = useState('');

  // Auto-calculate total or price per gallon
  const handleGallonsChange = (val: string) => {
    setGallons(val);
    if (val && pricePerGallon) {
      setTotal((parseFloat(val) * parseFloat(pricePerGallon)).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerGallon(val);
    if (val && gallons) {
      setTotal((parseFloat(gallons) * parseFloat(val)).toFixed(2));
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    if (val && gallons) {
      setPricePerGallon((parseFloat(val) / parseFloat(gallons)).toFixed(2));
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setGallons('');
    setPricePerGallon('');
    setTotal('');
    setOdometer('');
    setNotes('');
    setScanResult(null);
    setQuickText('');
  };

  const handleSubmit = useCallback(() => {
    if (!date || !location || !gallons || !pricePerGallon || !total) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAddReceipt({
      date,
      location,
      gallons: parseFloat(gallons),
      pricePerGallon: parseFloat(pricePerGallon),
      total: parseFloat(total),
      odometer: odometer ? parseInt(odometer) : undefined,
      notes: notes || undefined
    });

    toast.success('Receipt logged!', {
      icon: <CheckCircle className="h-5 w-5 text-success" />
    });
    resetForm();
  }, [date, location, gallons, pricePerGallon, total, odometer, notes, onAddReceipt]);

  // Simulate photo upload and OCR
  const handlePhotoUpload = useCallback(() => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Simulate OCR result
          setScanResult({
            date: new Date().toISOString().split('T')[0],
            amount: '82.94',
            location: 'Adair Fuel',
            gallons: '28.5',
            confidence: { date: 99, amount: 98, location: 72 }
          });
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  }, []);

  const applyScanResult = () => {
    if (scanResult) {
      if (scanResult.date) setDate(scanResult.date);
      if (scanResult.location) setLocation(scanResult.location);
      if (scanResult.gallons) setGallons(scanResult.gallons);
      if (scanResult.amount) {
        setTotal(scanResult.amount);
        if (scanResult.gallons) {
          setPricePerGallon((parseFloat(scanResult.amount) / parseFloat(scanResult.gallons)).toFixed(2));
        }
      }
      setActiveTab('manual');
      toast.success('Scan data applied! Review and confirm.');
    }
  };

  // Parse quick entry text
  const parseQuickEntry = () => {
    const text = quickText.toLowerCase();
    
    // Try to extract gallons
    const gallonMatch = text.match(/(\d+\.?\d*)\s*(gal|gallons?)/i);
    if (gallonMatch) setGallons(gallonMatch[1]);
    
    // Try to extract price
    const priceMatch = text.match(/\$?(\d+\.?\d*)\s*\/?\s*(gal|per)/i);
    if (priceMatch) setPricePerGallon(priceMatch[1]);
    
    // Try to extract total
    const totalMatch = text.match(/\$(\d+\.?\d*)/);
    if (totalMatch && !priceMatch) setTotal(totalMatch[1]);
    
    // Try to extract location
    for (const loc of LOCATIONS) {
      if (text.includes(loc.toLowerCase())) {
        setLocation(loc);
        break;
      }
    }
    
    setDate(new Date().toISOString().split('T')[0]);
    setActiveTab('manual');
    toast.success('Parsed! Review and confirm your entry.');
  };

  return (
    <div className="card-elevated p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Log Receipt</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Photo</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Quick</span>
          </TabsTrigger>
        </TabsList>

        {/* Photo Upload Tab */}
        <TabsContent value="photo" className="space-y-4">
          {!scanResult ? (
            <div
              onClick={handlePhotoUpload}
              className="relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary/30 p-8 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Scanning receipt... {uploadProgress}% complete
                  </p>
                  <div className="w-full max-w-xs h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload Receipt Photo</p>
                    <p className="text-sm text-muted-foreground">Drag & drop or click to select</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-success/10 border border-success/30 p-4">
                <h3 className="font-medium text-success flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  Scan Complete
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Date: {scanResult.date}</span>
                    <span className="text-success">✓ {scanResult.confidence.date}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Amount: ${scanResult.amount}</span>
                    <span className="text-success">✓ {scanResult.confidence.amount}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location: {scanResult.location}</span>
                    <span className={scanResult.confidence.location >= 90 ? 'text-success' : 'text-warning'}>
                      {scanResult.confidence.location >= 90 ? '✓' : '⚠'} {scanResult.confidence.location}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gallons: {scanResult.gallons}</span>
                    <span className="text-success">✓ 97%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={applyScanResult} className="flex-1 btn-primary">
                  Confirm & Edit
                </Button>
                <Button variant="outline" onClick={() => setScanResult(null)}>
                  Rescan
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border z-50">
                  {LOCATIONS.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gallons">Gallons *</Label>
              <Input
                id="gallons"
                type="number"
                step="0.1"
                placeholder="28.5"
                value={gallons}
                onChange={(e) => handleGallonsChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price/Gal *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="2.89"
                value={pricePerGallon}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total *</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                placeholder="82.37"
                value={total}
                onChange={(e) => handleTotalChange(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer (optional)</Label>
              <Input
                id="odometer"
                type="number"
                placeholder="142350"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Full tank, highway stop..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full btn-primary py-6 text-lg font-semibold">
            Log Receipt
          </Button>
        </TabsContent>

        {/* Quick Entry Tab */}
        <TabsContent value="quick" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick">Quick Entry</Label>
            <Textarea
              id="quick"
              placeholder="25 gallons at Anita Shell&#10;42.5 gal, $119.15, Adair&#10;27 gal @ $2.87/gal, Guthrie"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              className="min-h-[120px] font-mono"
            />
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Examples:</p>
            <ul className="space-y-1">
              <li>"25 gallons at Anita Shell"</li>
              <li>"42.5 gal, $119.15, Adair"</li>
              <li>"27 gal @ $2.87/gal, Guthrie"</li>
            </ul>
          </div>
          <Button onClick={parseQuickEntry} disabled={!quickText} className="w-full btn-primary py-6 text-lg font-semibold">
            Parse & Continue
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
