'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RouteMap } from '@/components/maps/RouteMap';
import { Order } from '@/types/order';
import { RouteMatchExplanation } from '@/services/RouteMatchingService';
import {
  Car,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  ArrowRight,
  Loader2,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function TripMatchesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [compatibleOrders, setCompatibleOrders] = useState<Order[]>([]);
  const [explanations, setExplanations] = useState<RouteMatchExplanation[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formingPool, setFormingPool] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/traveller/trips/${params.id}/matches`);
      const data = await res.json();
      if (data.trip) {
        setTrip(data.trip);
        setCompatibleOrders(data.compatibleOrders || []);
        setExplanations(data.explanations || []);
        // Select all compatible orders by default
        setSelectedOrderIds((data.compatibleOrders || []).map((o: any) => o._id));
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Failed to fetch route matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [params.id]);

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter((id) => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const handleCreateRoutePool = async () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one compatible order to form a route pool');
      return;
    }

    setFormingPool(true);
    setError('');

    try {
      const res = await fetch('/api/traveller/route-pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: params.id,
          orderIds: selectedOrderIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create route pool');
        setFormingPool(false);
        return;
      }

      router.push(`/traveller/route-pools/${data.routePool._id}`);
    } catch (err: any) {
      setError('An error occurred forming route pool');
      setFormingPool(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 space-y-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-route-600" />
        <span className="text-xs font-semibold">Running deterministic route matching...</span>
      </div>
    );
  }

  const totalEstimatedEarnings = compatibleOrders
    .filter((o) => selectedOrderIds.includes(o._id))
    .reduce((sum, o) => sum + (o.travellerEarnings || 0), 0);

  const totalPackages = compatibleOrders
    .filter((o) => selectedOrderIds.includes(o._id))
    .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-route-100 px-2 py-0.5 text-xs font-bold text-route-900">
              Trip Route
            </span>
            <span className="text-xs text-slate-400">Date: {trip.travelDate} · Depart: {trip.departureTime}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {trip.origin.city} ➔ {trip.destination.city}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capacity: {trip.maxPackageCapacity} packages · Max Weight: {trip.maxWeightKg} kg
          </p>
        </div>

        <Link
          href="/traveller/dashboard"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel & Return to Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {/* Visual Route Map */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-900">Journey Path & Waypoint Overview</h3>
        <RouteMap
          origin={trip.origin}
          destination={trip.destination}
          height="300px"
        />
      </div>

      {/* Matching Results & Selection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Compatible Orders */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Compatible Orders for Route Pooling ({compatibleOrders.length})
            </h3>
            <span className="text-xs text-slate-500">
              {selectedOrderIds.length} of {compatibleOrders.length} selected
            </span>
          </div>

          <div className="space-y-3">
            {compatibleOrders.map((ord) => {
              const isSelected = selectedOrderIds.includes(ord._id);
              return (
                <div
                  key={ord._id}
                  onClick={() => toggleSelectOrder(ord._id)}
                  className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                    isSelected
                      ? 'border-route-500 bg-route-50/40 ring-1 ring-route-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(ord._id)}
                        className="mt-1 h-4 w-4 rounded text-route-600 focus:ring-route-500"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800">
                            {ord.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800">
                          Pickup: {ord.shopName} ({ord.shopLocation.city})
                        </p>

                        <p className="text-xs text-slate-500">
                          Deliver to: {ord.deliveryLocation.formattedAddress}
                        </p>

                        <div className="text-[11px] text-slate-600 pt-1">
                          Items: {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-route-700">
                        +₹{ord.travellerEarnings}
                      </span>
                      <span className="block text-[10px] text-slate-400">your payout</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {compatibleOrders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                <Car className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="font-semibold text-slate-800">No compatible orders ready right now</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Orders must be marked READY_FOR_PICKUP by shops and fall within your origin, destination, and verified locality radius.
                </p>
              </div>
            )}
          </div>

          {/* Explainable Matching Criteria (Prompt Section 8 requirement) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="h-4 w-4 text-brand-600" />
              <span>Matching Rule Explanations & Audit</span>
            </h4>
            <div className="space-y-2 text-xs">
              {explanations.map((exp, i) => (
                <div key={i} className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Order #{exp.orderNumber || 'Evaluated Order'}</span>
                    <span className={exp.matched ? 'text-emerald-600' : 'text-rose-600'}>
                      {exp.matched ? '✓ MATCHED' : '✕ INCOMPATIBLE'}
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-500 space-y-0.5">
                    {exp.reasons.map((r, ri) => (
                      <li key={ri}>• {r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pool Formation Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 sticky top-20">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Route Pool Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Orders:</span>
                <span className="font-bold text-slate-900">{selectedOrderIds.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Packages:</span>
                <span className="font-bold text-slate-900">{totalPackages} of {trip.maxPackageCapacity}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Detour Time:</span>
                <span className="font-semibold text-slate-700">~{selectedOrderIds.length * 8 + 5} mins</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Route Earnings:</span>
                <span className="text-base text-route-600 font-black">₹{totalEstimatedEarnings}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoutePool}
              disabled={formingPool || selectedOrderIds.length === 0}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-route-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-route-700 transition-colors disabled:opacity-50"
            >
              {formingPool ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Constructing Route Pool...</span>
                </>
              ) : (
                <>
                  <span>Create Route Pool ({selectedOrderIds.length} Orders)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
