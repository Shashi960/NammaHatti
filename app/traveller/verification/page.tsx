'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { Badge } from '@/components/ui/Badge';
import { Location, createLocation } from '@/types/location';
import {
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Car,
} from 'lucide-react';

export default function TravellerVerificationPage() {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<any>(null);
  const [locality, setLocality] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [localityName, setLocalityName] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedLoc, setSelectedLoc] = useState<Location>(
    createLocation({
      formattedAddress: 'Residential Sector 4, North Block',
      latitude: 12.9716,
      longitude: 77.5946,
      city: 'Metro Alpha',
      postalCode: '560001',
    })
  );

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadKYC = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/traveller/kyc');
      const data = await res.json();
      if (data.kyc) setKyc(data.kyc);
      if (data.locality) {
        setLocality(data.locality);
        setLocalityName(data.locality.localityName);
        setCity(data.locality.city);
        setPostalCode(data.locality.postalCode);
        setRadiusKm(data.locality.radiusKm || 5);
      }
    } catch (err) {
      console.error('Failed to load KYC info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadKYC();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/traveller/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'GOVERNMENT_ID',
          locality: {
            localityName: localityName || selectedLoc.city,
            city: city || selectedLoc.city,
            postalCode: postalCode || selectedLoc.postalCode,
            latitude: selectedLoc.latitude,
            longitude: selectedLoc.longitude,
            radiusKm: Math.min(Math.max(radiusKm, 1), 7), // capped at 7km
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Locality and KYC details submitted. Verification in progress.');
        await loadKYC();
      }
    } catch (err) {
      console.error('Error submitting verification:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = kyc?.status === 'VERIFIED';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Delivery Partner Verification
            </h1>
            {isVerified ? (
              <Badge type="verified-traveller" />
            ) : (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                Status: {kyc?.status || 'PENDING'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Identity verification and residential locality centroid binding
          </p>
        </div>

        <Link
          href="/traveller/dashboard"
          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Car className="h-4 w-4 text-route-600" />
          <span>Traveller Dashboard</span>
        </Link>
      </div>

      {/* KYC Alert Banner */}
      {!isVerified ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">KYC verification is required before accepting customer orders.</p>
            <p className="text-amber-800 leading-relaxed">
              To preserve community trust and safety, travellers can only accept pooled delivery routes once their identity and residential locality centroid are verified.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start space-x-3 text-xs text-emerald-900">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">✓ Identity & Locality Fully Verified</p>
            <p className="text-emerald-800 leading-relaxed">
              Your profile is authorized to accept customer orders within your verified {locality?.radiusKm || 5} km radius.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Guarantee Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center space-x-2 text-slate-900 font-semibold">
          <Lock className="h-4 w-4 text-brand-600" />
          <span>Strict Privacy & Data Minimization Protocol</span>
        </div>
        <p className="leading-relaxed">
          {process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh'} adheres strictly to privacy-first standards. We never store raw Aadhaar numbers, ID cards, or detailed house addresses. Only coarse centroid coordinates and verification reference IDs are retained for route pooling calculations.
        </p>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Residential Locality & Centroid
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Locality / Neighborhood Name</label>
            <input
              type="text"
              required
              value={localityName}
              onChange={(e) => setLocalityName(e.target.value)}
              placeholder="e.g. Sector 4 / North Gate"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Metro Alpha"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 560001"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Delivery Eligibility Radius (Max 7 km cap)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={7}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Math.min(Number(e.target.value), 7))}
                className="w-24 rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none font-bold"
              />
              <span className="text-xs text-slate-500">km (Default: 5 km, Hard Cap: 7 km)</span>
            </div>
          </div>
        </div>

        {/* Location Picker for Centroid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-900">
            Pin Locality Centroid on Map
          </label>
          <LocationPicker
            initialLocation={selectedLoc}
            onConfirm={(loc) => {
              setSelectedLoc(loc);
              if (!localityName) setLocalityName(loc.city);
              if (!city) setCity(loc.city);
              if (!postalCode) setPostalCode(loc.postalCode || '');
            }}
            title="Locality Approximate Centroid"
            confirmButtonText="Save Locality Centroid"
          />
        </div>

        {message && (
          <div className="rounded-lg bg-brand-50 p-3 text-xs text-brand-800 font-medium">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{submitting ? 'Submitting...' : 'Submit Verification & Locality'}</span>
        </button>
      </form>
    </div>
  );
}
