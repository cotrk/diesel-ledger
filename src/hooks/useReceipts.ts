import { useState, useEffect, useCallback } from 'react';
import { Receipt, LocationStats, MonthlyStats } from '@/types/diesel';
import { sampleReceipts } from '@/lib/sampleData';

const STORAGE_KEY = 'diesel-tracker-receipts';

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load receipts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReceipts(JSON.parse(stored));
      } catch {
        setReceipts(sampleReceipts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReceipts));
      }
    } else {
      // Initialize with sample data
      setReceipts(sampleReceipts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReceipts));
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage when receipts change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    }
  }, [receipts, isLoading]);

  const addReceipt = useCallback((receipt: Omit<Receipt, 'id' | 'createdAt'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setReceipts(prev => [newReceipt, ...prev]);
    return newReceipt;
  }, []);

  const updateReceipt = useCallback((id: string, updates: Partial<Receipt>) => {
    setReceipts(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteReceipt = useCallback((id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  }, []);

  // Calculate statistics
  const stats = {
    totalGallons: receipts.reduce((sum, r) => sum + r.gallons, 0),
    totalSpent: receipts.reduce((sum, r) => sum + r.total, 0),
    avgPrice: receipts.length > 0
      ? receipts.reduce((sum, r) => sum + r.pricePerGallon, 0) / receipts.length
      : 0,
    fillUps: receipts.length,
    
    // Best and worst deals
    bestDeal: receipts.length > 0
      ? receipts.reduce((best, r) => r.pricePerGallon < best.pricePerGallon ? r : best)
      : null,
    worstDeal: receipts.length > 0
      ? receipts.reduce((worst, r) => r.pricePerGallon > worst.pricePerGallon ? r : worst)
      : null,
  };

  // Get this month's stats
  const thisMonthReceipts = receipts.filter(r => {
    const receiptDate = new Date(r.date);
    const now = new Date();
    return receiptDate.getMonth() === now.getMonth() && 
           receiptDate.getFullYear() === now.getFullYear();
  });

  const thisMonthStats = {
    totalGallons: thisMonthReceipts.reduce((sum, r) => sum + r.gallons, 0),
    totalSpent: thisMonthReceipts.reduce((sum, r) => sum + r.total, 0),
    avgPrice: thisMonthReceipts.length > 0
      ? thisMonthReceipts.reduce((sum, r) => sum + r.pricePerGallon, 0) / thisMonthReceipts.length
      : 0,
    fillUps: thisMonthReceipts.length,
  };

  // Get last 30 days stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const last30DaysReceipts = receipts.filter(r => new Date(r.date) >= thirtyDaysAgo);
  const last30DaysStats = {
    totalGallons: last30DaysReceipts.reduce((sum, r) => sum + r.gallons, 0),
    totalSpent: last30DaysReceipts.reduce((sum, r) => sum + r.total, 0),
    avgPrice: last30DaysReceipts.length > 0
      ? last30DaysReceipts.reduce((sum, r) => sum + r.pricePerGallon, 0) / last30DaysReceipts.length
      : 0,
    fillUps: last30DaysReceipts.length,
  };

  // Stats by location
  const locationStats: LocationStats[] = Object.values(
    receipts.reduce((acc, r) => {
      if (!acc[r.location]) {
        acc[r.location] = {
          location: r.location,
          avgPrice: 0,
          totalGallons: 0,
          fillUps: 0,
          totalPrice: 0
        };
      }
      acc[r.location].totalGallons += r.gallons;
      acc[r.location].fillUps += 1;
      acc[r.location].totalPrice += r.pricePerGallon;
      return acc;
    }, {} as Record<string, LocationStats & { totalPrice: number }>)
  ).map(loc => ({
    ...loc,
    avgPrice: loc.totalPrice / loc.fillUps
  }));

  const cheapestLocation = locationStats.length > 0
    ? locationStats.reduce((min, loc) => loc.avgPrice < min.avgPrice ? loc : min)
    : null;

  const mostExpensiveLocation = locationStats.length > 0
    ? locationStats.reduce((max, loc) => loc.avgPrice > max.avgPrice ? loc : max)
    : null;

  // Calculate potential savings
  const potentialSavings = receipts.length > 0 && stats.bestDeal
    ? receipts.reduce((total, r) => {
        return total + (r.pricePerGallon - stats.bestDeal!.pricePerGallon) * r.gallons;
      }, 0)
    : 0;

  // Monthly breakdown
  const monthlyStats: MonthlyStats[] = Object.values(
    receipts.reduce((acc, r) => {
      const month = r.date.substring(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = {
          month,
          totalGallons: 0,
          totalCost: 0,
          avgPrice: 0,
          fillUps: 0,
          sumPrice: 0
        };
      }
      acc[month].totalGallons += r.gallons;
      acc[month].totalCost += r.total;
      acc[month].fillUps += 1;
      acc[month].sumPrice += r.pricePerGallon;
      return acc;
    }, {} as Record<string, MonthlyStats & { sumPrice: number }>)
  ).map(m => ({
    ...m,
    avgPrice: m.sumPrice / m.fillUps
  })).sort((a, b) => b.month.localeCompare(a.month));

  return {
    receipts,
    isLoading,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    stats,
    thisMonthStats,
    last30DaysStats,
    locationStats,
    cheapestLocation,
    mostExpensiveLocation,
    potentialSavings,
    monthlyStats
  };
}
