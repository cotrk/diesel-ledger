export interface Receipt {
  id: string;
  date: string;
  location: string;
  gallons: number;
  pricePerGallon: number;
  total: number;
  odometer?: number;
  notes?: string;
  createdAt: string;
}

export interface PriceData {
  date: string;
  iowaAvg: number;
  yourAvg?: number;
}

export interface LocationStats {
  location: string;
  avgPrice: number;
  totalGallons: number;
  fillUps: number;
}

export interface MonthlyStats {
  month: string;
  totalGallons: number;
  totalCost: number;
  avgPrice: number;
  fillUps: number;
}

export const LOCATIONS = [
  'Adair Fuel',
  'Anita Shell',
  'Guthrie Ctr',
  'Atlantic Shell',
  'Other'
] as const;

export type LocationType = typeof LOCATIONS[number];
