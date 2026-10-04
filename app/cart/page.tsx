'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { DeliveryType, PaymentMethod } from '@/types/order';
import {
  ShoppingBag,
  Trash2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, subtotal, getShopsInCart } = useCart();
  const { currentLocation, setCurrentLocation } = useLocation();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const shopsInCart = getShopsInCart();

  // Pricing calculations
  const baseDeliveryPerShop = deliveryType === 'EXPRESS' ? 70 : 35;
  const deliveryFee = baseDeliveryPerShop * (shopsInCart.length || 1);
  const platformFee = Math.round(subtotal * 0.05); // 5%
  const grandTotal = subtotal + deliveryFee + platformFee;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (items.length === 0) return;

    setError('');
    setPlacingOrder(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryLocation: currentLocation,
          deliveryType,
          paymentMethod,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        setPlacingOrder(false);
        return;
      }

      // Clear Cart and route to tracking
      clearCart();
      if (data.orders && data.orders.length > 0) {
        router.push(`/orders/${data.orders[0]._id}`);
      } else {
        router.push('/orders');
      }
    } catch (err: any) {
      setError('Checkout error occurred. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore local neighbourhood shops to add authentic local products to your cart.
        </p>
        <Link
          href="/shops"
          className="inline-flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-brand-700"
        >
          <span>Explore Local Shops</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Cart & Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review orders, select delivery route type, and confirm destination
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multi-shop grouped items + Delivery Location */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Location Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Delivery Destination</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Change Pin / Address
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
              <p className="font-semibold text-slate-900">{currentLocation.city}: {currentLocation.formattedAddress}</p>
              {currentLocation.landmark && (
                <p className="text-slate-500 mt-0.5">Landmark: {currentLocation.landmark}</p>
              )}
            </div>
          </div>

          {/* Grouped Items per Shop */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Shipments by Local Shop ({shopsInCart.length} Shops)
            </h3>

            {shopsInCart.map((shopGroup) => (
              <div
                key={shopGroup.shopId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{shopGroup.shopName}</span>
                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      Shop Order #
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Subtotal: ₹{shopGroup.shopSubtotal}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {shopGroup.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between py-3">
                      <div className="space-y-0.5 max-w-[240px]">
                        <h4 className="font-medium text-xs text-slate-900 truncate">{item.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          ₹{item.price} / {item.unit} · {item.weightKg} kg
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center rounded border border-slate-200 bg-slate-50 text-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-2.5 font-semibold text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-xs text-slate-900 w-12 text-right">
                          ₹{item.price * item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Delivery Options, Pricing, Place Order */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Type Option */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Choose Delivery Speed</h3>

            <div className="space-y-2.5">
              {/* Standard */}
              <label
                onClick={() => setDeliveryType('STANDARD')}
                className={`flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all ${
                  deliveryType === 'STANDARD'
                    ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'STANDARD'}
                    onChange={() => setDeliveryType('STANDARD')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">Standard Route Delivery</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800">
                        Pooled Savings
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Matched to compatible commuter route. Cheaper, lower emissions.
                    </p>
                  </div>
                </div>
                <span className="font-bold text-xs text-slate-900">
                  ₹{35 * (shopsInCart.length || 1)}
                </span>
              </label>

              {/* Express */}
              <label
                onClick={() => setDeliveryType('EXPRESS')}
                className={`flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all ${
                  deliveryType === 'EXPRESS'
                    ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'EXPRESS'}
                    onChange={() => setDeliveryType('EXPRESS')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">⚡ Express Priority Delivery</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Priority dispatch with top matching priority and faster handoff.
                    </p>
                  </div>
                </div>
                <span className="font-bold text-xs text-slate-900">
                  ₹{70 * (shopsInCart.length || 1)}
                </span>
              </label>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Payment Option</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex cursor-pointer items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cash on Delivery
              </label>

              <label
                onClick={() => setPaymentMethod('DEMO_ONLINE')}
                className={`flex cursor-pointer items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'DEMO_ONLINE'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Online Pay (Instant)
              </label>
            </div>
          </div>

          {/* Transparent Order Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Transparent Pricing Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center space-x-1">
                  <span>Delivery Fee ({shopsInCart.length} shop shipment{shopsInCart.length > 1 ? 's' : ''}):</span>
                </span>
                <span className="font-semibold text-slate-800">₹{deliveryFee}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Platform Commission (5%):</span>
                <span className="font-semibold text-slate-800">₹{platformFee}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-brand-700">₹{grandTotal}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500 space-y-1">
              <p>• 80% of delivery fee is directly disbursed to the verified route traveller.</p>
              <p>• A 6-digit delivery code will be provided to release package upon arrival.</p>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={placingOrder}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Orders...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Place Order (₹{grandTotal})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-4 space-y-3">
            <LocationPicker
              initialLocation={currentLocation}
              onConfirm={(loc) => {
                setCurrentLocation(loc);
                setShowLocationModal(false);
              }}
              title="Confirm Delivery Address & Coordinates"
              confirmButtonText="Use This Delivery Address"
            />
          </div>
        </div>
      )}
    </div>
  );
}
