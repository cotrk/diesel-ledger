import { useState, useEffect, useCallback } from 'react';
import { UserLocation } from '@/types/diesel';

interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  isLoading: boolean;
  isPermissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
    isPermissionDenied: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported by your browser' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
          error: null,
          isLoading: false,
          isPermissionDenied: false,
        });
      },
      (error) => {
        setState({
          location: null,
          error: error.code === 1
            ? 'Location access denied. Please enable location in your browser settings.'
            : 'Unable to determine your location. Using default Iowa location.',
          isLoading: false,
          isPermissionDenied: error.code === 1,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, requestLocation };
}

// Default location: Adair, Iowa (central Iowa)
export const DEFAULT_LOCATION = { lat: 41.5006, lng: -94.6416 };
