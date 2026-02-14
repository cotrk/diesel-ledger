import { Receipt, PriceData, NearbyStation } from '@/types/diesel';

// Generate sample receipts with realistic current Iowa diesel prices (~$3.20-$3.44)
export const sampleReceipts: Receipt[] = [
  {
    id: '1',
    date: '2026-02-13',
    location: "Casey's General Store",
    gallons: 28.5,
    pricePerGallon: 3.42,
    total: 97.47,
    odometer: 142350,
    notes: 'Full tank',
    createdAt: '2026-02-13T14:30:00Z'
  },
  {
    id: '2',
    date: '2026-02-08',
    location: 'Kum & Go',
    gallons: 26,
    pricePerGallon: 3.39,
    total: 88.14,
    odometer: 142100,
    notes: 'Partial fill',
    createdAt: '2026-02-08T09:15:00Z'
  },
  {
    id: '3',
    date: '2026-02-05',
    location: 'Adair Fuel',
    gallons: 30,
    pricePerGallon: 3.36,
    total: 100.80,
    odometer: 141850,
    notes: 'Full tank',
    createdAt: '2026-02-05T16:45:00Z'
  },
  {
    id: '4',
    date: '2026-02-02',
    location: "Casey's General Store",
    gallons: 32,
    pricePerGallon: 3.32,
    total: 106.24,
    odometer: 141550,
    createdAt: '2026-02-02T11:20:00Z'
  },
  {
    id: '5',
    date: '2026-01-30',
    location: 'Anita Shell',
    gallons: 28,
    pricePerGallon: 3.28,
    total: 91.84,
    odometer: 141200,
    notes: 'Full tank',
    createdAt: '2026-01-30T08:00:00Z'
  },
  {
    id: '6',
    date: '2026-01-27',
    location: 'Kum & Go',
    gallons: 25,
    pricePerGallon: 3.25,
    total: 81.25,
    odometer: 140900,
    createdAt: '2026-01-27T13:30:00Z'
  },
  {
    id: '7',
    date: '2026-01-24',
    location: 'Guthrie Ctr',
    gallons: 27,
    pricePerGallon: 3.20,
    total: 86.40,
    odometer: 140550,
    notes: 'Partial',
    createdAt: '2026-01-24T10:00:00Z'
  },
  {
    id: '8',
    date: '2026-01-21',
    location: "Casey's General Store",
    gallons: 29,
    pricePerGallon: 3.24,
    total: 93.96,
    odometer: 140200,
    notes: 'Full tank',
    createdAt: '2026-01-21T15:00:00Z'
  },
  {
    id: '9',
    date: '2026-01-18',
    location: 'Atlantic Shell',
    gallons: 31,
    pricePerGallon: 3.21,
    total: 99.51,
    odometer: 139850,
    createdAt: '2026-01-18T12:00:00Z'
  },
  {
    id: '10',
    date: '2026-01-15',
    location: 'Kum & Go',
    gallons: 26,
    pricePerGallon: 3.22,
    total: 83.72,
    odometer: 139500,
    notes: 'Highway stop',
    createdAt: '2026-01-15T09:30:00Z'
  }
];

// Generate Iowa diesel price history matching user-provided data
export const generatePriceHistory = (): PriceData[] => {
  const priceHistory: PriceData[] = [
    { date: '2026-01-15', iowaAvg: 3.22 },
    { date: '2026-01-16', iowaAvg: 3.22 },
    { date: '2026-01-17', iowaAvg: 3.21 },
    { date: '2026-01-18', iowaAvg: 3.21 },
    { date: '2026-01-19', iowaAvg: 3.22 },
    { date: '2026-01-20', iowaAvg: 3.23 },
    { date: '2026-01-21', iowaAvg: 3.24 },
    { date: '2026-01-22', iowaAvg: 3.23 },
    { date: '2026-01-23', iowaAvg: 3.22 },
    { date: '2026-01-24', iowaAvg: 3.20 },
    { date: '2026-01-25', iowaAvg: 3.21 },
    { date: '2026-01-26', iowaAvg: 3.23 },
    { date: '2026-01-27', iowaAvg: 3.25 },
    { date: '2026-01-28', iowaAvg: 3.26 },
    { date: '2026-01-29', iowaAvg: 3.27 },
    { date: '2026-01-30', iowaAvg: 3.28 },
    { date: '2026-01-31', iowaAvg: 3.29 },
    { date: '2026-02-01', iowaAvg: 3.30 },
    { date: '2026-02-02', iowaAvg: 3.32 },
    { date: '2026-02-03', iowaAvg: 3.33 },
    { date: '2026-02-04', iowaAvg: 3.34 },
    { date: '2026-02-05', iowaAvg: 3.36 },
    { date: '2026-02-06', iowaAvg: 3.37 },
    { date: '2026-02-07', iowaAvg: 3.38 },
    { date: '2026-02-08', iowaAvg: 3.39 },
    { date: '2026-02-09', iowaAvg: 3.40 },
    { date: '2026-02-10', iowaAvg: 3.42 },
    { date: '2026-02-11', iowaAvg: 3.44 },
    { date: '2026-02-12', iowaAvg: 3.43 },
    { date: '2026-02-13', iowaAvg: 3.42 },
    { date: '2026-02-14', iowaAvg: 3.42 },
  ];

  return priceHistory;
};

// Current Iowa diesel average
export const currentIowaAverage = 3.42;
export const previousWeekAverage = 3.36;
export const priceChange = currentIowaAverage - previousWeekAverage;

// Generate nearby stations with realistic data for central Iowa
// These simulate what a location-based diesel price finder would show
export const generateNearbyStations = (userLat: number, userLng: number): NearbyStation[] => {
  // Simulate stations around the user's location within 35 miles
  const stations: NearbyStation[] = [
    {
      id: 'cs1',
      name: "Casey's General Store #2847",
      brand: "Casey's",
      address: '201 N Main St, Adair, IA',
      distance: 2.1,
      dieselPrice: 3.38,
      lastUpdated: '2h ago',
      lat: userLat + 0.012,
      lng: userLng - 0.008,
    },
    {
      id: 'kg1',
      name: 'Kum & Go #497',
      brand: 'Kum & Go',
      address: '305 Audubon St, Adair, IA',
      distance: 2.4,
      dieselPrice: 3.35,
      lastUpdated: '1h ago',
      lat: userLat - 0.015,
      lng: userLng + 0.01,
    },
    {
      id: 'cs2',
      name: "Casey's General Store #1923",
      brand: "Casey's",
      address: '812 Main St, Anita, IA',
      distance: 8.7,
      dieselPrice: 3.42,
      lastUpdated: '3h ago',
      lat: userLat + 0.08,
      lng: userLng + 0.05,
    },
    {
      id: 'kg2',
      name: 'Kum & Go #612',
      brand: 'Kum & Go',
      address: '1402 State St, Guthrie Center, IA',
      distance: 14.2,
      dieselPrice: 3.31,
      lastUpdated: '45m ago',
      lat: userLat + 0.15,
      lng: userLng + 0.12,
    },
    {
      id: 'cs3',
      name: "Casey's General Store #3105",
      brand: "Casey's",
      address: '710 W 7th St, Atlantic, IA',
      distance: 18.5,
      dieselPrice: 3.44,
      lastUpdated: '4h ago',
      lat: userLat - 0.2,
      lng: userLng - 0.18,
    },
    {
      id: 'sh1',
      name: 'Shell - Adair Travel Center',
      brand: 'Shell',
      address: '100 I-80 Exit 76, Adair, IA',
      distance: 3.0,
      dieselPrice: 3.48,
      lastUpdated: '2h ago',
      lat: userLat + 0.02,
      lng: userLng - 0.025,
    },
    {
      id: 'bp1',
      name: 'BP Station',
      brand: 'BP',
      address: '505 Commerce Dr, Stuart, IA',
      distance: 11.3,
      dieselPrice: 3.40,
      lastUpdated: '5h ago',
      lat: userLat - 0.1,
      lng: userLng + 0.08,
    },
    {
      id: 'kg3',
      name: 'Kum & Go #388',
      brand: 'Kum & Go',
      address: '1205 Broad St, Greenfield, IA',
      distance: 22.8,
      dieselPrice: 3.29,
      lastUpdated: '1h ago',
      lat: userLat + 0.25,
      lng: userLng - 0.2,
    },
    {
      id: 'cs4',
      name: "Casey's General Store #4210",
      brand: "Casey's",
      address: '900 E Main, Winterset, IA',
      distance: 28.4,
      dieselPrice: 3.36,
      lastUpdated: '3h ago',
      lat: userLat - 0.3,
      lng: userLng + 0.25,
    },
    {
      id: 'pf1',
      name: 'Pilot Flying J #742',
      brand: 'Pilot',
      address: '2100 W I-80, De Soto, IA',
      distance: 33.1,
      dieselPrice: 3.33,
      lastUpdated: '30m ago',
      lat: userLat - 0.35,
      lng: userLng + 0.3,
    },
  ];

  return stations.sort((a, b) => a.dieselPrice - b.dieselPrice);
};
