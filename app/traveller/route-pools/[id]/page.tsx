'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { RouteMap } from '@/components/maps/RouteMap';
import { RoutePool } from '@/types/routePool';
import { Badge } from '@/components/ui/Badge';
import {
  Car,
  MapPin,
  CheckCircle,
  Package,
  Clock,
  DollarSign,
  Store,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function RoutePoolDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [pool, setPool] = useState<RoutePool | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [updatingStop, setUpdatingStop] = useState<string | null>(null);

  // OTP Verification inputs per order
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadPool = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/traveller/route-pools`);
      const data = await res.json();
      const current = data.routePools?.find((p: any) => p._id === params.id);
      if (current) {
        setPool(current);
        setOrders(current.orders || []);
      }
    } catch (err) {
      console.error('Failed to load pool:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPool();
  }, [params.id]);

  const handleAcceptPool = async () => {
    setAccepting(true);
    setError('');

    try {
      const res = await fetch(`/api/traveller/route-pools/${params.id}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to accept route pool');
        setAccepting(false);
        return;
      }
      await loadPool();
    } catch (err: any) {
      setError('An error occurred accepting route pool');
    } finally {
      setAccepting(false);
    }
  };

  const handleMarkStopPickedUp = async (shopId: string) => {
    setUpdatingStop(shopId);
    try {
      const res = await fetch(`/api/traveller/route-pools/${params.id}/pickup-stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId }),
      });
      if (res.ok) {
        await loadPool();
      }
    } catch (err) {
      console.error('Failed to mark pickup stop:', err);
    } finally {
      setUpdatingStop(null);
    }
  };

  const handleVerifyOtp = async (orderId: string) => {
    const code = otpInputs[orderId];
    if (!code || code.length !== 6) {
      setOtpErrors({ ...otpErrors, [orderId]: 'Please enter a 6-digit code' });
      return;
    }

    setVerifyingOrder(orderId);
    setOtpErrors({ ...otpErrors, [orderId]: '' });

    try {
      const res = await fetch(`/api/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpErrors({ ...otpErrors, [orderId]: data.error || 'Incorrect delivery code' });
      } else {
        await loadPool();
      }
    } catch (err) {
      setOtpErrors({ ...otpErrors, [orderId]: 'Verification request failed' });
    } finally {
      setVerifyingOrder(null);
    }
  };

  if (loading || !pool) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Loading route pool details...
      </div>
    );
  }

  const isAccepted = pool.status !== 'OPEN';
  const allStopsPickedUp = pool.pickupStops.every((s) => s.isPickedUp);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="rounded bg-route-100 px-2.5 py-0.5 text-xs font-bold text-route-900">
              {pool.poolCode}
            </span>
            <Badge
              type={pool.status.toLowerCase() as any}
              customLabel={`Pool: ${pool.status}`}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/traveller/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">
              {pool.origin.city} ➔ {pool.destination.city}
            </h1>
            <p className="text-xs text-slate-500">
              Origin: {pool.origin.formattedAddress} · Destination: {pool.destination.formattedAddress}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Packages</span>
              <p className="text-base font-bold text-slate-900">{pool.packageCount}</p>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Extra Detour</span>
              <p className="text-base font-bold text-slate-900">+{pool.estimatedExtraTimeMinutes} min</p>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-route-700 font-semibold uppercase">Earnings</span>
              <p className="text-base font-extrabold text-route-600">₹{pool.estimatedEarnings}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Accept Route Pool Button if OPEN */}
        {pool.status === 'OPEN' && (
          <button
            type="button"
            onClick={handleAcceptPool}
            disabled={accepting}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-route-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-route-700 transition-colors disabled:opacity-50"
          >
            {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{accepting ? 'Locking Route...' : 'ACCEPT ROUTE POOL →'}</span>
          </button>
        )}
      </div>

      {/* Route Map */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-900">Waypoints & Intermediate Pickup Stops</h3>
        <RouteMap
          origin={pool.origin}
          destination={pool.destination}
          pickupStops={pool.pickupStops}
          height="320px"
        />
      </div>

      {/* PICKUP CHECKLIST (STOPS) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-sm text-slate-900">
            1. Pickup Checklist ({pool.pickupStops.length} Stops)
          </h3>
          <span className="text-xs text-slate-500">
            {pool.pickupStops.filter((s) => s.isPickedUp).length} of {pool.pickupStops.length} collected
          </span>
        </div>

        <div className="space-y-3">
          {pool.pickupStops.map((stop, idx) => (
            <div
              key={stop.shopId}
              className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                stop.isPickedUp ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-900">{stop.shopName}</span>
                  {stop.isPickedUp && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800">
                      ✓ Picked Up
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 pl-7">{stop.shopAddress}</p>
                <p className="text-[11px] text-slate-600 pl-7 font-medium">
                  {stop.packageCount} Package(s) to collect for Order(s): {stop.orderIds.join(', ')}
                </p>
              </div>

              {isAccepted && !stop.isPickedUp && (
                <button
                  type="button"
                  onClick={() => handleMarkStopPickedUp(stop.shopId)}
                  disabled={updatingStop === stop.shopId}
                  className="rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors whitespace-nowrap"
                >
                  {updatingStop === stop.shopId ? 'Updating...' : 'Mark Picked Up'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* DELIVERY HANDOFF & OTP VERIFICATION CHECKLIST */}
      {isAccepted && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">
              2. Delivery Hand-Off & Customer OTP Verification
            </h3>
            <span className="text-xs text-slate-500">
              Enter customer&apos;s 6-digit code upon arrival
            </span>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => {
              const isDelivered = ord.orderStatus === 'COMPLETED' || ord.orderStatus === 'DELIVERED';
              return (
                <div
                  key={ord._id}
                  className={`rounded-xl border p-4 space-y-3 ${
                    isDelivered ? 'bg-green-50/50 border-green-200' : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">Order #{ord.orderNumber}</span>
                        <Badge
                          type={ord.orderStatus.toLowerCase().replace(/_/g, '-') as any}
                          customLabel={ord.orderStatus.replace(/_/g, ' ')}
                        />
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        Customer: {ord.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Deliver to: {ord.deliveryLocation.formattedAddress}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-route-700">₹{ord.travellerEarnings}</span>
                      <span className="block text-[10px] text-slate-400">your earnings</span>
                    </div>
                  </div>

                  {/* OTP Input Form for Traveller */}
                  {!isDelivered ? (
                    <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold">
                        <KeyRound className="h-4 w-4 text-brand-600" />
                        <span>Enter Customer&apos;s 6-Digit Delivery OTP:</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInputs[ord._id] || ''}
                          onChange={(e) =>
                            setOtpInputs({ ...otpInputs, [ord._id]: e.target.value.replace(/\D/g, '') })
                          }
                          placeholder="••••••"
                          className="w-36 rounded-lg border border-slate-300 p-2 text-center text-sm font-black tracking-widest text-slate-900 focus:border-brand-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyOtp(ord._id)}
                          disabled={verifyingOrder === ord._id}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {verifyingOrder === ord._id ? 'Verifying...' : 'Verify & Complete Delivery'}
                        </button>
                      </div>

                      {otpErrors[ord._id] && (
                        <p className="text-[11px] font-semibold text-rose-600">{otpErrors[ord._id]}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 p-2.5 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>✓ Delivery Confirmed! Payout of ₹{ord.travellerEarnings} credited to wallet.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
