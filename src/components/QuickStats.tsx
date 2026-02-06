import { DollarSign, Droplets, Receipt, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  totalSpent: number;
  totalGallons: number;
  avgPerFillUp: number;
  projectedMonthly: number;
}

export function QuickStats({ totalSpent, totalGallons, avgPerFillUp, projectedMonthly }: QuickStatsProps) {
  const stats = [
    {
      label: '30-Day Spending',
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-accent'
    },
    {
      label: 'Total Gallons',
      value: `${totalGallons.toFixed(1)} gal`,
      icon: Droplets,
      color: 'text-primary'
    },
    {
      label: 'Avg Per Fill-up',
      value: `$${avgPerFillUp.toFixed(2)}`,
      icon: Receipt,
      color: 'text-success'
    },
    {
      label: 'Projected Monthly',
      value: `$${projectedMonthly.toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-stat flex items-center gap-3 animate-slide-up"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            <p className="font-mono text-lg font-bold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
