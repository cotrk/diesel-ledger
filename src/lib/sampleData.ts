import { Receipt, PriceData } from '@/types/diesel';

// Generate sample receipts for realistic Iowa diesel tracking
export const sampleReceipts: Receipt[] = [
  {
    id: '1',
    date: '2025-02-03',
    location: 'Anita Shell',
    gallons: 28.5,
    pricePerGallon: 2.91,
    total: 82.94,
    odometer: 142350,
    notes: 'Full tank',
    createdAt: '2025-02-03T14:30:00Z'
  },
  {
    id: '2',
    date: '2025-01-28',
    location: 'Adair Fuel',
    gallons: 26,
    pricePerGallon: 2.76,
    total: 71.76,
    odometer: 142100,
    notes: 'Partial fill',
    createdAt: '2025-01-28T09:15:00Z'
  },
  {
    id: '3',
    date: '2025-01-25',
    location: 'Guthrie Ctr',
    gallons: 30,
    pricePerGallon: 2.68,
    total: 80.40,
    odometer: 141850,
    notes: 'Full tank',
    createdAt: '2025-01-25T16:45:00Z'
  },
  {
    id: '4',
    date: '2025-01-20',
    location: 'Atlantic Shell',
    gallons: 32,
    pricePerGallon: 2.71,
    total: 86.72,
    odometer: 141550,
    createdAt: '2025-01-20T11:20:00Z'
  },
  {
    id: '5',
    date: '2025-01-15',
    location: 'Anita Shell',
    gallons: 28,
    pricePerGallon: 2.91,
    total: 81.48,
    odometer: 141200,
    notes: 'Full tank',
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: '6',
    date: '2025-01-10',
    location: 'Adair Fuel',
    gallons: 25,
    pricePerGallon: 2.87,
    total: 71.75,
    odometer: 140900,
    createdAt: '2025-01-10T13:30:00Z'
  },
  {
    id: '7',
    date: '2025-01-05',
    location: 'Guthrie Ctr',
    gallons: 27,
    pricePerGallon: 2.79,
    total: 75.33,
    odometer: 140550,
    notes: 'Partial',
    createdAt: '2025-01-05T10:00:00Z'
  }
];

// Generate Iowa diesel price history for the last 30 days
export const generatePriceHistory = (): PriceData[] => {
  const priceHistory: PriceData[] = [];
  const baseDate = new Date('2025-02-05');
  
  // Realistic Iowa diesel prices (fluctuating around $2.75-$2.92)
  const basePrices = [
    2.89, 2.81, 2.76, 2.78, 2.79, 2.71, 2.68, 2.72, 2.76, 2.68,
    2.71, 2.75, 2.79, 2.82, 2.91, 2.88, 2.85, 2.83, 2.79, 2.76,
    2.74, 2.72, 2.75, 2.78, 2.81, 2.84, 2.87, 2.88, 2.86, 2.84
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    priceHistory.push({
      date: dateStr,
      iowaAvg: basePrices[i] || 2.80
    });
  }

  return priceHistory.reverse();
};

// Current Iowa diesel average (simulated)
export const currentIowaAverage = 2.89;
export const previousWeekAverage = 2.81;
export const priceChange = currentIowaAverage - previousWeekAverage;
