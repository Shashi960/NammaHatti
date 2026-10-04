'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Check, Loader2, X } from 'lucide-react';
import { Location, createLocation } from '@/types/location';
import { GoogleMap, MapMarker } from './GoogleMap';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { useLocation } from '@/context/LocationContext';

interface LocationPickerProps {
  initialLocation?: Location;
  onConfirm: (location: Location) => void;
  title?: string;
  confirmButtonText?: string;
  onClose?: () => void;
}

export function LocationPicker({
  initialLocation,
  onConfirm,
  title = 'Select Location',
  confirmButtonText = 'Confirm This Location',
  onClose,
}: LocationPickerProps) {
  const { detectCurrentLocation, isLocating } = useLocation();

  const [selectedLoc, setSelectedLoc] = useState<Location>(
    initialLocation ||
      createLocation({
        formattedAddress: 'Central Area, Sector 2, Market Hub',
        latitude: 12.9716,
        longitude: 77.5946,
        city: 'Metro Alpha',
        district: 'Central District',
        state: 'State Alpha',
        country: 'DemoCountry',
        postalCode: '560001',
      })
  );

  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [landmark, setLandmark] = useState(selectedLoc.landmark || '');

  // When user clicks anywhere on map
  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch('/api/locations/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reverse', lat: coords.lat, lng: coords.lng }),
      });
      const data = await res.json();
      if (data.success && data.location) {
        setSelectedLoc({
          ...data.location,
          landmark,
        });
      } else {
        setSelectedLoc(
          createLocation({
            formattedAddress: `Selected Spot (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
            latitude: coords.lat,
            longitude: coords.lng,
            city: selectedLoc.city || 'Metro Alpha',
            landmark,
          })
        );
      }
    } catch (e) {
      setSelectedLoc(
        createLocation({
          formattedAddress: `Selected Spot (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
          latitude: coords.lat,
          longitude: coords.lng,
          city: selectedLoc.city || 'Metro Alpha',
          landmark,
        })
      );
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    const loc = await detectCurrentLocation();
    if (loc) {
      setSelectedLoc(loc);
    }
  };

  const markers: MapMarker[] = [
    {
      id: 'selected_pin',
      latitude: selectedLoc.latitude,
      longitude: selectedLoc.longitude,
      title: 'Delivery / Stop Location',
      label: '📍 HERE',
      color: 'blue',
    },
  ];

  const content = (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-[#2874f0]" />
          <h3 className="font-bold text-[#212121]">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center space-x-1.5 rounded-sm border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2874f0] hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5" />
            )}
            <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Search */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Search Area or Address</label>
        <PlaceAutocomplete
          onLocationSelect={(loc) => setSelectedLoc(loc)}
          placeholder="Search by street, area, market or place..."
        />
      </div>

      {/* Interactive Map */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Click anywhere on the map to reposition pin</span>
          {isReverseGeocoding && <span className="text-brand-600 font-medium">Resolving address...</span>}
        </div>
        <GoogleMap
          center={{ lat: selectedLoc.latitude, lng: selectedLoc.longitude }}
          markers={markers}
          onMapClick={handleMapClick}
          height="220px"
        />
      </div>

      {/* Address Confirmation Card */}
      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
        <p className="font-semibold text-slate-900 mb-0.5">Selected Coordinates & Address:</p>
        <p className="text-slate-600 mb-2">{selectedLoc.formattedAddress}</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div>Locality / City: <span className="font-medium text-slate-800">{selectedLoc.city}</span></div>
          <div>Postal Code: <span className="font-medium text-slate-800">{selectedLoc.postalCode || 'N/A'}</span></div>
        </div>

        {/* Optional Landmark */}
        <div className="mt-2.5">
          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
            Landmark / House / Flat No. (Optional)
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Water Tank, Flat 3B"
            className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onConfirm({ ...selectedLoc, landmark })}
        className="w-full flex items-center justify-center space-x-2 rounded-sm bg-[#fb641b] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow hover:bg-[#e85a15] transition-colors"
      >
        <Check className="h-4 w-4" />
        <span>{confirmButtonText}</span>
      </button>
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 overflow-y-auto animate-in fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
