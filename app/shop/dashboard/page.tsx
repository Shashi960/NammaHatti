'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types/order';
import { Shop } from '@/types/shop';
import { Badge } from '@/components/ui/Badge';
import {
  Store,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';

export default function ShopDashboardPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Fetch current user's shop
      const shopRes = await fetch('/api/shops?all=true');
      const shopData = await shopRes.json();
      const myShop = shopData.shops?.find((s: any) => s.ownerId === user?.userId);

      if (myShop) {
        setShop(myShop);
        // Fetch orders for this shop
        const ordRes = await fetch(`/api/orders`);
        const ordData = await ordRes.json();
        if (ordData.orders) {
          setOrders(ordData.orders);
        }
      }
    } catch (err) {
      console.error('Failed to load shop dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note: `Status updated by merchant to ${nextStatus}` }),
      });
      if (res.ok) {
        await loadDashboard();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || user.role !== 'SHOP') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 space-y-3">
        <Store className="h-10 w-10 text-slate-400" />
        <p className="text-slate-600 font-semibold text-sm">Merchant account required</p>
        <Link href="/login" className="text-xs font-semibold text-brand-600 underline">
          Sign In as Shop Merchant
        </Link>
      </div>
    );
  }

  if (!shop && !loading) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center space-y-4">
        <Store className="mx-auto h-12 w-12 text-brand-600" />
        <h2 className="text-xl font-bold text-slate-900">No Store Registered Yet</h2>
        <p className="text-xs text-slate-500">Register your business details and location to start accepting orders.</p>
        <Link
          href="/shop/setup"
          className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow"
        >
          Setup Business Now →
        </Link>
      </div>
    );
  }

  // Dashboard Metrics
  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING');
  const preparingOrders = orders.filter((o) => ['SHOP_CONFIRMED', 'PREPARING'].includes(o.orderStatus));
  const readyOrders = orders.filter((o) => o.orderStatus === 'READY_FOR_PICKUP');
  const completedOrders = orders.filter((o) => o.orderStatus === 'COMPLETED');
  const totalSales = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {shop?.businessName}
            </h1>
            {shop?.verificationStatus === 'VERIFIED' ? (
              <Badge type="verified-shop" />
            ) : (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                Status: {shop?.verificationStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Merchant Operations Portal · {shop?.address}, {shop?.location.city}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/shop/products"
            className="flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Gross Sales</span>
          <p className="text-2xl font-black text-slate-900">₹{totalSales}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{completedOrders.length} completed orders</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-amber-900">Pending Acceptance</span>
          <p className="text-2xl font-black text-amber-950">{pendingOrders.length}</p>
          <span className="text-[10px] text-amber-700">Requires confirmation</span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-blue-900">Preparing & Packing</span>
          <p className="text-2xl font-black text-blue-950">{preparingOrders.length}</p>
          <span className="text-[10px] text-blue-700">In fulfillment</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-emerald-900">Ready for Pickup</span>
          <p className="text-2xl font-black text-emerald-950">{readyOrders.length}</p>
          <span className="text-[10px] text-emerald-700">Open for route matching</span>
        </div>
      </div>

      {/* Incoming Orders Manager */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live Order Fulfillment Queue</h3>
            <p className="text-xs text-slate-500">Confirm, pack, and release items for pooled traveller pickup</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">{orders.length} Total Orders</span>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.map((ord) => (
            <div key={ord._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
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

                <div className="text-xs text-slate-700 font-medium">
                  {ord.items.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                </div>

                <div className="text-[11px] text-slate-500">
                  Customer: <span className="font-semibold text-slate-700">{ord.customerName}</span> · Dropoff: {ord.deliveryLocation.city}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="font-bold text-sm text-slate-900 mr-3">₹{ord.subtotal}</span>

                {ord.orderStatus === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord._id, 'SHOP_CONFIRMED')}
                    disabled={updatingId === ord._id}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                  >
                    Accept Order
                  </button>
                )}

                {ord.orderStatus === 'SHOP_CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord._id, 'PREPARING')}
                    disabled={updatingId === ord._id}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Start Packing
                  </button>
                )}

                {ord.orderStatus === 'PREPARING' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord._id, 'READY_FOR_PICKUP')}
                    disabled={updatingId === ord._id}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Mark Ready for Pickup
                  </button>
                )}

                {ord.orderStatus === 'READY_FOR_PICKUP' && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Awaiting Traveller Pickup
                  </span>
                )}

                {['TRAVELLER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(ord.orderStatus) && (
                  <div className="text-[11px] text-slate-600 font-medium">
                    Traveller: <span className="font-bold text-slate-900">{ord.travellerName || 'Assigned'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No orders received yet today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
