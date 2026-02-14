import { useState, useMemo } from 'react';
import { MapPin, Navigation, Fuel, Clock, ArrowUpDown, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NearbyStation } from '@/types/diesel';
import { generateNearbyStations, currentIowaAverage } from '@/lib/sampleData';
import { useGeolocation, DEFAULT_LOCATION } from '@/hooks/useGeolocation';

type SortBy = 'price' | 'distance';

export function NearbyStations() {
  const { location, error, isLoading, isPermissionDenied, requestLocation } = useGeolocation();
  const [sortBy, setSortBy] = useState<SortBy>('price');
  const [showAll, setShowAll] = useState(false);
  const [radius] = useState(35);

  const userCoords = location ?? DEFAULT_LOCATION;

  const stations = useMemo(() => {
    const all = generateNearbyStations(userCoords.lat, userCoords.lng);
    const filtered = all.filter(s => s.distance <= radius);
    return sortBy === 'price'
      ? filtered.sort((a, b) => a.dieselPrice - b.dieselPrice)
      : filtered.sort((a, b) => a.distance - b.distance);
  }, [userCoords.lat, userCoords.lng, sortBy, radius]);

  const cheapest = stations[0];
  const displayed = showAll ? stations : stations.slice(0, 5);

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Casey's": return 'bg-red-500/15 text-red-700 border-red-200';
      case 'Kum & Go': return 'bg-purple-500/15 text-purple-700 border-purple-200';
      case 'Shell': return 'bg-yellow-500/15 text-yellow-700 border-yellow-200';
      case 'Pilot': return 'bg-blue-500/15 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriceClass = (price: number) => {
    if (cheapest && price === cheapest.dieselPrice) return 'text-success font-bold';
    if (price > currentIowaAverage) return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Nearby Diesel Prices</h2>
            <p className="text-xs text-muted-foreground">
              {location ? `Within ${radius} miles of your location` : `Within ${radius} miles • Default: Adair, IA`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'price' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('price')}
            className={sortBy === 'price' ? 'btn-primary' : ''}
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            Price
          </Button>
          <Button
            variant={sortBy === 'distance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('distance')}
            className={sortBy === 'distance' ? 'btn-primary' : ''}
          >
            <Navigation className="h-3.5 w-3.5 mr-1" />
            Distance
          </Button>
        </div>
      </div>

      {/* Location status */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Detecting your location...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 text-sm mb-4 p-3 rounded-lg bg-warning/10 text-warning">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          {isPermissionDenied && (
            <Button variant="outline" size="sm" onClick={requestLocation} className="ml-auto text-xs">
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Cheapest highlight */}
      {cheapest && (
        <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-success uppercase tracking-wide">🏆 Cheapest Nearby</p>
              <p className="font-semibold text-foreground">{cheapest.name}</p>
              <p className="text-xs text-muted-foreground">{cheapest.address} • {cheapest.distance} mi</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-success">${cheapest.dieselPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{cheapest.lastUpdated}</p>
            </div>
          </div>
        </div>
      )}

      {/* Station list */}
      <div className="space-y-2">
        {displayed.map((station, i) => (
          <div
            key={station.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/30 ${
              i === 0 && sortBy === 'price' ? 'border-success/30' : 'border-border/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary shrink-0">
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-foreground truncate">{station.name}</p>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getBrandColor(station.brand)}`}>
                    {station.brand}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {station.distance} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {station.lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 ml-3">
              <p className={`font-mono text-lg font-semibold ${getPriceClass(station.dieselPrice)}`}>
                ${station.dieselPrice.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">/gal</p>
            </div>
          </div>
        ))}
      </div>

      {stations.length > 5 && (
        <Button
          variant="ghost"
          className="w-full mt-3 text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(!showAll)}
        >
          <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show fewer' : `Show all ${stations.length} stations`}
        </Button>
      )}
    </div>
  );
}
