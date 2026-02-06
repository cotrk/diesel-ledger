import { useState, useRef } from 'react';
import { Bell, BellOff, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { LOCATIONS } from '@/types/diesel';
import { currentIowaAverage } from '@/lib/sampleData';
import { toast } from 'sonner';

export function AlertsSettings() {
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('2.75');
  const [showOdometer, setShowOdometer] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [trackedLocations, setTrackedLocations] = useState<string[]>([...LOCATIONS]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLocation = (location: string) => {
    setTrackedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.receipts) {
          // In a real app, you'd merge this with existing data
          toast.success(`Found ${data.receipts.length} receipts to import`, {
            description: 'Preview and merge functionality would go here',
            icon: <CheckCircle className="h-5 w-5 text-success" />
          });
        }
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const isAlertTriggered = alertEnabled && currentIowaAverage < parseFloat(alertThreshold);

  return (
    <div className="card-elevated p-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Settings & Alerts</h2>

      {/* Price Alert */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          {alertEnabled ? (
            <Bell className="h-4 w-4 text-accent" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          Price Alert
        </h3>
        
        <div className="flex items-center gap-4">
          <Switch
            id="alert-toggle"
            checked={alertEnabled}
            onCheckedChange={setAlertEnabled}
          />
          <Label htmlFor="alert-toggle" className="text-sm text-muted-foreground">
            Notify when price drops below threshold
          </Label>
        </div>

        {alertEnabled && (
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Threshold:</Label>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="pl-7 font-mono"
              />
            </div>
            <span className="text-sm text-muted-foreground">/gal</span>
          </div>
        )}

        {isAlertTriggered && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-3 flex items-center gap-3">
            <Bell className="h-5 w-5 text-success animate-pulse" />
            <span className="text-sm text-success font-medium">
              Price Alert: Diesel is now ${currentIowaAverage.toFixed(2)}/gal (below your ${alertThreshold} threshold!)
            </span>
          </div>
        )}
        
        {alertEnabled && !isAlertTriggered && (
          <p className="text-sm text-muted-foreground">
            🔔 Alert threshold set to ${parseFloat(alertThreshold).toFixed(2)}/gal • Current: ${currentIowaAverage.toFixed(2)}/gal
          </p>
        )}
      </div>

      {/* Location Preferences */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Tracked Locations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LOCATIONS.map(location => (
            <label
              key={location}
              className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={trackedLocations.includes(location)}
                onCheckedChange={() => toggleLocation(location)}
              />
              <span className="text-sm text-foreground">{location}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Settings */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Display Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Switch
              id="show-odometer"
              checked={showOdometer}
              onCheckedChange={setShowOdometer}
            />
            <Label htmlFor="show-odometer" className="text-sm text-muted-foreground">
              Show odometer data in table
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="show-notes"
              checked={showNotes}
              onCheckedChange={setShowNotes}
            />
            <Label htmlFor="show-notes" className="text-sm text-muted-foreground">
              Show notes in table
            </Label>
          </div>
        </div>
      </div>

      {/* Import Data */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Import Previous Data</h3>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,.csv"
          onChange={handleImport}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload CSV or JSON File
        </Button>
        <p className="text-xs text-muted-foreground">
          Accepts previous exports or manually created CSV files
        </p>
      </div>
    </div>
  );
}
