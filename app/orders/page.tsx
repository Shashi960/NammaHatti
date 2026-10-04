'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, ArrowRight, Clock, Store, MapPin, KeyRound } from 'lucide-react';

export default function OrdersListPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') {
      return !['COMPLETED', 'CANCELLED', 'FAILED', 'REFUNDED'].includes(o.orderStatus);
    }
    if (filter === 'completed') {
      return o.orderStatus === 'COMPLETED';
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Track live packages, pooled routes, and delivery OTP codes</p>
        </div>

        {/* Status Filters */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'all' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'active' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'completed' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900">{order.orderNumber}</span>
                <span className="text-xs text-slate-400 ml-2">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  type={order.orderStatus.toLowerCase().replace(/_/g, '-') as any}
                  customLabel={order.orderStatus.replace(/_/g, ' ')}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-900">
                  <Store className="h-4 w-4 text-brand-600" />
                  <span>{order.shopName}</span>
                </div>

                <div className="text-xs text-slate-600">
                  {order.items.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>Destination: {order.deliveryLocation.formattedAddress}</span>
                </div>
              </div>

              {/* Delivery OTP Badge for customer */}
              {order.deliveryOtp && order.orderStatus !== 'COMPLETED' && (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 flex flex-col justify-center items-center text-center sm:w-44">
                  <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                    Delivery OTP
                  </span>
                  <span className="text-xl font-black text-amber-900 tracking-widest my-0.5">
                    {order.deliveryOtp}
                  </span>
                  <span className="text-[9px] text-amber-700">Give to traveller on arrival</span>
                </div>
              )}

              <div className="flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-t-0 pt-3 sm:pt-0 gap-2">
                <span className="text-base font-extrabold text-slate-900">₹{order.total}</span>
                <Link
                  href={`/orders/${order._id}`}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center space-x-1"
                >
                  <span>Track Order</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold text-slate-800">No orders found in this view</p>
            <Link href="/shops" className="text-xs font-semibold text-brand-600 hover:underline mt-2 inline-block">
              Start shopping nearby shops →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
