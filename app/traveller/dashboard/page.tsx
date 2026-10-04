'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TravellerTrip } from '@/types/traveller';
import { RoutePool } from '@/types/routePool';
import { Badge } from '@/components/ui/Badge';
import {
  Car,
  Plus,
  DollarSign,
  Package,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function TravellerDashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TravellerTrip[]>([]);
  const [routePools, setRoutePools] = useState<RoutePool[]>([]);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // Trips
      const tripRes = await fetch('/api/traveller/trips');
      const tripData = await tripRes.json();
      if (tripData.trips) setTrips(tripData.trips);

      // Route Pools
      const poolRes = await fetch('/api/traveller/route-pools');
      const poolData = await poolRes.json();
      if (poolData.routePools) setRoutePools(poolData.routePools);

      // KYC
      const kycRes = await fetch('/api/traveller/kyc');
      const kycData = await kycRes.json();
      if (kycData.kyc) setKycStatus(kycData);
    } catch (err) {
      console.error('Failed to load traveller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const isVerified = kycStatus?.kyc?.status === 'VERIFIED';

  // Earnings calculations
  const totalEarnings = routePools
    .filter((p) => p.status === 'COMPLETED' || p.status === 'IN_PROGRESS' || p.status === 'ACCEPTED')
    .reduce((sum, p) => sum + p.estimatedEarnings, 0);

  const activePools = routePools.filter((p) => ['ACCEPTED', 'IN_PROGRESS'].includes(p.status));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Traveller Route Hub
            </h1>
            {isVerified ? (
              <Badge type="verified-traveller" />
            ) : (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                KYC: {kycStatus?.kyc?.status || 'PENDING'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pool small packages on your planned travel routes and earn transparent payouts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/traveller/verification"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Locality & KYC
          </Link>
          <Link
            href="/traveller/trips/new"
            className="flex items-center space-x-1.5 rounded-lg bg-route-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-route-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Declare New Journey</span>
          </Link>
        </div>
      </div>

      {/* KYC Reminder Banner if not verified */}
      {!isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>KYC verification is required before accepting customer orders.</strong> Complete identity and locality verification.
            </span>
          </div>
          <Link
            href="/traveller/verification"
            className="rounded bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-700"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Route Earnings</span>
          <p className="text-2xl font-black text-slate-900">₹{totalEarnings}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Credited upon OTP verification</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Declared Trips</span>
          <p className="text-2xl font-black text-slate-900">{trips.length}</p>
          <span className="text-[10px] text-slate-400">Planned routes</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Active Deliveries</span>
          <p className="text-2xl font-black text-slate-900">{activePools.length}</p>
          <span className="text-[10px] text-route-600 font-semibold">In progress</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Locality Radius</span>
          <p className="text-2xl font-black text-slate-900">
            {kycStatus?.locality?.radiusKm || 5} km
          </p>
          <span className="text-[10px] text-slate-500 truncate">
            {kycStatus?.locality?.city || 'Default radius'}
          </span>
        </div>
      </div>

      {/* Declared Trips & Compatible Matching */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Declared Journeys</h2>
          <Link
            href="/traveller/trips/new"
            className="text-xs font-semibold text-route-600 hover:text-route-700"
          >
            + New Trip
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((t) => (
            <div
              key={t._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-route-400 transition-all space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  {t.travelDate} · Depart: {t.departureTime}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {t.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-900">
                  {t.origin.city} ({t.origin.formattedAddress})
                </p>
                <p className="text-slate-400">↓ heading to</p>
                <p className="font-semibold text-slate-900">
                  {t.destination.city} ({t.destination.formattedAddress})
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Capacity: {t.maxPackageCapacity} pkgs · {t.maxWeightKg} kg</span>
                <Link
                  href={`/traveller/trips/${t._id}/matches`}
                  className="rounded-lg bg-route-50 px-3 py-1.5 text-xs font-bold text-route-700 hover:bg-route-100 transition-colors flex items-center space-x-1"
                >
                  <span>Find Orders</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}

          {trips.length === 0 && !loading && (
            <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <Car className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="font-semibold text-slate-800">No journeys declared yet</p>
              <p className="text-xs text-slate-400 mt-1">Declare your commute to discover route-pooled packages</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Route Pools */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Route Pools & Deliveries</h2>

        <div className="space-y-3">
          {routePools.map((pool) => (
            <div
              key={pool._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{pool.poolCode}</span>
                  <Badge
                    type={pool.status.toLowerCase() as any}
                    customLabel={pool.status}
                  />
                </div>
                <p className="font-bold text-sm text-slate-900">
                  {pool.origin.city} ➔ {pool.destination.city}
                </p>
                <p className="text-xs text-slate-500">
                  {pool.packageCount} Package(s) across {pool.pickupStops.length} Pickup Stops
                </p>
              </div>

              <div className="flex sm:flex-col justify-between sm:justify-center items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-base font-extrabold text-route-600">
                  ₹{pool.estimatedEarnings}
                </span>
                <Link
                  href={`/traveller/route-pools/${pool._id}`}
                  className="rounded-lg bg-route-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-route-700 transition-colors"
                >
                  View Route & Checklist →
                </Link>
              </div>
            </div>
          ))}

          {routePools.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
              No route pools formed yet. Declare a trip and find matching orders to pool.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
