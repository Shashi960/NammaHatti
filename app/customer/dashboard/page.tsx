'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Order } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import {
  ShoppingBag,
  MapPin,
  Clock,
  KeyRound,
  ArrowRight,
  Store,
  Compass,
  AlertCircle,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadOrders();
  }, [user]);

  const activeOrders = orders.filter(
    (o) => !['COMPLETED', 'CANCELLED', 'FAILED', 'REFUNDED'].includes(o.orderStatus)
  );

  const completedOrders = orders.filter((o) => o.orderStatus === 'COMPLETED');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active Locality: <span className="font-semibold text-slate-800">{currentLocation.city}</span> · {currentLocation.formattedAddress}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/shops"
            className="flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 transition-colors"
          >
            <Store className="h-4 w-4" />
            <span>Discover Shops</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Active Shipments</span>
          <p className="text-2xl font-black text-brand-700">{activeOrders.length}</p>
          <span className="text-[10px] text-slate-400">In route fulfillment</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Completed Orders</span>
          <p className="text-2xl font-black text-slate-900">{completedOrders.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Locally fulfilled</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Spent</span>
          <p className="text-2xl font-black text-slate-900">₹{totalSpent}</p>
          <span className="text-[10px] text-slate-400">Direct merchant commerce</span>
        </div>
      </div>

      {/* Active Orders Section with prominent Delivery OTP */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Live Active Orders ({activeOrders.length})</h2>

        <div className="space-y-4">
          {activeOrders.map((ord) => (
            <div
              key={ord._id}
              className="rounded-2xl border-2 border-brand-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                  <Badge
                    type={ord.orderStatus.toLowerCase().replace(/_/g, '-') as any}
                    customLabel={ord.orderStatus.replace(/_/g, ' ')}
                  />
                  <span className="text-[11px] text-slate-400">
                    {new Date(ord.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800">
                  Shop: {ord.shopName}
                </p>

                <p className="text-xs text-slate-600">
                  Items: {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                </p>

                <p className="text-[11px] text-slate-500">
                  Destination: {ord.deliveryLocation.formattedAddress}
                </p>
              </div>

              {/* Delivery OTP Badge */}
              {ord.deliveryOtp && (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 flex flex-col justify-center items-center text-center sm:w-44 shrink-0">
                  <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider flex items-center space-x-1">
                    <KeyRound className="h-3 w-3" />
                    <span>Delivery OTP</span>
                  </span>
                  <span className="text-2xl font-black text-amber-950 tracking-widest my-1">
                    {ord.deliveryOtp}
                  </span>
                  <span className="text-[9px] text-amber-700">Give to traveller on handoff</span>
                </div>
              )}

              <div className="flex sm:flex-col justify-between sm:justify-center items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-base font-extrabold text-slate-900">₹{ord.total}</span>
                <Link
                  href={`/orders/${ord._id}`}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 transition-colors flex items-center space-x-1"
                >
                  <span>Track Live</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}

          {activeOrders.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              No active shipments in transit right now.
            </div>
          )}
        </div>
      </div>

      {/* Recent Completed Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Past Orders</h2>
          <Link href="/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View All Orders →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 text-xs">
            {completedOrders.slice(0, 5).map((ord) => (
              <div key={ord._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                  <span className="text-slate-400 ml-2">from {ord.shopName}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ord.items.length} item(s) · Delivered {new Date(ord.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-slate-900">₹{ord.total}</span>
                  <Link
                    href={`/orders/${ord._id}`}
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            {completedOrders.length === 0 && !loading && (
              <div className="p-6 text-center text-slate-400 text-xs">
                No past completed orders yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
