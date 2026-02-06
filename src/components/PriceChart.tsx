import { useState, useMemo } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Receipt, PriceData } from '@/types/diesel';
import { generatePriceHistory, currentIowaAverage } from '@/lib/sampleData';

interface PriceChartProps {
  receipts: Receipt[];
  bestDeal?: Receipt | null;
  worstDeal?: Receipt | null;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export function PriceChart({ receipts, bestDeal, worstDeal }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showIowaAvg, setShowIowaAvg] = useState(true);
  const [showYourPrice, setShowYourPrice] = useState(true);

  const priceHistory = useMemo(() => generatePriceHistory(), []);

  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 365;
    const cutoff = subDays(new Date(), days);
    
    // Get Iowa prices in range
    const filteredHistory = priceHistory.filter(p => new Date(p.date) >= cutoff);
    
    // Create a map of dates to your prices
    const yourPrices: Record<string, number> = {};
    receipts.forEach(r => {
      if (new Date(r.date) >= cutoff) {
        yourPrices[r.date] = r.pricePerGallon;
      }
    });

    // Merge data
    return filteredHistory.map(p => ({
      date: p.date,
      displayDate: format(parseISO(p.date), 'MMM d'),
      iowaAvg: p.iowaAvg,
      yourPrice: yourPrices[p.date] || null,
      isBest: bestDeal?.date === p.date,
      isWorst: worstDeal?.date === p.date
    }));
  }, [priceHistory, receipts, timeRange, bestDeal, worstDeal]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-elevated p-3">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-semibold">${entry.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground">Price History</h2>
        
        {/* Time Range Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' },
            { value: 'all', label: 'All' }
          ].map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value as TimeRange)}
              className={timeRange === range.value ? 'btn-primary' : ''}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="flex flex-wrap gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Switch 
            id="iowa-avg" 
            checked={showIowaAvg} 
            onCheckedChange={setShowIowaAvg}
          />
          <Label htmlFor="iowa-avg" className="text-sm text-muted-foreground">Iowa Average</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            id="your-price" 
            checked={showYourPrice} 
            onCheckedChange={setShowYourPrice}
          />
          <Label htmlFor="your-price" className="text-sm text-muted-foreground">Your Prices</Label>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(val) => `$${val.toFixed(2)}`}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference line for current price */}
            <ReferenceLine 
              y={currentIowaAverage} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="5 5"
              label={{ 
                value: 'Current', 
                position: 'right',
                fill: 'hsl(var(--warning))',
                fontSize: 11
              }}
            />
            
            {showIowaAvg && (
              <Line 
                type="monotone" 
                dataKey="iowaAvg" 
                name="Iowa Avg"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            )}
            
            {showYourPrice && (
              <Line 
                type="monotone" 
                dataKey="yourPrice" 
                name="Your Price"
                stroke="hsl(var(--destructive))" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
                activeDot={{ r: 8, fill: 'hsl(var(--destructive))' }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for markers */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent flex items-center justify-center text-xs">★</div>
          <span>Best Deal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive flex items-center justify-center text-xs text-destructive-foreground">✕</div>
          <span>Worst Deal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-warning" style={{ borderStyle: 'dashed' }} />
          <span>Current Price</span>
        </div>
      </div>
    </div>
  );
}
