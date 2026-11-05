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
  Plus,
  Minus,
  Zap,
  CreditCard,
  Banknote,
  Tag,
} from 'lucide-react';

export default function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, subtotal, getShopsInCart } = useCart();
  const { currentLocation, setCurrentLocation } = useLocation();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DEMO_ONLINE');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const shopsInCart = getShopsInCart();

  // Pricing calculations
  const baseDeliveryPerShop = deliveryType === 'EXPRESS' ? 70 : 35;
  const deliveryFee = baseDeliveryPerShop * (shopsInCart.length || 1);
  const platformFee = Math.round(subtotal * 0.05); // 5%
  const grandTotal = subtotal + deliveryFee + platformFee;
  const totalOriginalPrice = Math.round(subtotal * 1.35);
  const totalSavings = totalOriginalPrice - subtotal;

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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        setPlacingOrder(false);
        return;
      }

      clearCart();
      const firstOrderId = data.orderIds?.[0];
      if (firstOrderId) {
        router.push(`/orders/${firstOrderId}`);
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#f1f2f4] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-md border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="h-20 w-20 bg-teal-50 text-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="text-lg font-bold text-[#212121]">Your Cart is Empty!</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Explore items from verified neighbourhood shops and get them delivered along commuter routes.
          </p>
          <Link
            href="/search"
            className="w-full inline-block bg-[#0f766e] hover:bg-teal-700 text-white font-bold py-3 rounded-full text-xs shadow-sm transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Delivery Address & Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* 1. Delivery Address Header */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <MapPin className="h-4 w-4 text-[#0f766e] shrink-0" />
                <div className="leading-tight">
                  <span className="text-slate-500 font-medium">Deliver to: </span>
                  <strong className="text-slate-900 font-bold">
                    {user?.name || 'Customer'} - {currentLocation.postalCode || '560001'}
                  </strong>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md mt-0.5">
                    {currentLocation.formattedAddress}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="text-[#0f766e] border border-[#0f766e] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-teal-50 shrink-0 transition-colors"
              >
                Change
              </button>
            </div>

            {/* 2. Cart Items Container */}
            <div className="bg-white rounded border border-slate-200/80 shadow-sm divide-y divide-slate-100">
              <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Cart Items ({items.length})
                </span>
                <span className="text-slate-500">
                  From {shopsInCart.length} Local {shopsInCart.length === 1 ? 'Shop' : 'Shops'}
                </span>
              </div>

              {items.map((item) => {
                const itemOriginal = Math.round(item.price * 1.35);

                return (
                  <div key={item.productId} className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-start">
                    {/* Item Image */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-50 rounded border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                      <img
                        src={item.imageUrl || '/placeholder-product.svg'}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold truncate">
                        Seller: {item.shopName}
                      </p>
                      <h3 className="font-semibold text-xs sm:text-sm text-[#212121] line-clamp-1">
                        {item.name}
                      </h3>

                      {/* Pricing */}
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-sm sm:text-base font-bold text-[#212121]">
                          ₹{item.price * item.quantity}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{itemOriginal * item.quantity}
                        </span>
                        <span className="text-xs font-bold text-[#388e3c]">
                          25% Off
                        </span>
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center border border-slate-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 border-x border-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-xs font-bold text-slate-600 hover:text-rose-600 uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Delivery Method Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5 text-[#0f766e]" />
                <span>Select Delivery Preference</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Standard Route Pooled */}
                <label
                  onClick={() => setDeliveryType('STANDARD')}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryType === 'STANDARD'
                      ? 'border-[#0f766e] bg-teal-50/50 ring-1 ring-[#0f766e]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Standard (Route Pooled)</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Matched with commuters already travelling your way
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'STANDARD'}
                      onChange={() => setDeliveryType('STANDARD')}
                      className="text-[#0f766e] mt-0.5"
                    />
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between font-bold">
                    <span className="text-[#059669]">₹35 per shop</span>
                    <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                      Low Carbon
                    </span>
                  </div>
                </label>

                {/* Express Priority */}
                <label
                  onClick={() => setDeliveryType('EXPRESS')}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryType === 'EXPRESS'
                      ? 'border-[#0f766e] bg-teal-50/50 ring-1 ring-[#0f766e]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Express Delivery</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Priority pool matching with early dispatch
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'EXPRESS'}
                      onChange={() => setDeliveryType('EXPRESS')}
                      className="text-[#0f766e] mt-0.5"
                    />
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between font-bold">
                    <span className="text-slate-800">₹70 per shop</span>
                    <span className="text-[10px] text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                      Priority
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <CreditCard className="h-3.5 w-3.5 text-[#0f766e]" />
                <span>Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  onClick={() => setPaymentMethod('DEMO_ONLINE')}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'DEMO_ONLINE'
                      ? 'border-[#0f766e] bg-teal-50/50 ring-1 ring-[#0f766e]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-[#0f766e]" />
                    <div>
                      <strong className="block font-bold text-slate-900">Demo Online Payment</strong>
                      <span className="text-[10px] text-slate-500">UPI / Cards / NetBanking Simulation</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'DEMO_ONLINE'}
                    onChange={() => setPaymentMethod('DEMO_ONLINE')}
                    className="text-[#0f766e]"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-[#0f766e] bg-teal-50/50 ring-1 ring-[#0f766e]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-4 w-4 text-emerald-600" />
                    <div>
                      <strong className="block font-bold text-slate-900">Cash on Delivery</strong>
                      <span className="text-[10px] text-slate-500">Pay cash upon OTP verification</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-[#0f766e]"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Flipkart Price Details (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded border border-slate-200/80 shadow-sm sticky top-[72px]">
              
              <div className="p-3 sm:p-4 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                  Price Details
                </h3>
              </div>

              <div className="p-3 sm:p-4 space-y-3 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Price ({items.length} items)</span>
                  <span>₹{totalOriginalPrice}</span>
                </div>

                <div className="flex justify-between text-[#388e3c]">
                  <span>Discount</span>
                  <span>- ₹{totalSavings}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Delivery Charges ({shopsInCart.length} shop{shopsInCart.length > 1 ? 's' : ''})</span>
                  <span>₹{deliveryFee}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Platform Fee (5%)</span>
                  <span>₹{platformFee}</span>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between font-black text-sm sm:text-base text-slate-900">
                  <span>Total Amount</span>
                  <span>₹{grandTotal}</span>
                </div>

                <div className="pt-1 text-[#388e3c] font-bold text-xs">
                  You will save ₹{totalSavings} on this order!
                </div>
              </div>

              {/* Desktop Place Order Button */}
              <div className="hidden md:block p-3.5 sm:p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <button
                  onClick={handleCheckout}
                  disabled={placingOrder}
                  className="w-full bg-[#e11d48] hover:bg-rose-700 text-white font-bold py-3.5 px-6 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>PLACE ORDER</span>
                  )}
                </button>
              </div>

              {/* Safe & Secure Guarantee Note */}
              <div className="p-3 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50/50 rounded-b-2xl">
                <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0" />
                <span>Safe and Secure Payments. 100% Authentic Products.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Place Order Bar */}
      <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-[10px] text-slate-400 line-through">₹{totalOriginalPrice}</span>
          <p className="text-base font-black text-slate-900 leading-none">₹{grandTotal}</p>
          <span className="text-[10px] text-[#0f766e] font-semibold">View price details</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={placingOrder}
          className="bg-[#e11d48] hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
        >
          {placingOrder && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>{placingOrder ? 'Processing...' : 'PLACE ORDER'}</span>
        </button>
      </div>

      {/* Change Location Modal */}
      {showLocationModal && (
        <LocationPicker
          initialLocation={currentLocation}
          title="Select Delivery Address"
          onConfirm={(loc) => {
            setCurrentLocation(loc);
            setShowLocationModal(false);
          }}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}
