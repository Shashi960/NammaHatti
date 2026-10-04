'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Car,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  CheckCircle,
  Truck,
  Users,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { Badge } from '@/components/ui/Badge';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { ShopMap } from '@/components/maps/ShopMap';

export default function HomePage() {
  const { currentLocation } = useLocation();
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.categories) setCategories(catData.categories.slice(0, 8));

        // Load Nearby Shops based on location
        const shopRes = await fetch(
          `/api/shops?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&radius=30`
        );
        const shopData = await shopRes.json();
        if (shopData.shops) setNearbyShops(shopData.shops.slice(0, 6));

        // Load Popular Products
        const prodRes = await fetch(
          `/api/products?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&limit=8`
        );
        const prodData = await prodRes.json();
        if (prodData.products) setPopularProducts(prodData.products);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentLocation]);

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white py-16 sm:py-24 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 rounded-full bg-brand-100/80 px-3.5 py-1 text-xs font-semibold text-brand-900 border border-brand-200">
                <Sparkles className="h-3.5 w-3.5 text-brand-700" />
                <span>Existing Travel + Route-Based Order Pooling</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                SHOP LOCAL. <br />
                <span className="text-brand-600">DELIVER SMARTER.</span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
                Discover authentic local products from verified neighborhood shops and receive them through travellers already commuting on that route.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/shops"
                  className="rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Store className="h-4 w-4" />
                  <span>EXPLORE SHOPS</span>
                </Link>

                <Link
                  href="/register?role=SHOP"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  REGISTER YOUR BUSINESS
                </Link>

                <Link
                  href="/traveller"
                  className="rounded-xl border border-route-300 bg-route-50 px-5 py-3.5 text-sm font-semibold text-route-900 shadow-sm hover:bg-route-100 transition-all flex items-center space-x-1.5"
                >
                  <Car className="h-4 w-4 text-route-600" />
                  <span>TRAVEL & EARN</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-brand-600" />
                  <span>Verified Local Shops</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>KYC Verified Travellers</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <LockBadge />
                  <span>Secure 6-Digit Delivery OTP</span>
                </div>
              </div>
            </div>

            {/* Right Column: Route Pooling Visual Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Live Route Match Demonstration
                    </span>
                    <h3 className="font-bold text-slate-900">How Route Pooling Works</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Active Pool
                  </span>
                </div>

                {/* Diagram */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <div className="h-2 w-2 rounded-full bg-brand-600" />
                      <span className="font-semibold">Commute Origin (Sector A)</span>
                    </div>
                    <span className="text-slate-400">→</span>
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="font-semibold">Destination (Market Hub B)</span>
                    </div>
                  </div>

                  {/* Route Bar */}
                  <div className="relative h-2 w-full rounded-full bg-slate-200">
                    <div className="absolute left-0 top-0 h-2 w-full rounded-full bg-brand-500" />
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="font-medium text-slate-800 mb-1">
                      1 Verified Traveller · 3 Orders Pooled:
                    </p>
                    <ul className="space-y-1 text-slate-500">
                      <li>• Pickup Stop 1: Heritage Hardware (Package #1)</li>
                      <li>• Pickup Stop 2: Green Agro Provisions (Package #2)</li>
                      <li>• Delivery: Destination Area B (Delivery Confirmed via OTP)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Zero unnecessary dispatch trips</span>
                  <span className="font-semibold text-brand-700">Low carbon footprint</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE LOCATION BAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-900 uppercase tracking-wider">
                Current Shopping & Delivery Locality
              </p>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {currentLocation.city}: {currentLocation.formattedAddress}
              </h2>
            </div>
          </div>
          <Link
            href="/shops"
            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-brand-700 border border-brand-300 shadow-sm hover:bg-brand-50 transition-colors"
          >
            Browse Nearby Inventory →
          </Link>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-500">Essential products from local specialist merchants</p>
          </div>
          <Link href="/search" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm hover:border-brand-500 hover:shadow-md transition-all"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 line-clamp-1">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* NEARBY SHOPS WITH INTERACTIVE MAP PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Verified Shops in {currentLocation.city || 'Your Area'}
            </h2>
            <p className="text-sm text-slate-500">Independent merchants with real physical inventory</p>
          </div>
          <Link href="/shops" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View Map & List →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Shop Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nearbyShops.map((shop) => (
              <div
                key={shop._id}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-400 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                      {shop.category}
                    </span>
                    {shop.verificationStatus === 'VERIFIED' && (
                      <Badge type="verified-shop" />
                    )}
                  </div>

                  <Link href={`/shops/${shop._id}`}>
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {shop.businessName}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2">{shop.address}</p>

                  <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
                    <span className="font-medium text-amber-600">★ {shop.rating.toFixed(1)}</span>
                    <span>·</span>
                    <span className="text-slate-500">
                      {shop.openingTime} - {shop.closingTime}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {(shop as any).productCount || 0} Products
                  </span>
                  <Link
                    href={`/shops/${shop._id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Products →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Map Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Local Shop Distribution Map</span>
                <span className="text-slate-500">{nearbyShops.length} shops in zone</span>
              </div>
              <ShopMap
                shops={nearbyShops as any}
                userLocation={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                height="320px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR LOCAL PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Products</h2>
            <p className="text-sm text-slate-500">Fast-moving essentials ready for immediate local dispatch</p>
          </div>
          <Link href="/search" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Browse All Products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {popularProducts.map((prod) => (
            <div
              key={prod._id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{prod.categoryName}</span>
                  <Badge
                    type={
                      prod.availability === 'IN_STOCK'
                        ? 'in-stock'
                        : prod.availability === 'LOW_STOCK'
                        ? 'low-stock'
                        : 'out-of-stock'
                    }
                  />
                </div>

                <Link href={`/products/${prod._id}`}>
                  <h4 className="font-semibold text-sm text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                    {prod.name}
                  </h4>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>

                <div className="text-xs text-slate-500">
                  Shop: <span className="font-medium text-slate-700">{(prod as any).shop?.businessName || 'Local Shop'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-slate-900">₹{prod.price}</span>
                  <span className="text-[11px] text-slate-500"> / {prod.unit}</span>
                </div>

                <Link
                  href={`/products/${prod._id}`}
                  className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THREE VALUE PILLARS (FOR CUSTOMERS / SHOPS / TRAVELLERS) */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">Built for Sustainable Local Ecosystems</h2>
            <p className="text-sm text-slate-400">
              {brandName} aligns incentives so everyone wins: fair prices for buyers, higher margins for shops, and income for travellers on existing journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Customers */}
            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">For Customers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Find it nearby. Get it delivered. No inflated convenience markups, no forced cart minimums. Support local businesses while receiving items smoothly through route pooling.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li>✓ Multi-shop cart checkout</li>
                <li>✓ Real-time route tracking</li>
                <li>✓ Secure 6-digit Delivery OTP</li>
              </ul>
            </div>

            {/* For Shops */}
            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">For Shops & Merchants</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take your local business online with zero technical friction. Control your catalog, retain direct customer loyalty, and never bleed 30% aggregator commissions.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li>✓ Verified Business Badge</li>
                <li>✓ Live Inventory & SKU Manager</li>
                <li>✓ Transparent low platform fee</li>
              </ul>
            </div>

            {/* For Travellers */}
            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-route-500/20 text-route-400">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">For Travellers & Partners</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Earn on the journey you are already making. Declare your planned trip, let our deterministic algorithm pool compatible orders on that exact route, and earn payouts.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li>✓ Locality & KYC verification</li>
                <li>✓ Deterministic route pooling</li>
                <li>✓ Instant earnings upon OTP confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LockBadge() {
  return (
    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
