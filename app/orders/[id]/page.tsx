'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import { DeliveryMap } from '@/components/maps/DeliveryMap';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  KeyRound,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

const LIFECYCLE_STEPS: OrderStatus[] = [
  'PENDING',
  'SHOP_CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'ROUTE_MATCHING',
  'TRAVELLER_ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setActionError('');
    try {
      const res = await fetch(`/api/orders/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', note: 'Cancelled by customer' }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      } else {
        setActionError(data.error || 'Failed to cancel order');
      }
    } catch (e) {
      setActionError('Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Loading order details...
      </div>
    );
  }

  const currentStepIdx = LIFECYCLE_STEPS.indexOf(order.orderStatus);
  const canCancel = ['PENDING', 'SHOP_CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(order.orderStatus);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/orders" className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleString()} · {order.deliveryType} Delivery
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            type={order.orderStatus.toLowerCase().replace(/_/g, '-') as any}
            customLabel={order.orderStatus.replace(/_/g, ' ')}
          />
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          {actionError}
        </div>
      )}

      {/* DELIVERY OTP CALLOUT (CRITICAL SECURITY FEATURE) */}
      {order.deliveryOtp && order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-md text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <KeyRound className="h-4 w-4" />
            <span>Secure Delivery Confirmation Code</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-950 tracking-widest my-2">
            {order.deliveryOtp}
          </div>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            Provide this 6-digit code to the verified traveller in person upon receiving your package to confirm delivery.
          </p>
        </div>
      )}

      {/* STATE MACHINE PIPELINE VISUALIZER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Real-Time Delivery & Route Progress
        </h3>

        <div className="relative py-2">
          {/* Stepper Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 text-center">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPastOrCurrent = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className="flex flex-col items-center space-y-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                        : isPastOrCurrent
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] leading-tight ${
                      isCurrent
                        ? 'font-bold text-brand-700'
                        : isPastOrCurrent
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DELIVERY MAP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Route Geography: Shop Pickup ➔ Destination Drop</span>
        </div>
        <DeliveryMap
          shopLocation={order.shopLocation}
          deliveryLocation={order.deliveryLocation}
          height="280px"
        />
      </div>

      {/* Assigned Traveller & Shop Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Shop Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
            <Store className="h-4 w-4 text-brand-600" />
            <span>Pickup Merchant</span>
          </div>
          <p className="font-bold text-sm text-slate-900">{order.shopName}</p>
          <p className="text-xs text-slate-500">{order.shopLocation.formattedAddress}</p>
        </div>

        {/* Traveller Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
            <Car className="h-4 w-4 text-route-600" />
            <span>Assigned Route Traveller</span>
          </div>
          {order.travellerName ? (
            <div>
              <p className="font-bold text-sm text-slate-900">{order.travellerName}</p>
              <p className="text-xs text-emerald-600 font-semibold">✓ Verified Traveller on Route</p>
              {order.routePoolId && (
                <p className="text-[11px] text-slate-500 mt-1">Route Pool: {order.routePoolId.substring(0, 8)}</p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-medium text-xs text-amber-700">Matching with Commuter Trips</p>
              <p className="text-[11px] text-slate-500">
                Finding a verified traveller heading toward your delivery locality.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items & Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Package Contents
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {order.items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <div>
                <p className="font-semibold text-slate-900">{it.name}</p>
                <p className="text-slate-500">
                  Quantity: {it.quantity} {it.unit} · {it.weightKg} kg
                </p>
              </div>
              <span className="font-bold text-slate-900">₹{it.subtotal}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Items Subtotal:</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee:</span>
            <span>₹{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Platform Fee:</span>
            <span>₹{order.platformFee}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Paid ({order.paymentMethod}):</span>
            <span className="text-brand-700">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Status Audit History
        </h3>
        <ul className="space-y-2 text-xs">
          {order.statusHistory.map((hist, i) => (
            <li key={i} className="flex items-start space-x-2 text-slate-600">
              <span className="font-bold text-slate-800">{hist.status}:</span>
              <span>{hist.note || 'Status updated'}</span>
              <span className="text-slate-400 text-[11px] ml-auto">
                {new Date(hist.timestamp).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action controls (Cancel / Report) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        <Link
          href={`/help?orderId=${order._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-brand-600 ml-auto"
        >
          Need help with this order? Report Problem →
        </Link>
      </div>
    </div>
  );
}
