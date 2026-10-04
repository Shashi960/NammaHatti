'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { Location, createLocation } from '@/types/location';
import { Car, MapPin, Calendar, Clock, Package, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  const [travelDate, setTravelDate] = useState(todayStr);
  const [departureTime, setDepartureTime] = useState('09:00');
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState('11:00');
  const [maxPackageCapacity, setMaxPackageCapacity] = useState<number>(5);
  const [maxWeightKg, setMaxWeightKg] = useState<number>(15);
  const [notes, setNotes] = useState('');

  // Origin & Destination Locations
  const [origin, setOrigin] = useState<Location>(
    createLocation({
      formattedAddress: 'Sector 1 Hub, Main Station Area',
      latitude: 12.9716,
      longitude: 77.5946,
      city: 'Metro Alpha',
      district: 'Central District',
    })
  );

  const [destination, setDestination] = useState<Location>(
    createLocation({
      formattedAddress: 'Commercial Suburb, Outer Ring Road',
      latitude: 12.9352,
      longitude: 77.6245,
      city: 'Town Beta',
      district: 'Outer District',
    })
  );

  const [activeStep, setActiveStep] = useState<'origin' | 'dest' | 'details'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/traveller/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          travelDate,
          departureTime,
          estimatedArrivalTime,
          maxPackageCapacity: Number(maxPackageCapacity),
          maxWeightKg: Number(maxWeightKg),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create trip');
        setLoading(false);
        return;
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      // Route straight to compatible matches
      router.push(`/traveller/trips/${data.trip._id}/matches`);
    } catch (err) {
      setError('An error occurred creating trip');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Declare a Travel Journey
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tell us your travel route. Our deterministic algorithm will match compatible pickup shops and drop-offs along your path.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {warning && (
        <div className="rounded-lg bg-amber-50 p-4 text-xs font-medium text-amber-800 border border-amber-200 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{warning}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Origin & Destination Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin Picker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-brand-700 border-b border-slate-100 pb-2">
              <MapPin className="h-5 w-5" />
              <h3 className="font-bold text-sm text-slate-900">Trip Origin (Starting Point)</h3>
            </div>
            <LocationPicker
              initialLocation={origin}
              onConfirm={(loc) => setOrigin(loc)}
              title="Pin Origin Location"
              confirmButtonText="Confirm Origin Coordinates"
            />
          </div>

          {/* Destination Picker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-rose-600 border-b border-slate-100 pb-2">
              <MapPin className="h-5 w-5" />
              <h3 className="font-bold text-sm text-slate-900">Trip Destination (End Point)</h3>
            </div>
            <LocationPicker
              initialLocation={destination}
              onConfirm={(loc) => setDestination(loc)}
              title="Pin Destination Location"
              confirmButtonText="Confirm Destination Coordinates"
            />
          </div>
        </div>

        {/* Step 2: Trip Parameters & Capacity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Trip Timing & Vehicle Package Capacity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Travel Date</label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Departure Time</label>
              <input
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Estimated Arrival</label>
              <input
                type="time"
                required
                value={estimatedArrivalTime}
                onChange={(e) => setEstimatedArrivalTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Max Package Slots (Capacity)
              </label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={maxPackageCapacity}
                onChange={(e) => setMaxPackageCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">e.g. 5 packages in your boot/carrier</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Max Total Weight (kg)
              </label>
              <input
                type="number"
                required
                min={1}
                max={50}
                value={maxWeightKg}
                onChange={(e) => setMaxWeightKg(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">e.g. 15 kg maximum</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Trip Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Commuting via Main Highway, small parcel space only"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-route-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-route-700 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{loading ? 'Analyzing Routes...' : 'Save Journey & Find Compatible Orders →'}</span>
        </button>
      </form>
    </div>
  );
}
