import { Fuel } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { NearbyStations } from '@/components/NearbyStations';
import { QuickStats } from '@/components/QuickStats';
import { ReceiptLogger } from '@/components/ReceiptLogger';
import { ReceiptHistory } from '@/components/ReceiptHistory';
import { PriceChart } from '@/components/PriceChart';
import { StatisticsCards } from '@/components/StatisticsCards';
import { ExportSection } from '@/components/ExportSection';
import { AlertsSettings } from '@/components/AlertsSettings';
import { useReceipts } from '@/hooks/useReceipts';

const Index = () => {
  const {
    receipts,
    isLoading,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    stats,
    thisMonthStats,
    last30DaysStats,
    cheapestLocation,
    mostExpensiveLocation,
    potentialSavings,
    monthlyStats
  } = useReceipts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Fuel className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading Diesel Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Diesel Tracker</h1>
              <p className="text-xs text-muted-foreground">Live Local Diesel Prices • Iowa</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Header with Price Intelligence */}
        <DashboardHeader
          yourAvgPrice={stats.avgPrice || 0}
          bestDealPrice={stats.bestDeal?.pricePerGallon || 0}
          worstDealPrice={stats.worstDeal?.pricePerGallon || 0}
        />

        {/* PRIMARY: Nearby Stations - live local prices */}
        <NearbyStations />

        {/* Quick Stats */}
        <QuickStats
          totalSpent={last30DaysStats.totalSpent}
          totalGallons={last30DaysStats.totalGallons}
          avgPerFillUp={last30DaysStats.fillUps > 0 ? last30DaysStats.totalSpent / last30DaysStats.fillUps : 0}
          projectedMonthly={last30DaysStats.totalSpent * 1.5}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Receipt Logger */}
          <div className="lg:col-span-1">
            <ReceiptLogger 
              onAddReceipt={addReceipt}
              avgPrice={stats.avgPrice}
            />
          </div>

          {/* Right Column - Price Chart */}
          <div className="lg:col-span-2">
            <PriceChart
              receipts={receipts}
              bestDeal={stats.bestDeal}
              worstDeal={stats.worstDeal}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards
          stats={stats}
          thisMonthStats={thisMonthStats}
          cheapestLocation={cheapestLocation}
          mostExpensiveLocation={mostExpensiveLocation}
          potentialSavings={potentialSavings}
          receipts={receipts}
        />

        {/* Receipt History Table */}
        <ReceiptHistory
          receipts={receipts}
          onUpdate={updateReceipt}
          onDelete={deleteReceipt}
          bestDealId={stats.bestDeal?.id}
          worstDealId={stats.worstDeal?.id}
        />

        {/* Bottom Section - Export & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExportSection 
            receipts={receipts}
            monthlyStats={monthlyStats}
          />
          <AlertsSettings />
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-8 mt-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Diesel Tracker • Live local diesel prices for owner-operators</p>
            <p className="mt-1">Data stored locally on your device</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
