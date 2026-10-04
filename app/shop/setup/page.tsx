'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { Location, createLocation } from '@/types/location';
import { Store, Loader2, Clock, Mail, Phone, DollarSign } from 'lucide-react';

export default function ShopSetupPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('Grocery & Essentials');
  const [description, setDescription] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);

  const [location, setLocation] = useState<Location>(
    createLocation({
      formattedAddress: 'Main Bazaar Road, Sector 1, City Center',
      latitude: 12.9716,
      longitude: 77.5946,
      city: 'Metro Alpha',
      district: 'Central District',
    })
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactName,
          phone,
          email,
          category,
          description,
          address: location.formattedAddress,
          openingTime,
          closingTime,
          minOrderAmount: Number(minOrderAmount),
          location,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to setup shop');
        setLoading(false);
        return;
      }

      await refreshUser();
      router.push('/shop/dashboard');
    } catch (err) {
      setError('An error occurred during shop setup');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
          <Store className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Register Your Local Business
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Take your brick-and-mortar storefront online. Orders will be collected by verified route travellers.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Business / Store Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Hardware & Electricals"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            >
              <option value="Grocery & Essentials">Grocery & Essentials</option>
              <option value="Bakery & Snacks">Bakery & Snacks</option>
              <option value="Electrical Supplies">Electrical Supplies</option>
              <option value="Plumbing & Pipes">Plumbing & Pipes</option>
              <option value="Hardware & Tools">Hardware & Tools</option>
              <option value="Automobile & Spares">Automobile & Spares</option>
              <option value="Clothing & Textiles">Clothing & Textiles</option>
              <option value="Mobile & Electronics">Mobile & Electronics</option>
              <option value="Stationery & Books">Stationery & Books</option>
              <option value="Agriculture & Farm">Agriculture & Farm</option>
              <option value="General & Others">General & Others</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person Name</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Business Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your products and specialties..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Opening Time</label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Closing Time</label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Min. Order (₹)</label>
            <input
              type="number"
              min={0}
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              placeholder="0 for none"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location Picker */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-900">
            Pinpoint Store Location on Map (Required for Route Matching)
          </label>
          <LocationPicker
            initialLocation={location}
            onConfirm={(loc) => setLocation(loc)}
            title="Set Shop Physical Coordinates"
            confirmButtonText="Save Shop Coordinates"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{loading ? 'Registering Shop...' : 'Complete Registration & Open Dashboard'}</span>
        </button>
      </form>
    </div>
  );
}
