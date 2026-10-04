'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location, createLocation } from '@/types/location';

interface LocationContextType {
  currentLocation: Location;
  setCurrentLocation: (loc: Location) => void;
  isLocating: boolean;
  detectCurrentLocation: () => Promise<Location | null>;
  savedLocations: Location[];
  saveLocation: (loc: Location) => void;
}

const DEFAULT_DEMO_LOCATION = createLocation({
  locationId: 'loc_default_center',
  formattedAddress: 'Central Market Square, Sector 4, City Center',
  latitude: 12.9716,
  longitude: 77.5946,
  city: 'Metro Alpha',
  district: 'Central District',
  state: 'State Alpha',
  country: 'DemoCountry',
  postalCode: '560001',
  landmark: 'Near Town Clock Tower',
});

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocationState] = useState<Location>(DEFAULT_DEMO_LOCATION);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lm_active_location');
      if (stored) {
        setCurrentLocationState(JSON.parse(stored));
      }
      const saved = localStorage.getItem('lm_saved_locations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setCurrentLocation = (loc: Location) => {
    setCurrentLocationState(loc);
    try {
      localStorage.setItem('lm_active_location', JSON.stringify(loc));
    } catch (e) {
      // ignore
    }
  };

  const saveLocation = (loc: Location) => {
    const updated = [loc, ...savedLocations.filter((l) => l.locationId !== loc.locationId)].slice(0, 5);
    setSavedLocations(updated);
    try {
      localStorage.setItem('lm_saved_locations', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const detectCurrentLocation = async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      return null;
    }

    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const res = await fetch('/api/locations/geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'reverse', lat, lng }),
            });
            const data = await res.json();
            if (data.success && data.location) {
              setCurrentLocation(data.location);
              saveLocation(data.location);
              setIsLocating(false);
              resolve(data.location);
              return;
            }
          } catch (e) {
            // fallback
          }

          const fallbackLoc = createLocation({
            formattedAddress: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            latitude: lat,
            longitude: lng,
            city: 'Metro Alpha',
            district: 'Central District',
            state: 'State Alpha',
            postalCode: '560001',
          });
          setCurrentLocation(fallbackLoc);
          setIsLocating(false);
          resolve(fallbackLoc);
        },
        () => {
          setIsLocating(false);
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        isLocating,
        detectCurrentLocation,
        savedLocations,
        saveLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
