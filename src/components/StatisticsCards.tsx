import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, MapPin, Wallet, Target, Gauge, BarChart3, Calendar } from 'lucide-react';
import { Receipt, LocationStats } from '@/types/diesel';

interface StatisticsCardsProps {
  stats: {
    totalGallons: number;
    totalSpent: number;
    avgPrice: number;
    fillUps: number;
    bestDeal: Receipt | null;
    worstDeal: Receipt | null;
  };
  thisMonthStats: {
    totalGallons: number;
    totalSpent: number;
    avgPrice: number;
    fillUps: number;
  };
  cheapestLocation: LocationStats | null;
  mostExpensiveLocation: LocationStats | null;
  potentialSavings: number;
  receipts: Receipt[];
}

export function StatisticsCards({
  stats,
  thisMonthStats,
  cheapestLocation,
  mostExpensiveLocation,
  potentialSavings,
  receipts
}: StatisticsCardsProps) {
  // Calculate fuel economy if odometer data exists
  const sortedWithOdometer = receipts
    .filter(r => r.odometer)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let mpg: number | null = null;
  if (sortedWithOdometer.length >= 2) {
    const latest = sortedWithOdometer[0];
    const previous = sortedWithOdometer[1];
    const milesDriven = latest.odometer! - previous.odometer!;
    mpg = milesDriven / latest.gallons;
  }

  const cards = [
    {
      title: 'Overall Statistics',
      icon: BarChart3,
      iconColor: 'text-primary',
      items: [
        { label: 'Total Gallons', value: `${stats.totalGallons.toFixed(1)} gal` },
        { label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}` },
        { label: 'Average Price', value: `$${stats.avgPrice.toFixed(2)}/gal` },
        { label: 'Fill-ups', value: stats.fillUps.toString() }
      ]
    },
    {
      title: 'This Month',
      icon: Calendar,
      iconColor: 'text-accent',
      items: [
        { label: 'Gallons', value: `${thisMonthStats.totalGallons.toFixed(1)} gal` },
        { label: 'Spent', value: `$${thisMonthStats.totalSpent.toFixed(2)}` },
        { label: 'Avg Price', value: thisMonthStats.avgPrice > 0 ? `$${thisMonthStats.avgPrice.toFixed(2)}/gal` : '—' },
        { label: 'Fill-ups', value: thisMonthStats.fillUps.toString() }
      ]
    },
    {
      title: 'Best & Worst Prices',
      icon: Target,
      iconColor: 'text-success',
      items: stats.bestDeal && stats.worstDeal ? [
        { 
          label: 'Best Deal', 
          value: `$${stats.bestDeal.pricePerGallon.toFixed(2)}`,
          subtext: `${stats.bestDeal.location} • ${format(parseISO(stats.bestDeal.date), 'MMM d')}`,
          highlight: 'success'
        },
        { 
          label: 'Worst Deal', 
          value: `$${stats.worstDeal.pricePerGallon.toFixed(2)}`,
          subtext: `${stats.worstDeal.location} • ${format(parseISO(stats.worstDeal.date), 'MMM d')}`,
          highlight: 'destructive'
        },
        { 
          label: 'Price Spread', 
          value: `$${(stats.worstDeal.pricePerGallon - stats.bestDeal.pricePerGallon).toFixed(2)}`
        }
      ] : [{ label: 'No data', value: '—' }]
    },
    {
      title: 'By Location',
      icon: MapPin,
      iconColor: 'text-warning',
      items: cheapestLocation && mostExpensiveLocation ? [
        { 
          label: 'Cheapest', 
          value: `$${cheapestLocation.avgPrice.toFixed(2)}/gal`,
          subtext: cheapestLocation.location,
          highlight: 'success'
        },
        { 
          label: 'Most Expensive', 
          value: `$${mostExpensiveLocation.avgPrice.toFixed(2)}/gal`,
          subtext: mostExpensiveLocation.location,
          highlight: 'destructive'
        },
        { 
          label: 'Savings/Gal', 
          value: `$${(mostExpensiveLocation.avgPrice - cheapestLocation.avgPrice).toFixed(2)}`
        }
      ] : [{ label: 'No data', value: '—' }]
    },
    {
      title: 'Savings Analysis',
      icon: Wallet,
      iconColor: 'text-primary',
      items: stats.bestDeal ? [
        { 
          label: 'If always cheapest', 
          value: `$${(stats.totalSpent - potentialSavings).toFixed(2)}`
        },
        { 
          label: 'Actually spent', 
          value: `$${stats.totalSpent.toFixed(2)}`
        },
        { 
          label: 'Money left on table', 
          value: `$${potentialSavings.toFixed(2)}`,
          highlight: potentialSavings > 0 ? 'warning' : 'success'
        },
        {
          label: 'Recommendation',
          value: cheapestLocation ? `${cheapestLocation.location} is usually cheapest` : 'Log more data'
        }
      ] : [{ label: 'No data', value: '—' }]
    },
    {
      title: 'Fuel Economy',
      icon: Gauge,
      iconColor: 'text-success',
      items: mpg !== null ? [
        { label: 'Latest MPG', value: `${mpg.toFixed(1)} MPG` },
        { 
          label: 'Trend', 
          value: mpg >= 15 ? 'Good efficiency' : 'Below average',
          highlight: mpg >= 15 ? 'success' : 'warning'
        }
      ] : [{ label: 'Track odometer to see MPG', value: '—' }]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="card-stat space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${card.iconColor}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">{card.title}</h3>
          </div>
          
          <div className="space-y-3">
            {card.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  {'subtext' in item && item.subtext && (
                    <p className="text-xs text-muted-foreground/70">{item.subtext}</p>
                  )}
                </div>
                <p className={`font-mono font-semibold text-right ${
                  'highlight' in item 
                    ? item.highlight === 'success' 
                      ? 'text-success' 
                      : item.highlight === 'destructive' 
                        ? 'text-destructive' 
                        : 'text-warning'
                    : 'text-foreground'
                }`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
