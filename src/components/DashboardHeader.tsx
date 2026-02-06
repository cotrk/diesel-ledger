import { TrendingUp, TrendingDown, Fuel, Clock } from 'lucide-react';
import { currentIowaAverage, priceChange } from '@/lib/sampleData';

interface DashboardHeaderProps {
  yourAvgPrice: number;
  bestDealPrice: number;
  worstDealPrice: number;
}

export function DashboardHeader({ yourAvgPrice, bestDealPrice, worstDealPrice }: DashboardHeaderProps) {
  const isUp = priceChange >= 0;
  const isPriceGood = yourAvgPrice < currentIowaAverage;

  return (
    <div className="header-gradient rounded-xl p-6 text-primary-foreground shadow-elevated">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Main Price Display */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
            <Fuel className="h-8 w-8 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-foreground/70">Iowa Diesel Average</p>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-4xl font-bold tracking-tight">
                ${currentIowaAverage.toFixed(2)}
              </span>
              <span className="text-lg text-primary-foreground/80">/gal</span>
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${isUp ? 'bg-destructive/20' : 'bg-success/20'}`}>
          {isUp ? (
            <TrendingUp className="h-5 w-5 text-destructive" />
          ) : (
            <TrendingDown className="h-5 w-5 text-success" />
          )}
          <span className={`font-mono font-semibold ${isUp ? 'text-destructive' : 'text-success'}`}>
            {isUp ? '+' : ''}${priceChange.toFixed(2)} from last week
          </span>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 lg:gap-6">
          <div className="text-center">
            <p className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wide">Your Avg</p>
            <p className={`font-mono text-xl font-bold ${isPriceGood ? 'text-success' : 'text-warning'}`}>
              ${yourAvgPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wide">Best Deal</p>
            <p className="font-mono text-xl font-bold text-success">
              ${bestDealPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wide">Worst Deal</p>
            <p className="font-mono text-xl font-bold text-destructive">
              ${worstDealPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Updated timestamp */}
      <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/50">
        <Clock className="h-3 w-3" />
        <span>Updated 2 hours ago</span>
      </div>
    </div>
  );
}
